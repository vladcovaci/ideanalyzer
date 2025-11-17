import { createHash } from "crypto";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateKeywordSeeds } from "@/lib/research/keyword-generator";
import {
  buildLLMKeywordFallback,
  fetchKeywordAnalytics,
} from "@/lib/research/keyword-analytics";
import { captureLLMException } from "@/lib/monitoring";
import type { KeywordAnalyticsResult } from "@/lib/research/types";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const requestSchema = z.object({
  summary: z.string().min(10),
  forceRefresh: z.boolean().optional(),
});

const getCostPerCall = () => {
  const parsed = Number(process.env.KEYWORD_ANALYTICS_COST_PER_CALL ?? "0.35");
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0.35;
};

const hashSummary = (summary: string) =>
  createHash("sha256").update(summary.toLowerCase()).digest("hex");

const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const invalidRequest = (details: unknown) =>
  NextResponse.json(
    { error: "Invalid request payload.", details },
    { status: 400 }
  );

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return unauthorized();
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return invalidRequest("Body must be valid JSON.");
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return invalidRequest(parsed.error.flatten());
  }

  const summary = parsed.data.summary.trim();
  if (!summary) {
    return invalidRequest("Summary cannot be empty.");
  }

  const { forceRefresh = false } = parsed.data;
  const cacheKey = hashSummary(summary);
  const now = new Date();

  if (!forceRefresh) {
    const cached = await prisma.keywordCache.findUnique({
      where: { summaryHash: cacheKey },
    });

    if (cached && cached.expiresAt > now) {
      const cachedResult = cached.result as KeywordAnalyticsResult;
      return NextResponse.json({
        summary,
        keywords: cachedResult,
        seeds: cached.seeds,
        metadata: {
          cacheHit: true,
          costEstimate: cached.costEstimate ?? 0,
          source: cachedResult?.source ?? "cache",
          expiresAt: cached.expiresAt.toISOString(),
        },
      });
    }
  }

  let seeds;
  try {
    seeds = await generateKeywordSeeds(summary);
  } catch (error) {
    captureLLMException(error, {
      stage: "keyword_generation",
      summaryHash: cacheKey,
    });
    seeds = [];
  }

  let keywordResult;
  let costEstimate = 0;
  try {
    keywordResult = await fetchKeywordAnalytics({
      summary,
      keywords: seeds.map((seed) => seed.term),
    });
    costEstimate = keywordResult.source === "provider" ? getCostPerCall() : 0;
  } catch (error) {
    captureLLMException(error, {
      stage: "keyword_provider",
      summaryHash: cacheKey,
    });
    keywordResult = buildLLMKeywordFallback(summary, seeds);
    costEstimate = 0;
  }

  const expiresAt = new Date(Date.now() + CACHE_TTL_MS);

  await prisma.keywordCache.upsert({
    where: { summaryHash: cacheKey },
    create: {
      summaryHash: cacheKey,
      summary,
      result: keywordResult,
      seeds,
      costEstimate,
      expiresAt,
    },
    update: {
      summary,
      result: keywordResult,
      seeds,
      costEstimate,
      expiresAt,
    },
  });

  return NextResponse.json({
    summary,
    keywords: keywordResult,
    seeds,
    metadata: {
      cacheHit: false,
      costEstimate,
      source: keywordResult.source ?? "provider",
      expiresAt: expiresAt.toISOString(),
    },
  });
}
