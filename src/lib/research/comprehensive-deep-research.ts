import { z } from "zod";
import { getOpenAIClient } from "@/lib/openai";
import { parseJSONWithSchema } from "./utils";
import type { ComprehensiveResearchResult, TokenUsage, ClarifyingContext } from "./types";

// Timeout configuration (default 40 minutes, max 1 hour)
const TIMEOUT_SECONDS = Number(process.env.DEEP_RESEARCH_TIMEOUT_SECONDS) || 2400;
export const COMPREHENSIVE_RESEARCH_TIMEOUT_MS = Math.min(TIMEOUT_SECONDS * 1000, 60 * 60 * 1000);
const MAX_RETRIES = 1; // Only allow a single attempt before falling back
// No per-attempt timeout - let it run until overall timeout or completion

// Zod schemas for validation
const descriptionModuleSchema = z.object({
  summary: z.string(),
  targetUser: z.string(),
  valueProposition: z.string(),
});

const identifiedProblemModuleSchema = z.object({
  problem: z.string(),
  targetPersona: z.string(),
  currentSolutions: z.array(z.string()),
  painLevel: z.enum(["low", "medium", "high"]),
});

const whyNowModuleSchema = z.object({
  timingSignals: z.array(z.string()).min(3).max(5),
  enablers: z.array(z.string()),
  catalysts: z.array(z.string()),
  opportunity: z.string(),
});

const proofSignalSchema = z.object({
  description: z.string(),
  evidence: z.string(),
  sources: z.array(z.string()).min(1),
  disclaimer: z.string().optional(),
});

