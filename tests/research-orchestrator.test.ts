import test from "node:test";
import assert from "node:assert/strict";
import { orchestrateResearchBrief } from "../src/lib/research/orchestrator";
import type {
  CompetitionAnalysis,
  KeywordAnalyticsResult,
  ProofSignal,
  ResearchError,
} from "../src/lib/research/types";

const BASE_INPUT = {
  summary:
    "AI-powered analyst that converts founder interviews into structured market research with keywords, proof signals, and competition mapping.",
  userId: "user-123",
};

const usage = (prompt: number, completion: number) => ({
  promptTokens: prompt,
  completionTokens: completion,
  totalTokens: prompt + completion,
});

const competition: CompetitionAnalysis = {
  summary: "Direct and indirect players exist.",
  competitiveDensity: "medium",
  disclaimer: "AI generated sample",
  competitors: [
    {
      name: "Idea Browser",
      description: "Async research concierge",
      positioning: "High-touch concierge research",
      strengths: ["White-glove support"],
      weaknesses: ["Slow turnaround"],
      gaps: ["Realtime generation"],
    },
  ],
};

const keywords: KeywordAnalyticsResult = {
  primaryKeyword: "ai research brief",
  totalSearchVolume: 1200,
  averageGrowth: 12,
  history: [],
  keywords: [
    {
      term: "ai market research",
      volume: 600,
      growth: 14,
      intent: "commercial",
      trend: [],
    },
  ],
};

const proofSignals = {
  proofSignals: [
    {
      description: "VC funding for AI research tools doubled YoY.",
      evidence: "Pitchbook tracked $2.1B invested in 2024.",
      sources: ["https://example.com/funding"],
    },
  ],
  disclaimer: "Deep research snapshot",
};

test("orchestrateResearchBrief aggregates component responses", async () => {
  const response = await orchestrateResearchBrief(BASE_INPUT, {
    classify: async () => ({
      data: {
        industry: "SaaS",
        businessType: "B2B",
        confidence: "high",
      },
      usage: usage(12, 4),
    }),
    describe: async () => ({
      data: { description: "Structured co-pilot for instant research." },
      usage: usage(6, 3),
    }),
    problem: async () => ({
      data: {
        problem:
          "Founders cannot afford bespoke research for every iteration.",
        whyNow: ["AI inference costs dropped", "Macro volatility needs faster validation"],
      },
      usage: usage(8, 5),
    }),
    competition: async () => ({
      data: competition,
      usage: usage(9, 6),
    }),
    keywords: async () => ({
      data: keywords,
    }),
    proofSignals: async () => ({
      data: proofSignals,
      usage: usage(15, 10),
    }),
    proofSignalsFallback: async () => ({
      data: proofSignals,
    }),
  });

  assert.equal(response.errors.length, 0);
  assert.equal(response.result.industryTag, "SaaS");
  assert.equal(response.result.businessType, "B2B");
  assert.equal(response.result.whyNow.length, 2);
  assert.equal(response.result.competition.competitors.length, 1);
  assert.equal(response.result.proofSignals.length, 1);

  assert.deepEqual(response.tokenUsage.components.classification, usage(12, 4));
  assert.equal(response.tokenUsage.total.totalTokens, 12 + 4 + 6 + 3 + 8 + 5 + 9 + 6 + 15 + 10);
});

test("orchestrateResearchBrief captures errors and fallbacks", async () => {
  const classificationError: ResearchError = {
    component: "classification",
    message: "LLM offline",
    retryable: true,
  };

  const keywordError: ResearchError = {
    component: "keywords",
    message: "Provider missing",
    retryable: false,
  };

  const proofFallbackSignal: ProofSignal = {
    description: "LLM fallback signal",
    evidence: "Derived from cached data.",
    sources: ["https://example.com/fallback"],
  };

  const response = await orchestrateResearchBrief(BASE_INPUT, {
    classify: async () => ({
      error: classificationError,
      usage: usage(3, 2),
    }),
    describe: async () => ({
      data: { description: "Fallback description." },
    }),
    problem: async () => ({
      error: {
        component: "problemAnalysis",
        message: "timeout",
        retryable: true,
      },
    }),
    competition: async () => ({
      data: competition,
    }),
    keywords: async () => ({
      data: keywords,
      error: keywordError,
    }),
    proofSignals: async () => {
      throw new Error("Deep research timeout");
    },
    proofSignalsFallback: async () => ({
      data: {
        proofSignals: [proofFallbackSignal],
        disclaimer: "LLM fallback used",
      },
      usage: usage(4, 4),
      error: {
        component: "proofSignals",
        message: "Fallback executed",
        retryable: true,
      },
    }),
  });

  const errorComponents = response.errors.map((entry) => entry.component);

  assert.ok(errorComponents.includes("classification"));
  assert.ok(errorComponents.includes("keywords"));
  assert.ok(errorComponents.includes("proofSignals"));

  assert.equal(response.result.industryTag, "Uncategorized");
  assert.equal(response.result.businessType, "Unknown");
  assert.equal(response.result.proofSignals[0].description, "LLM fallback signal");

  assert.equal(
    response.tokenUsage.components.proofSignals?.totalTokens,
    8
  );
  assert.equal(response.tokenUsage.total.totalTokens, 3 + 2 + 4 + 4);
});
