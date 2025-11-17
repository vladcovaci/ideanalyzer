import { getDeepResearchClient } from "@/lib/openai";
import type { ProofSignal, TokenUsage } from "./types";
import type { Response } from "openai/resources/responses/responses";

const TIMEOUT_SECONDS = Number(process.env.DEEP_RESEARCH_TIMEOUT_SECONDS) || 1200;
export const DEEP_RESEARCH_TIMEOUT_MS = TIMEOUT_SECONDS * 1000;

const POLL_INTERVAL_MS = 3000;

const DEFAULT_PROOF_SIGNAL_DISCLAIMER =
  "Generated using OpenAI Deep Research. Validate sources manually.";

export type DeepResearchResponse = {
  proofSignals: ProofSignal[];
  disclaimer?: string;
  summary?: string;
  marketStage?: string;
  usage?: TokenUsage;
};

/* ---------------------------------------
   MAIN: performDeepResearch
---------------------------------------- */
export const performDeepResearch = async (
  summary: string,
  { timeoutMs = DEEP_RESEARCH_TIMEOUT_MS }: { timeoutMs?: number } = {}
): Promise<DeepResearchResponse> => {
  const client = getDeepResearchClient();
  const start = Date.now();

  console.log("[Deep Research] Creating request...");

  const systemPrompt = `Find 5-10 proof signals for this startup idea using web search. Return ONLY valid JSON:
{
  "proofSignals": [
    {"description": "finding", "evidence": "details", "sources": ["https://..."]}
  ],
  "summary": "2 sentence overview",
  "marketStage": "emerging|growth|saturated"
}`;

  const model = process.env.OPENAI_DEEP_RESEARCH_MODEL || "o4-mini-deep-research";

  let result: Response;

  try {
    console.log("[Deep Research] Creating background job with model:", model);

    // Use background: true to get job ID immediately (1-2 seconds)
    // This prevents timeout on initial request
    // Requires store: true to enable background mode
    const job = await client.responses.create({
      model,
      background: true, // KEY FIX: Queue job asynchronously
      store: true, // Required for background mode
      input: [
        { role: "developer", content: [{ type: "input_text", text: systemPrompt }] },
        { role: "user", content: [{ type: "input_text", text: summary }] },
      ],
      tools: [{ type: "web_search_preview" }],
      reasoning: { summary: "auto" },
      text: { format: { type: "json_object" } },
    });

    console.log("[Deep Research] ✓ Job created, ID:", job.id);
    console.log("[Deep Research] Initial status:", job.status);

    // Start polling immediately
    result = await client.responses.retrieve(job.id);
    console.log("[Deep Research] Retrieved status:", result.status);

  } catch (error) {
    console.error("[Deep Research] ❌ Request failed:", error);

    if (error && typeof error === "object") {
      const { message, status, code, type, error: innerError } = error as {
        message?: string;
        status?: number;
        code?: string;
        type?: string;
        error?: unknown;
        response?: unknown;
      };

      console.error("[Deep Research] Error details:", {
        message,
        status,
        code,
        type,
        innerError,
      });

      if ("response" in error) {
        console.error("[Deep Research] API Response:", (error as { response?: unknown }).response);
      }
    }

    const fallbackMessage =
      error instanceof Error ? error.message : "Unknown error";
    return fallbackDeepResearch(summary, `Request failed: ${fallbackMessage}`);
  }

  // Polling loop - wait for job to complete
  while (result.status === "queued" || result.status === "in_progress") {
    if (Date.now() - start > timeoutMs) {
      const elapsed = Math.round((Date.now() - start) / 1000);
      console.error(`[Deep Research] ❌ Timeout after ${elapsed}s`);
      return fallbackDeepResearch(summary, "Timeout");
    }

    await sleep(POLL_INTERVAL_MS);
    result = await client.responses.retrieve(result.id);
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(`[Deep Research] Polling (${elapsed}s elapsed)... status: ${result.status}`);
  }

  if (result.status === "failed") {
    console.error("[Deep Research] ❌ Deep Research failed:", result.error);
    return fallbackDeepResearch(summary, "Failed status");
  }

  // Extract text
  const text = extractText(result);
  if (!text.trim()) {
    console.error("[Deep Research] ❌ No output text");
    return fallbackDeepResearch(summary, "No output");
  }

  // Try parsing JSON
  try {
    const parsed = JSON.parse(text);

    return {
      summary: parsed.summary || "",
      proofSignals: parsed.proofSignals || [],
      marketStage: parsed.marketStage || "unknown",
      disclaimer: DEFAULT_PROOF_SIGNAL_DISCLAIMER,
      usage: extractUsage(result),
    };
  } catch {
    console.warn("[Deep Research] ⚠️ JSON parse failed, using fallback parsers");
  }

  // Fallback heuristic parsing
  const signals = extractProofSignalsHeuristically(text);
  const finalSummary = extractSummaryHeuristically(text);

  return {
    summary: finalSummary,
    proofSignals: signals,
    marketStage: detectMarketStage(finalSummary),
    disclaimer: DEFAULT_PROOF_SIGNAL_DISCLAIMER,
    usage: extractUsage(result),
  };
};

/* ---------------------------------------
   TEXT EXTRACTION (FIXED FOR NEW RESPONSES API)
---------------------------------------- */
const extractText = (response: Response): string => {
  if (!Array.isArray(response.output)) {
    console.error("[Deep Research] No output[]");
    return "";
  }

  const collected: string[] = [];

  for (const item of response.output) {
    if (item.type !== "message") continue;
    if (!item.content) continue;

    for (const block of item.content) {
      if (block.type === "output_text" && typeof block.text === "string") {
        collected.push(block.text.trim());
      }
    }
  }

  const result = collected.join("\n").trim();

  if (!result) {
    console.error("[Deep Research] ⚠️ No output_text blocks found");
  }

  return result;
};

/* ---------------------------------------
   TOKEN USAGE
---------------------------------------- */
const extractUsage = (response: Response): TokenUsage | undefined => {
  if (!response.usage) return undefined;

  return {
    promptTokens: response.usage.input_tokens ?? 0,
    completionTokens: response.usage.output_tokens ?? 0,
    totalTokens: response.usage.total_tokens ?? 0,
  };
};

/* ---------------------------------------
   FALLBACK TEXT PARSERS
---------------------------------------- */
const extractSummaryHeuristically = (text: string): string =>
  text.split("\n\n")[0].trim();

const extractProofSignalsHeuristically = (text: string): ProofSignal[] => {
  const signals: ProofSignal[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    const urls = [...line.matchAll(/https?:\/\/\S+/g)].map((m) => m[0]);
    if (urls.length === 0) continue;

    signals.push({
      description: line.replace(urls[0], "").trim(),
      evidence: line.trim(),
      sources: urls,
    });
  }

  return signals;
};

/* ---------------------------------------
   MARKET STAGE
---------------------------------------- */
const detectMarketStage = (summary: string): string => {
  const s = summary.toLowerCase();
  if (s.includes("early")) return "emerging";
  if (s.includes("growth")) return "growth";
  if (s.includes("crowded") || s.includes("saturated")) return "saturated";
  return "unknown";
};

/* ---------------------------------------
   FALLBACK
---------------------------------------- */
const fallbackDeepResearch = (
  summary: string,
  reason: string
): DeepResearchResponse => ({
  summary: summary.slice(0, 200) + ` (fallback: ${reason})`,
  proofSignals: [],
  marketStage: "unknown",
  disclaimer:
    "Deep Research unavailable — fallback summary provided. No proof signals extracted.",
});

/* ---------------------------------------
   UTIL
---------------------------------------- */
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