const competitorSchema = z.object({
  name: z.string(),
  description: z.string(),
  positioning: z.string(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  gaps: z.array(z.string()).optional(),
});

const competitionModuleSchema = z.object({
  summary: z.string(),
  density: z.enum(["low", "medium", "high"]),
  competitors: z.array(competitorSchema).min(0),
  gaps: z.array(z.string()),
  disclaimer: z.string().optional(),
});

const keywordInsightSchema = z.object({
  term: z.string(),
  volume: z.number().nullable(),
  growth: z.number().nullable(),
  intent: z.enum(["informational", "navigational", "transactional", "commercial", "other"]),
  trend: z.array(z.object({ date: z.string(), value: z.number() })),
  notes: z.string().optional(),
  cpc: z.number().nullable().optional(),
  competition: z.enum(["LOW", "MEDIUM", "HIGH"]).nullable().optional(),
});

const comprehensiveResearchSchema = z.object({
  description: descriptionModuleSchema,
  identifiedProblem: identifiedProblemModuleSchema,
  whyNow: whyNowModuleSchema,
  proofSignals: z.array(proofSignalSchema).min(5).max(10),
  competition: competitionModuleSchema,
  keywords: z.array(keywordInsightSchema).optional(),
  researchSummary: z.string(),
  marketStage: z.string(),
  disclaimer: z.string(),
});

const buildSystemMessage = () => `
You are Expert Startup Analyst, an AI research partner conducting comprehensive market research on business ideas.

Your mission: Research and validate a startup idea across 5 critical modules using real web data.

## Research Strategy - Use web search to investigate:

### 1. DESCRIPTION MODULE
Objective: Clearly define what this product/service is
- Target user persona (demographics, behaviors, pain points)
- Core value proposition (what problem it solves and how)
- Product positioning (how it's different from existing solutions)

### 2. IDENTIFIED PROBLEM MODULE
Objective: Validate the pain point exists and matters
- Specific problem being solved (who experiences it, when, why it hurts)
- Severity and frequency (how often, how painful, business impact)
- Current workarounds (manual processes, existing tools, status quo)
- Evidence of user frustration (forum posts, complaints, feature requests)

### 3. WHY NOW / OPPORTUNITY MODULE
Objective: Identify timing signals that make THIS the right moment
- Technology enablers (AI, APIs, infrastructure, new capabilities)
- Regulatory changes (compliance, laws, mandates driving adoption)
- Market shifts (behavior changes, COVID impacts, remote work, etc.)
- Economic factors (cost reductions, accessibility, democratization)
- Cultural trends (social media, influencers, viral moments)

### 4. PROOF SIGNALS MODULE (PRIORITY - Find 5-10 signals)
Objective: Find REAL evidence of demand and market validation
Sources to investigate:
- **Reddit discussions** (r/entrepreneur, r/startups, niche subreddits)
- **Hacker News threads** (people complaining about current tools)
- **Product Hunt** (similar products, comments, upvotes)
- **Indie Hackers** (founder discussions about pain points)
- **Twitter/X** (conversations, complaints, feature requests)
- **Funding announcements** (Crunchbase, TechCrunch, VentureBeat)
- **Google Trends** (search interest, growth patterns)
- **GitHub issues** (feature requests on competitor repos)
- **Forum discussions** (Stack Overflow, niche communities)

### 5. COMPETITION MODULE
Objective: Map the competitive landscape
- Direct competitors (3-5 companies solving the same problem)
- Indirect substitutes (manual processes, different approaches)
- For each competitor:
  * Strengths (what they do well)
  * Weaknesses (gaps, complaints, limitations)
  * Differentiation opportunities (what the new idea could do better)
- Competitive density (low/medium/high saturation)

### 6. KEYWORDS MODULE (Optional but valuable)
Objective: Identify search terms indicating demand
- Primary keywords (main search terms)
- Long-tail variations (specific user queries)
- Search intent (informational, commercial, transactional)
- Estimated volume and growth trends

## Output Format (JSON):

{
  "description": {
    "summary": "2-3 sentences defining the product clearly",
    "targetUser": "Specific persona description",
    "valueProposition": "Core benefit and differentiation"
  },
  "identifiedProblem": {
    "problem": "Detailed problem description with severity",
    "targetPersona": "Who experiences this pain",
    "currentSolutions": ["existing workaround 1", "existing workaround 2"],
    "painLevel": "low | medium | high"
  },
  "whyNow": {
    "timingSignals": ["signal 1", "signal 2", "signal 3"],
    "enablers": ["tech/regulatory enabler 1", "enabler 2"],
    "catalysts": ["recent change 1", "recent change 2"],
    "opportunity": "2-3 sentences explaining the timing opportunity"
  },
  "proofSignals": [
    {
      "description": "Specific finding with context",
      "evidence": "Concrete examples, patterns, or metrics",
      "sources": ["https://reddit.com/...", "https://news.ycombinator.com/..."],
      "disclaimer": "optional context about this signal"
    }
  ],
  "competition": {
    "summary": "2-3 sentences on competitive landscape",
    "density": "low | medium | high",
    "competitors": [
      {
        "name": "Competitor name",
        "description": "What they do",
        "positioning": "How they position themselves",
        "strengths": ["strength 1", "strength 2"],
        "weaknesses": ["weakness 1", "weakness 2"],
        "gaps": ["opportunity 1", "opportunity 2"]
      }
    ],
    "gaps": ["overall market gap 1", "overall market gap 2"],
    "disclaimer": "Note about competition data quality"
  },
  "keywords": [
    {
      "term": "keyword phrase",
      "volume": 1000,
      "growth": 25.5,
      "intent": "informational | navigational | transactional | commercial | other",
      "trend": [{"date": "2024-01", "value": 800}, {"date": "2024-02", "value": 1000}],
      "notes": "context about this keyword"
    }
  ],
  "researchSummary": "2-3 sentences summarizing key findings across all modules",
  "marketStage": "established | growth | emerging | pre-trend | saturated + justification",
  "disclaimer": "Note about research methodology and validation needs"
}

## Critical Requirements:
1. **Provide AT LEAST 5 proof signals** (ideally 7-10)
2. **Include specific URLs** for proof signals (actual Reddit threads, HN posts, articles)
3. **Be concrete** - cite real companies, real numbers, real trends
4. **Focus on EVIDENCE** - don't speculate, find real discussions
5. **Cross-reference modules** - ensure insights connect across all 5 areas
6. **Quality sources** - prioritize Reddit, HN, Product Hunt, TechCrunch, Crunchbase
7. **Current data** - focus on recent trends (last 12-24 months)

## Research Process:
1. Search Reddit, Hacker News, Product Hunt for discussions
2. Find competitor websites and analyze their positioning
3. Look for funding announcements and market validation
4. Identify technology/regulatory enablers
5. Map competitive landscape with real companies
6. Synthesize findings into structured modules

Return **only** a JSON object that matches this schema. Do not include markdown, commentary, or code fences.
`.trim();

const buildUserQuery = (ideaSummary: string, clarifyingContext?: ClarifyingContext) => {
  let contextSection = "";

  if (clarifyingContext) {
    const { userAnswers, aiAssumptions, contextSummary } = clarifyingContext;

    const answersText = Object.keys(userAnswers).length > 0
      ? "User-Provided Context:\n" + Object.entries(userAnswers)
          .map(([q, a]) => `- ${q}: ${a}`)
          .join("\n")
      : "";

    const assumptionsText = Object.keys(aiAssumptions).length > 0
      ? "\nAI Assumptions (validate these during research):\n" + Object.entries(aiAssumptions)
          .map(([q, a]) => `- ${q}: ${a}`)
          .join("\n")
      : "";

    contextSection = `\n\n${answersText}${assumptionsText}\n\nResearch Context: ${contextSummary}`;
  }

  return `
Business Idea: ${ideaSummary}${contextSection}

Conduct comprehensive research covering all 5 modules:

1. **Description** - Define the product, target user, and value proposition
2. **Identified Problem** - Validate the pain point with real user evidence
3. **Why Now / Opportunity** - Find timing signals and catalysts
4. **Proof Signals** - Gather 5-10 concrete validation signals with sources
5. **Competition** - Map competitive landscape with real companies

Focus on finding REAL evidence:
- Reddit threads where people discuss this problem
- Hacker News posts about similar pain points
- Product Hunt launches of competitors
- Funding announcements in this space
- Google Trends showing demand
- User complaints and feature requests

Return comprehensive JSON with all modules populated based on web research. Output **only** valid JSON (no markdown or prose).
`.trim();
};

const JSON_REPAIR_MODEL =
  process.env.OPENAI_JSON_REPAIR_MODEL || "gpt-4.1-mini";

const extractResponseText = (response: unknown): string => {
  if (
    response &&
    typeof response === "object" &&
    typeof (response as { output_text?: string }).output_text === "string" &&
    (response as { output_text: string }).output_text.trim()
  ) {
    return (response as { output_text: string }).output_text.trim();
  }

  const collectFromContent = (content: unknown): string => {
    if (!Array.isArray(content)) return "";
    const parts: string[] = [];
    content.forEach((entry) => {
      if (
        entry &&
        typeof entry === "object" &&
        typeof (entry as { text?: string }).text === "string" &&
        (entry as { text: string }).text.trim()
      ) {
        parts.push((entry as { text: string }).text.trim());
      }
    });
    return parts.join("\n").trim();
  };

  if (
    response &&
    typeof response === "object" &&
    Array.isArray((response as { output?: unknown[] }).output)
  ) {
    const parts: string[] = [];
    (response as { output: unknown[] }).output.forEach((item) => {
      if (
        item &&
        typeof item === "object" &&
        (item as { content?: unknown }).content
      ) {
        const text = collectFromContent(
          (item as { content?: unknown }).content
        );
        if (text) {
          parts.push(text);
        }
      }
    });
    return parts.join("\n").trim();
  }

  return "";
};

const repairJSONOutput = async (
  rawText: string,
  schemaDescription: string
): Promise<string | null> => {
  const openai = getOpenAIClient();
  const parserPrompt = `
You convert deep research reports into VALID JSON. Follow the schema exactly.

Schema (required fields):
${schemaDescription}

Rules:
- Output ONLY JSON (no Markdown or commentary)
- Fill missing fields with reasonable placeholders ("Unknown" or [])
- Keep URLs in the sources array.
`.trim();

  try {
    const response = await openai.responses.create({
      model: JSON_REPAIR_MODEL,
      input: [
        {
          role: "developer" as const,
          content: [{ type: "input_text" as const, text: parserPrompt }],
        },
        {
          role: "user" as const,
          content: [{ type: "input_text" as const, text: rawText }],
        },
      ],
      text: { format: { type: "json_object" } },
    });
    const repaired = extractResponseText(response);
    return repaired || null;
  } catch (error) {
    console.error("[Comprehensive Research] JSON repair failed:", error);
    return null;
  }
};

const COMPREHENSIVE_SCHEMA_DESCRIPTION = `
{
  "description": {
    "summary": "string",
    "targetUser": "string",
    "valueProposition": "string"
  },
  "identifiedProblem": {
    "problem": "string",
    "targetPersona": "string",
    "currentSolutions": ["string"],
    "painLevel": "low|medium|high"
  },
  "whyNow": {
    "timingSignals": ["string"],
    "enablers": ["string"],
    "catalysts": ["string"],
    "opportunity": "string"
  },
  "proofSignals": [
    {
      "description": "string",
      "evidence": "string",
      "sources": ["https://example.com/..."],
      "disclaimer": "string (optional)"
    }
  ],
  "competition": {
    "summary": "string",
    "density": "low|medium|high",
    "competitors": [
      {
        "name": "string",
        "description": "string",
        "positioning": "string",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "gaps": ["string"]
      }
    ],
    "gaps": ["string"],
    "disclaimer": "string (optional)"
  },
  "keywords": [
    {
      "term": "string",
      "volume": 0,
      "growth": 0,
      "intent": "informational|navigational|transactional|commercial|other",
      "trend": [{"date": "YYYY-MM", "value": 0}],
      "notes": "string (optional)"
    }
  ],
  "researchSummary": "string",
  "marketStage": "string",
  "disclaimer": "string"
}
`.trim();

const performComprehensiveResearchAttempt = async (
  ideaSummary: string,
  clarifyingContext: ClarifyingContext | undefined,
  abortController: AbortController
): Promise<ComprehensiveResearchResult> => {
  const openai = getOpenAIClient();
  // Use correct model names from OpenAI docs
  const model = process.env.OPENAI_DEEP_RESEARCH_MODEL || "o4-mini-deep-research";

  const response = await openai.responses.create(
    {
      model,
      input: [
        {
          role: "developer" as const,
          content: [{ type: "input_text" as const, text: buildSystemMessage() }],
        },
        {
          role: "user" as const,
          content: [{ type: "input_text" as const, text: buildUserQuery(ideaSummary, clarifyingContext) }],
        },
      ],
      reasoning: { summary: "auto" as const },
      // Background mode recommended for long-running deep research (docs)
      background: process.env.DEEP_RESEARCH_BACKGROUND === "true",
      tools: [
        { type: "web_search_preview" as const },
        // Add code interpreter for analysis (recommended in docs)
        {
          type: "code_interpreter" as const,
          container: { type: "auto" as const }
        },
      ],
      // Note: max_tool_calls not yet available in SDK (coming soon)
      // When available, will allow cost/latency control
      text: { format: { type: "json_object" } },
    },
    { signal: abortController.signal }
  );

  // Extract output from the response
  const outputText = extractResponseText(response);

  if (!outputText) {
    throw new Error("Comprehensive Research did not return structured output.");
  }

  let parsed: z.infer<typeof comprehensiveResearchSchema>;
  try {
    parsed = parseJSONWithSchema(outputText, comprehensiveResearchSchema);
  } catch (error) {
    console.error(
      "[Comprehensive Research] ⚠️ Failed to parse JSON output:",
      outputText.slice(0, 500)
    );
    const repaired = await repairJSONOutput(
      outputText,
      COMPREHENSIVE_SCHEMA_DESCRIPTION
    );
    if (!repaired) {
      throw error;
    }
    parsed = parseJSONWithSchema(repaired, comprehensiveResearchSchema);
  }

  // Count unique sources
  const allSources = new Set<string>();
  parsed.proofSignals.forEach(signal => {
    signal.sources.forEach(source => allSources.add(source));
  });

  const result: ComprehensiveResearchResult = {
    description: parsed.description,
    identifiedProblem: parsed.identifiedProblem,
    whyNow: parsed.whyNow,
    proofSignals: parsed.proofSignals,
    competition: parsed.competition,
    keywords: parsed.keywords,
    researchSummary: parsed.researchSummary,
    marketStage: parsed.marketStage,
    disclaimer: parsed.disclaimer,
    sourcesCount: allSources.size,
  };

  return result;
};

const parseRetryDelay = (errorMessage: string): number | null => {
  const secondsMatch = errorMessage.match(/try again in ([\d.]+)s/i);
  if (secondsMatch) {
    return Math.ceil(parseFloat(secondsMatch[1]) * 1000);
  }
  const msMatch = errorMessage.match(/try again in ([\d.]+)ms/i);
  if (msMatch) {
    return Math.ceil(parseFloat(msMatch[1]));
  }
  return null;
};

export const performComprehensiveDeepResearch = async (
  ideaSummary: string,
  clarifyingContext?: ClarifyingContext,
  { timeoutMs = COMPREHENSIVE_RESEARCH_TIMEOUT_MS }: { timeoutMs?: number } = {}
): Promise<ComprehensiveResearchResult & { usage?: TokenUsage }> => {
  const startTime = Date.now();
  let activeAttemptAbortController: AbortController | null = null;
  let overallTimedOut = false;
  let overallTimeoutError: Error | null = null;

  const timer = setTimeout(() => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.error(`[Comprehensive Research] ⏱️ Timeout after ${elapsed}s (limit: ${timeoutMs / 1000}s)`);
    overallTimedOut = true;
    overallTimeoutError = new Error(
      `Comprehensive Research timed out after ${elapsed} seconds. Try again with a simpler summary.`
    );
    activeAttemptAbortController?.abort(overallTimeoutError);
  }, timeoutMs);

  try {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      if (overallTimedOut && overallTimeoutError) {
        throw overallTimeoutError;
      }

      try {
        const attemptStart = Date.now();
        console.log(`[Comprehensive Research] Attempt ${attempt}/${MAX_RETRIES} starting...`);

        // Create abort controller (only controlled by overall timeout now)
        const attemptAbortController = new AbortController();
        activeAttemptAbortController = attemptAbortController;

        const result = await performComprehensiveResearchAttempt(
          ideaSummary,
          clarifyingContext,
          attemptAbortController
        );
        activeAttemptAbortController = null;

        const duration = Math.round((Date.now() - attemptStart) / 1000);
        console.log(`[Comprehensive Research] ✅ Success in ${duration}s`);
        console.log(`[Comprehensive Research] 📊 Found ${result.proofSignals.length} proof signals from ${result.sourcesCount} sources`);

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const errorMessage = lastError.message;
        const attemptDuration = Math.round((Date.now() - startTime) / 1000);

        // Check if it's the overall timeout
        if (overallTimedOut || lastError.name === 'AbortError') {
          console.error(`[Comprehensive Research] ❌ Overall timeout reached (${attemptDuration}s)`);
          throw lastError;
        }

        // Check if it's a rate limit error
        const isRateLimit = errorMessage.includes("429") || errorMessage.includes("Rate limit");

        if (isRateLimit && attempt < MAX_RETRIES) {
          const retryDelay = parseRetryDelay(errorMessage);
          const waitTime = retryDelay || (attempt * 2000);

          console.log(`[Comprehensive Research] Rate limit hit. Waiting ${waitTime}ms before retry ${attempt + 1}/${MAX_RETRIES}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        // For other errors, log and retry (if retries left)
        console.error(`[Comprehensive Research] ❌ Error on attempt ${attempt}:`, errorMessage);

        if (attempt < MAX_RETRIES) {
          console.log(`[Comprehensive Research] Retrying with attempt ${attempt + 1}/${MAX_RETRIES}...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }

        // Out of retries
        throw error;
      }
    }

    throw lastError || new Error("Comprehensive Research failed after all retry attempts");
  } finally {
    clearTimeout(timer);
  }
};
