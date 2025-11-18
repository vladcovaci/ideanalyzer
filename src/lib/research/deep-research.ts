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

export type DeepResearchBackgroundResponse = {
  jobId: string;
  status: "queued" | "in_progress";
};

/* ---------------------------------------
   MAIN: performDeepResearch
---------------------------------------- */
export const performDeepResearch = async (
  summary: string,
  {
    timeoutMs = DEEP_RESEARCH_TIMEOUT_MS,
    background = false
  }: {
    timeoutMs?: number;
    background?: boolean;
  } = {}
): Promise<DeepResearchResponse | DeepResearchBackgroundResponse> => {
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

    // If background mode, return job ID immediately without polling
    if (background) {
      console.log("[Deep Research] Background mode enabled - returning job ID immediately");
      return {
        jobId: job.id,
        status: job.status as "queued" | "in_progress",
      };
    }

    // Start polling immediately (synchronous mode)
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
  console.log("[Deep Research] Extracting text from response...");
  const text = extractText(result);

  if (!text.trim()) {
    console.error("[Deep Research] ❌ No output text found");
    console.error("[Deep Research] Response ID:", result.id);
    console.error("[Deep Research] Response status:", result.status);
    return fallbackDeepResearch(summary, "No output");
  }

  console.log(`[Deep Research] ✓ Extracted ${text.length} characters of text`);
  console.log("[Deep Research] First 200 chars:", text.slice(0, 200));

  // Try parsing JSON
  try {
    console.log("[Deep Research] Attempting to parse JSON...");
    const parsed = JSON.parse(text);

    console.log("[Deep Research] ✓ JSON parsed successfully");
    console.log("[Deep Research] Proof signals found:", parsed.proofSignals?.length || 0);

    return {
      summary: parsed.summary || "",
      proofSignals: parsed.proofSignals || [],
      marketStage: parsed.marketStage || "unknown",
      disclaimer: DEFAULT_PROOF_SIGNAL_DISCLAIMER,
      usage: extractUsage(result),
    };
  } catch (parseError) {
    console.warn("[Deep Research] ⚠️ JSON parse failed:", parseError instanceof Error ? parseError.message : String(parseError));
    console.warn("[Deep Research] Text that failed to parse:", text.slice(0, 500));
    console.warn("[Deep Research] Using fallback heuristic parsers");
  }

  // Fallback heuristic parsing
  const signals = extractProofSignalsHeuristically(text);
  const finalSummary = extractSummaryHeuristically(text);

  console.log(`[Deep Research] Heuristic parsing found ${signals.length} proof signals`);

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
  // Method 1: Use the convenient output_text field (recommended by OpenAI)
  // This field automatically extracts all text from the response
  if (response.output_text && typeof response.output_text === "string") {
    const text = response.output_text.trim();
    if (text) {
      console.log("[Deep Research] ✓ Extracted text from output_text field:", text.slice(0, 100) + "...");
      return text;
    }
  }

  // Method 2: Fallback to parsing the output array manually
  if (!Array.isArray(response.output)) {
    console.error("[Deep Research] No output[] array and no output_text field");
    console.error("[Deep Research] Response structure:", JSON.stringify({
      id: response.id,
      status: response.status,
      hasOutputText: !!response.output_text,
      hasOutput: !!response.output,
      outputType: Array.isArray(response.output) ? 'array' : typeof response.output
    }, null, 2));
    return "";
  }

  console.log(`[Deep Research] Parsing output array with ${response.output.length} items`);

  const collected: string[] = [];

  for (let i = 0; i < response.output.length; i++) {
    const item = response.output[i];
    console.log(`[Deep Research] Output item ${i}: type=${item.type}`);

    // Skip non-message items (like reasoning, tool calls, etc.)
    if (item.type !== "message") continue;
    if (!item.content) {
      console.warn(`[Deep Research] Message item ${i} has no content`);
      continue;
    }

    console.log(`[Deep Research] Message item ${i} has ${item.content.length} content blocks`);

    for (let j = 0; j < item.content.length; j++) {
      const block = item.content[j];
      console.log(`[Deep Research] Content block ${j}: type=${block.type}`);

      if (block.type === "output_text" && typeof block.text === "string") {
        collected.push(block.text.trim());
        console.log(`[Deep Research] ✓ Extracted ${block.text.length} chars from content block ${j}`);
      }
    }
  }

  const result = collected.join("\n").trim();

  if (!result) {
    console.error("[Deep Research] ⚠️ No output_text blocks found in array parsing");
    console.error("[Deep Research] Full response.output structure:", JSON.stringify(response.output, null, 2));
  } else {
    console.log(`[Deep Research] ✓ Extracted ${result.length} total chars from output array`);
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
   CHECK JOB STATUS (for background jobs)
---------------------------------------- */
export const checkDeepResearchStatus = async (
  jobId: string
): Promise<DeepResearchResponse & { status: string; isComplete: boolean }> => {
  const client = getDeepResearchClient();

  try {
    const result = await client.responses.retrieve(jobId);
    console.log(`[Deep Research] Job ${jobId} status: ${result.status}`);

    // Still processing
    if (result.status === "queued" || result.status === "in_progress") {
      return {
        status: result.status,
        isComplete: false,
        proofSignals: [],
        disclaimer: "Research in progress",
      };
    }

    // Failed
    if (result.status === "failed") {
      console.error("[Deep Research] Job failed:", result.error);
      return {
        status: "failed",
        isComplete: true,
        proofSignals: [],
        disclaimer: "Deep Research failed",
        summary: result.error?.message || "Research failed",
      };
    }

    // Completed - extract results
    console.log(`[Deep Research] Job ${jobId} completed - extracting results`);
    const text = extractText(result);

    if (!text.trim()) {
      console.error(`[Deep Research] Job ${jobId} completed but has no output text`);
      return {
        status: "completed",
        isComplete: true,
        proofSignals: [],
        disclaimer: "No output from deep research",
      };
    }

    console.log(`[Deep Research] Job ${jobId} extracted ${text.length} chars`);

    // Parse JSON
    try {
      console.log(`[Deep Research] Job ${jobId} parsing JSON...`);
      const parsed = JSON.parse(text);
      console.log(`[Deep Research] Job ${jobId} ✓ parsed successfully with ${parsed.proofSignals?.length || 0} signals`);

      return {
        status: "completed",
        isComplete: true,
        summary: parsed.summary || "",
        proofSignals: parsed.proofSignals || [],
        marketStage: parsed.marketStage || "unknown",
        disclaimer: DEFAULT_PROOF_SIGNAL_DISCLAIMER,
        usage: extractUsage(result),
      };
    } catch (parseError) {
      console.warn(`[Deep Research] Job ${jobId} JSON parse failed:`, parseError instanceof Error ? parseError.message : String(parseError));
      console.warn(`[Deep Research] Job ${jobId} using fallback heuristic parsing`);

      // Fallback heuristic parsing
      const signals = extractProofSignalsHeuristically(text);
      const finalSummary = extractSummaryHeuristically(text);

      console.log(`[Deep Research] Job ${jobId} heuristic parsing found ${signals.length} signals`);

      return {
        status: "completed",
        isComplete: true,
        summary: finalSummary,
        proofSignals: signals,
        marketStage: detectMarketStage(finalSummary),
        disclaimer: DEFAULT_PROOF_SIGNAL_DISCLAIMER,
        usage: extractUsage(result),
      };
    }
  } catch (error) {
    console.error("[Deep Research] Error checking status:", error);
    return {
      status: "error",
      isComplete: true,
      proofSignals: [],
      disclaimer: "Error checking research status",
      summary: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/* ---------------------------------------
   UTIL
---------------------------------------- */
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
