import { z } from "zod";
import { captureLLMException } from "@/lib/monitoring";
import { getOpenAIClient } from "@/lib/openai";
import { performDeepResearch } from "./deep-research";
import {
  fetchKeywordAnalytics,
  buildFallbackKeywordAnalytics,
  buildLLMKeywordFallback,
} from "./keyword-analytics";
import { generateKeywordSeeds } from "./keyword-generator";
import {
  buildResearchError,
  parseJSONWithSchema,
  sumUsage,
  usageFromOpenAI,
} from "./utils";
import type {
  ComponentResult,
  CompetitionAnalysis,
  IndustryClassification,
  KeywordAnalyticsResult,
  ProblemWhyNowAnalysis,
  ProofSignal,
  ProofSignalsBundle,
  ResearchBriefResult,
  ResearchComponent,
  ResearchError,
  ResearchGenerationInput,
  ResearchOrchestrationResponse,
  TokenUsage,
} from "./types";

const OPENAI_RESEARCH_MODEL =
  process.env.OPENAI_RESEARCH_MODEL || "gpt-4o-mini";
const OPENAI_DESCRIPTION_MODEL =
  process.env.OPENAI_DESCRIPTION_MODEL || OPENAI_RESEARCH_MODEL;

const INDUSTRY_OPTIONS = [
  "FinTech",
  "HealthTech",
  "SaaS",
  "EdTech",
  "E-commerce",
  "MarketPlace",
  "AI/ML",
  "Climate Tech",
  "Consumer",
  "Enterprise",
  "Other",
] as const;
const FALLBACK_INDUSTRY = "Uncategorized";

const CLASSIFICATION_EXAMPLES = [
  {
    idea:
      "Scheduling OS that automates back-office work for independent dental practices.",
    classification: {
      industry: "SaaS",
      businessType: "B2B",
      confidence: "high",
    },
    reasoning:
      "Buying motion is dental admins (business) adopting workflow SaaS.",
  },
  {
    idea:
      "Guided mindfulness app that rewards Gen-Z gamers for short breathing quests.",
    classification: {
      industry: "Consumer",
      businessType: "B2C",
      confidence: "medium",
    },
    reasoning:
      "Mobile experience for individual consumers; mindfulness is a consumer wellness category.",
  },
  {
    idea:
      "API that enriches e-commerce customer data with AI/ML propensity models used by Shopify merchants and their shoppers.",
    classification: {
      industry: "E-commerce",
      businessType: "B2B2C",
      confidence: "medium",
    },
    reasoning:
      "Tool is sold to merchants (B2B) but influences end-consumer personalization, so B2B2C is most accurate.",
  },
  {
    idea:
      "Community podcast where makers debate the future of work without a clear product attached.",
    classification: {
      industry: "Other",
      businessType: "B2C",
      confidence: "low",
    },
    reasoning:
      "Insufficient product detail, so default to Other and explain uncertainty.",
  },
];

const buildClassificationPrompt = () => {
  const examples = CLASSIFICATION_EXAMPLES.map(
    (example, index) => `
### Example ${index + 1}
Idea: ${example.idea}
Classification JSON: ${JSON.stringify(example.classification)}
Reasoning: ${example.reasoning}
`.trim()
  ).join("\n\n");

  return `
You are a precise startup classification analyst. Your task is to map a founder's idea to:
- Industry options: ${INDUSTRY_OPTIONS.join(", ")}.
- Business model: B2B, B2C, or B2B2C.

Rules:
1. Pick the closest industry from the list. If none apply, output "Other" and explain briefly in the rationale.
2. Business model definitions:
   - B2B: primary paying customer is a business/organization.
   - B2C: product sold directly to consumers.
   - B2B2C: sold to businesses but value and adoption rely on the end consumer.
3. Provide a confidence score:
   - "high": direct match and abundant detail.
   - "medium": multiple plausible categories or moderate context.
   - "low": limited context; rely on heuristics.
4. Respond within a single JSON object:
   { "industry": "...", "businessType": "...", "confidence": "high|medium|low", "rationale": "1 sentence" }.
5. If you cannot classify confidently, choose "Other" and describe why in the rationale.

Few-shot references:
${examples}

Be concise—your entire response should be under 120 tokens to keep latency low (finish within ~5 seconds).
`.trim();
};

const classificationSchema = z.object({
  industry: z.string(),
  businessType: z.string(),
  confidence: z.enum(["high", "medium", "low"]).catch("medium"),
  rationale: z.string().optional(),
});

const descriptionSchema = z.object({
  description: z.string(),
});

const problemSchema = z.object({
  problem: z.string(),
  whyNow: z.array(z.string()).min(3).max(7), // Increased to match prompt (5-7 signals)
});

const competitorSchema = z.object({
  name: z.string(),
  description: z.string(),
  positioning: z.string(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  gaps: z.array(z.string()).optional(),
});

const competitionSchema = z.object({
  summary: z.string(),
  competitiveDensity: z.enum(["low", "medium", "high"]),
  disclaimer: z.string().optional(),
  competitors: z.array(competitorSchema).min(0),
});

const proofSignalsSchema = z.object({
  proofSignals: z.array(
    z.object({
      description: z.string(),
      evidence: z.string(),
      sources: z.array(z.string()),
    })
  ),
  disclaimer: z.string().optional(),
});

type StructuredPromptOptions<T> = {
  component: ResearchComponent;
  schema: z.ZodType<T>;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  model?: string;
};

const CLASSIFICATION_SYSTEM_PROMPT = buildClassificationPrompt();

const normalizeIndustry = (industry: string): string => {
  if (
    industry.toLowerCase() === FALLBACK_INDUSTRY.toLowerCase()
  ) {
    return FALLBACK_INDUSTRY;
  }

  const match = INDUSTRY_OPTIONS.find(
    (candidate) => candidate.toLowerCase() === industry.toLowerCase()
  );

  if (match) return match;

  if (industry.toLowerCase() === "other") {
    return "Other";
  }

  return industry || FALLBACK_INDUSTRY;
};

const normalizeBusinessType = (businessType: string): string => {
  const normalized = businessType.toUpperCase();
  if (
    normalized === "B2B" ||
    normalized === "B2C" ||
    normalized === "B2B2C"
  ) {
    return normalized;
  }
  if (normalized === "UNKNOWN") {
    return "Unknown";
  }
  return "B2C";
};

const requestStructuredJSON = async <T>(
  options: StructuredPromptOptions<T>
): Promise<ComponentResult<T>> => {
  const openai = getOpenAIClient();

  try {
    const completion = await openai.chat.completions.create({
      model: options.model ?? OPENAI_RESEARCH_MODEL,
      temperature:
        typeof options.temperature === "number" ? options.temperature : 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: options.userPrompt },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const data = parseJSONWithSchema(content, options.schema);

    return {
      data,
      usage: usageFromOpenAI(completion.usage),
    };
  } catch (error) {
    captureLLMException(error, {
      stage: options.component,
    });

    return {
      error: buildResearchError(
        options.component,
        error instanceof Error ? error.message : "Unknown LLM error"
      ),
    };
  }
};

const fallbackClassification = (): IndustryClassification => ({
  industry: FALLBACK_INDUSTRY,
  businessType: "Unknown",
  confidence: "low",
  rationale: "Classification temporarily unavailable; using generic tag.",
});

const fallbackProblem = (summary: string): ProblemWhyNowAnalysis => ({
  problem: `Founders are exploring "${summary.slice(0, 120)}" and need clarity on the specific pain points.`,
  whyNow: [
    "Acceleration of AI capabilities enabling faster product cycles.",
    "Post-pandemic shifts in customer behavior increasing demand.",
    "Funding and infrastructure costs make experimentation accessible.",
  ],
});

const fallbackCompetition = (summary: string): CompetitionAnalysis => ({
  summary: `Competition data is limited for "${summary.slice(
    0,
    80
  )}". Use as directional insight only.`,
  competitiveDensity: "medium",
  competitors: [
    {
      name: "Manual workflows",
      description: "Teams rely on manual research and spreadsheets.",
      positioning: "High-quality but slow, expensive, and inconsistent.",
      strengths: ["Custom insights", "Personal expertise"],
      weaknesses: ["Slow turnaround", "High cost", "Not scalable"],
      gaps: ["Automation", "Realtime validation"],
    },
    {
      name: "General-purpose AI assistants",
      description: "Horizontal AI tools providing generic research summaries.",
      positioning: "Fast but lacks structured research rigor.",
      strengths: ["Speed", "Broad availability"],
      weaknesses: ["Limited domain depth", "Accuracy concerns"],
      gaps: ["Domain-specific prompts", "Source verification"],
    },
  ],
  disclaimer: "Competition derived from fallback heuristics.",
});

const fallbackProofSignals = (summary: string): ProofSignal[] => {
  const truncated = summary.slice(0, 120);
  return [
    {
      description: `Increased investor attention toward solutions similar to "${truncated}".`,
      evidence:
        "Recent funding rounds in adjacent categories signal strong market belief.",
      sources: [
        "https://news.crunchbase.com",
        "https://techcrunch.com/category/startups/",
      ],
      disclaimer: "Fallback proof signal generated without live research.",
    },
    {
      description: "Search interest indicates rising curiosity and demand.",
      evidence:
        "Keyword trend data suggests steady growth over the last 12 months.",
      sources: ["https://trends.google.com", "https://explodingtopics.com"],
      disclaimer: "Based on general market trend assumptions.",
    },
    {
      description: "Community chatter shows unresolved founder pain points.",
      evidence:
        "Discussions on founder communities highlight similar unmet needs.",
      sources: ["https://www.indiehackers.com", "https://www.producthunt.com"],
      disclaimer: "Fallback evidence derived from public founder forums.",
    },
  ];
};

const mergeErrors = (
  accumulator: ResearchError[],
  result: ComponentResult<unknown>
) => {
  if (result.error) {
    accumulator.push(result.error);
  }
};

const registerUsage = (
  usageMap: Partial<Record<ResearchComponent, TokenUsage>>,
  component: ResearchComponent,
  result: ComponentResult<unknown>
) => {
  if (!result.usage) return;
  const existing = usageMap[component];
  if (!existing) {
    usageMap[component] = result.usage;
    return;
  }

  usageMap[component] = {
    promptTokens: existing.promptTokens + result.usage.promptTokens,
    completionTokens:
      existing.completionTokens + result.usage.completionTokens,
    totalTokens: existing.totalTokens + result.usage.totalTokens,
  };
};

const executeClassification = async (
  summary: string
): Promise<ComponentResult<IndustryClassification>> => {
  const result = await requestStructuredJSON({
    component: "classification",
    schema: classificationSchema,
    systemPrompt: CLASSIFICATION_SYSTEM_PROMPT,
    userPrompt: `
Idea summary:
"""${summary}"""

Instructions:
- Choose one industry from the list (or "Other" if unsure) and explain in the rationale.
- Identify the business model (B2B, B2C, B2B2C) based on who pays for the product.
- Keep the rationale to one sentence referencing the summary context.
`.trim(),
    temperature: 0.2,
  });

  if (result.data) {
    result.data = {
      industry: normalizeIndustry(result.data.industry),
      businessType: normalizeBusinessType(result.data.businessType),
      confidence: result.data.confidence,
      rationale: result.data.rationale,
    };
  } else if (!result.error) {
    result.data = fallbackClassification();
  } else {
    result.data = fallbackClassification();
  }

  return result;
};

const executeDescription = async (
  summary: string
): Promise<ComponentResult<{ description: string }>> =>
  requestStructuredJSON({
    component: "description",
    schema: descriptionSchema,
    systemPrompt: `You are a startup analyst. Expand the provided idea summary into a comprehensive 3-4 sentence description that includes:
- Specific target user persona (demographics, behaviors, pain points)
- Clear value proposition (what problem it solves and how)
- Key use cases or scenarios
- What makes it differentiated from existing solutions

Provide concrete details and specifics, not generic statements.`,
    userPrompt: `Startup idea summary:\n"""${summary}"""\n\nExpand this into a detailed, comprehensive description.`,
    temperature: 0.5,
    model: OPENAI_DESCRIPTION_MODEL,
  });

const PROBLEM_PROMPT = `
You are a startup analyst. Expand the provided idea summary with deeper problem analysis and market timing insights.

Output JSON:
{
  "problem": "3-5 sentences analyzing WHO experiences the pain (specific persona), HOW SEVERE it is (frequency, impact, costs), WHAT they do today (current solutions/workarounds), and WHY current solutions fail.",
  "whyNow": [
    "5-7 specific timing signals explaining why NOW is the right moment for this solution. Include: technology enablers, regulatory changes, market shifts, behavior changes, economic factors, or cultural trends. Be concrete with examples."
  ]
}

Guidelines:
1. START with the idea summary, then EXPAND with deeper analysis and logical inferences
2. For "problem": Analyze severity, frequency, financial/emotional impact, and failure modes of current solutions
3. For "whyNow": Identify concrete catalysts - new tech (AI, mobile, APIs), regulations, COVID impacts, generational shifts, cost reductions, etc.
4. Be specific with examples: Instead of "technology is advancing" → "ChatGPT API makes personalized advice accessible at $0.002/1K tokens"
5. ALWAYS provide analysis - make reasonable inferences based on the idea context
6. DO NOT ask for more context - expand what's provided
`.trim();

const executeProblemAnalysis = async (
  summary: string
): Promise<ComponentResult<ProblemWhyNowAnalysis>> => {
  const result = await requestStructuredJSON({
    component: "problemAnalysis",
    schema: problemSchema,
    systemPrompt: PROBLEM_PROMPT,
    userPrompt: `
Startup idea summary:
"""${summary}"""

Expand this summary with deeper problem analysis and comprehensive "Why Now" timing signals. Provide detailed, specific insights based on the idea context.
`.trim(),
    temperature: 0.5,
  });

  // Fallback if no data returned
  if (!result.data) {
    result.data = fallbackProblem(summary);
  }

  return result;
};

const executeCompetitionAnalysis = async (
  summary: string
): Promise<ComponentResult<CompetitionAnalysis>> => {
  const COMPETITION_PROMPT = `
You are a competitive intelligence analyst. Expand the provided startup idea with comprehensive competitive landscape analysis.

Deliver JSON:
{
  "summary": "3-4 sentences analyzing competitive density, market saturation, key player strategies, and overall market dynamics.",
  "competitiveDensity": "low|medium|high",
  "disclaimer": "Note that this is AI-generated competitive analysis and should be validated with market research.",
  "competitors": [
    {
      "name": "Specific company or product name",
      "description": "Detailed description of what they do, their product/service, target market, and scale",
      "positioning": "How they position themselves, their unique value prop, and target segment",
      "strengths": ["2-3 specific strengths with details"],
      "weaknesses": ["2-3 specific weaknesses or limitations"],
      "gaps": ["2-3 differentiation opportunities for the new idea - be specific about what's missing"]
    }
  ]
}

Guidelines:
1. START with the idea summary, then EXPAND with competitive intelligence and market analysis
2. Identify 3-5 competitors: Direct competitors, indirect substitutes, and adjacent solutions
3. For each competitor, provide SPECIFIC analysis:
   - Strengths: "10M users, strong brand in healthcare" not just "popular"
   - Weaknesses: "No mobile app, $99/mo pricing excludes SMBs" not just "expensive"
   - Gaps: "Lacks AI personalization, no integration with Shopify" not just "limited features"
4. Assess competitive density based on: number of funded players, market saturation, ease of entry, consolidation
5. If truly novel market, suggest analogous markets to study (e.g., "Similar to how Stripe disrupted payments")
6. Be concrete with examples and reasoning
`.trim();

  const result = await requestStructuredJSON({
    component: "competition",
    schema: competitionSchema,
    systemPrompt: COMPETITION_PROMPT,
    userPrompt: `
Startup idea summary:
"""${summary}"""

Expand this with detailed competitive landscape analysis. Identify specific competitors, analyze their strengths/weaknesses, and highlight differentiation opportunities.
`.trim(),
    temperature: 0.6,
  });

  if (!result.data) {
    result.data = fallbackCompetition(summary);
  }

  return result;
};

const executeKeywordAnalytics = async (
  summary: string
): Promise<ComponentResult<KeywordAnalyticsResult>> => {
  try {
    console.log("[Keywords] Attempting to fetch keyword analytics...");
    const analytics = await fetchKeywordAnalytics(summary);
    console.log(`[Keywords] ✅ Success! Source: ${analytics.source}`);
    return { data: analytics };
  } catch (error) {
    console.warn("[Keywords] ⚠️ DataForSEO unavailable (this is normal if not configured):", error instanceof Error ? error.message : error);

    // Try LLM-based keyword generation as first fallback
    try {
      console.log("[Keywords] Trying LLM fallback...");
      const seeds = await generateKeywordSeeds(summary);
      if (seeds && seeds.length > 0) {
        console.log(`[Keywords] ✅ LLM fallback generated ${seeds.length} keywords`);
        return {
          data: buildLLMKeywordFallback(summary, seeds),
          error: buildResearchError(
            "keywords",
            "Using AI-generated keywords (keyword analytics API unavailable)",
            false
          ),
        };
      }
    } catch (llmError) {
      console.error("[Keywords] LLM fallback also failed:", llmError);
      captureLLMException(llmError, { stage: "keywords" });
    }

    // Final fallback to heuristic keywords
    console.log("[Keywords] Using heuristic fallback");
    return {
      data: buildFallbackKeywordAnalytics(summary),
      error: buildResearchError(
        "keywords",
        error instanceof Error
          ? error.message
          : "Keyword provider not configured",
        false
      ),
    };
  }
};

const DEFAULT_PROOF_SIGNAL_FALLBACK_STAGE =
  "Emerging market — validate signals manually before making commitments.";
const DEFAULT_PROOF_SIGNAL_FALLBACK_SUMMARY =
  "Deep research unavailable; signals generated from heuristic insights and public founder forums.";

const executeProofSignals = async (
  summary: string,
  options: { background?: boolean } = {}
): Promise<
  ComponentResult<{
    proofSignals: ProofSignal[];
    disclaimer?: string;
    summary?: string;
    marketStage?: string;
    backgroundJobId?: string; // OpenAI job ID if background mode
  }>
> => {
  // Check if deep research is enabled (can be disabled to avoid timeouts)
  const useDeepResearch = process.env.USE_DEEP_RESEARCH_FOR_PROOF_SIGNALS !== "false";
  const backgroundMode = options.background ?? (process.env.DEEP_RESEARCH_BACKGROUND === "true");

  if (!useDeepResearch) {
    console.log("[Proof Signals] Deep Research disabled (USE_DEEP_RESEARCH_FOR_PROOF_SIGNALS=false)");
    console.log("[Proof Signals] Using LLM fallback for proof signals...");
    return executeProofSignalFallbackLLM(summary);
  }

  try {
    console.log("[Proof Signals] Starting Deep Research...");
    console.log("[Proof Signals] Background mode:", backgroundMode ? "enabled" : "disabled");
    console.log("[Proof Signals] Summary being researched:", summary.slice(0, 200));

    // Use env variable for timeout (default 5 minutes for deep research)
    const timeoutSeconds = Number(process.env.DEEP_RESEARCH_TIMEOUT_SECONDS) || 300;
    const PROOF_SIGNALS_TIMEOUT_MS = timeoutSeconds * 1000;
    console.log(`[Proof Signals] Timeout set to ${timeoutSeconds}s (from env: DEEP_RESEARCH_TIMEOUT_SECONDS)`);

    const response = await performDeepResearch(summary, {
      timeoutMs: PROOF_SIGNALS_TIMEOUT_MS,
      background: backgroundMode,
    });

    // Background mode - return job ID immediately
    if ('jobId' in response) {
      console.log(`[Proof Signals] ✅ Background job created! Job ID: ${response.jobId}`);
      return {
        data: {
          proofSignals: [], // No signals yet
          backgroundJobId: response.jobId,
          disclaimer: "Deep research started in background",
          summary: "Research in progress...",
        },
      };
    }

    // Synchronous mode - got results
    console.log(`[Proof Signals] ✅ Deep Research completed! Found ${response.proofSignals.length} signals`);
    return {
      data: {
        proofSignals: response.proofSignals,
        disclaimer:
          response.disclaimer ??
          "Research findings are based on publicly available information and AI analysis.",
        summary: response.summary,
        marketStage: response.marketStage,
      },
      usage: response.usage,
    };
  } catch (error) {
    console.error("[Proof Signals] ❌ Deep Research failed:", error instanceof Error ? error.message : error);

    // Log specific error types
    if (error instanceof Error) {
      if (error.message.includes('model') || error.message.includes('404') || error.message.includes('verified')) {
        console.error("[Proof Signals] 💡 Hint: Deep Research models require organization verification");
        console.error("[Proof Signals]     Visit: https://platform.openai.com/settings/organization/general");
        console.error("[Proof Signals]     Model:", process.env.OPENAI_DEEP_RESEARCH_MODEL || "o4-mini-deep-research-2025-06-26");
      }
    }

    captureLLMException(error, { stage: "proofSignals" });

    console.log("[Proof Signals] Using heuristic fallback...");
    const fallback = fallbackProofSignals(summary);
    return {
      data: {
        proofSignals: fallback,
        summary: DEFAULT_PROOF_SIGNAL_FALLBACK_SUMMARY,
        marketStage: DEFAULT_PROOF_SIGNAL_FALLBACK_STAGE,
        disclaimer:
          "Deep Research unavailable. Signals generated from heuristic data and should be validated.",
      },
      error: buildResearchError(
        "proofSignals",
        error instanceof Error
          ? error.message
          : "Deep Research unavailable",
        error instanceof Error && error.name === "AbortError"
      ),
    };
  }
};

const executeProofSignalFallbackLLM = async (
  summary: string
): Promise<
  ComponentResult<{
    proofSignals: ProofSignal[];
    disclaimer?: string;
    summary?: string;
    marketStage?: string;
  }>
> => {
  const result = await requestStructuredJSON({
    component: "proofSignals",
    schema: proofSignalsSchema,
    systemPrompt: `
Generate 5-7 proof signals validating a market opportunity. Each signal should include a short description, concrete evidence, and at least one credible source URL.
`.trim(),
    userPrompt: `Idea summary: """${summary}"""`,
    temperature: 0.3,
  });

  // Cast to the correct return type and add summary/marketStage
  if (result.data) {
    return {
      data: {
        proofSignals: result.data.proofSignals,
        disclaimer:
          result.data.disclaimer ??
          "Research findings are based on AI analysis and public information.",
        summary:
          "Signals derived from lightweight LLM reasoning; validate sources manually.",
        marketStage:
          "Emerging — insufficient external validation detected during fallback mode.",
      },
      usage: result.usage,
      error: result.error,
    };
  } else {
    return {
      data: {
        proofSignals: fallbackProofSignals(summary),
        disclaimer:
          "Unable to verify proof signals. Results sourced from fallback heuristics.",
        summary: DEFAULT_PROOF_SIGNAL_FALLBACK_SUMMARY,
        marketStage: DEFAULT_PROOF_SIGNAL_FALLBACK_STAGE,
      },
      usage: result.usage,
      error: result.error,
    };
  }
};

type OrchestratorDependencies = {
  classify: typeof executeClassification;
  describe: typeof executeDescription;
  problem: typeof executeProblemAnalysis;
  competition: typeof executeCompetitionAnalysis;
  keywords: typeof executeKeywordAnalytics;
  proofSignals: typeof executeProofSignals;
  proofSignalsFallback: typeof executeProofSignalFallbackLLM;
};

const defaultDependencies: OrchestratorDependencies = {
  classify: executeClassification,
  describe: executeDescription,
  problem: executeProblemAnalysis,
  competition: executeCompetitionAnalysis,
  keywords: executeKeywordAnalytics,
  proofSignals: executeProofSignals,
  proofSignalsFallback: executeProofSignalFallbackLLM,
};

const runComponent = async <T>(
  component: ResearchComponent,
  executor: () => Promise<ComponentResult<T>>
): Promise<ComponentResult<T>> => {
  try {
    return await executor();
  } catch (error) {
    captureLLMException(error, { stage: component });
    return {
      error: buildResearchError(
        component,
        error instanceof Error ? error.message : "Component failed",
        false
      ),
    };
  }
};

// New comprehensive research orchestration
export const orchestrateResearchBriefComprehensive = async (
  input: ResearchGenerationInput
): Promise<ResearchOrchestrationResponse> => {
  const startedAt = new Date();
  const usageByComponent: Partial<Record<ResearchComponent, TokenUsage>> = {};
  const errors: ResearchError[] = [];

  console.log("[Orchestrator] Starting HYBRID research flow (cost-optimized)...");

  // OPTION B: Use lightweight GPT-4o-mini for most modules, deep research for proof signals only
  // This keeps costs under $2 per idea while maintaining quality

  // Step 1: Run cheap lightweight calls first (classification, keywords)
  console.log("[Orchestrator] Running classification + keywords (lightweight)...");
  const [keywordResult, classificationResult] = await Promise.all([
    runComponent("keywords", () => executeKeywordAnalytics(input.summary)),
    runComponent("classification", () => executeClassification(input.summary)),
  ]);

  // Handle keyword analytics
  mergeErrors(errors, keywordResult);
  registerUsage(usageByComponent, "keywords", keywordResult);

  // Handle classification
  mergeErrors(errors, classificationResult);
  registerUsage(usageByComponent, "classification", classificationResult);

  const classification = classificationResult.data ?? fallbackClassification();
  const keywords = keywordResult.data ?? buildFallbackKeywordAnalytics(input.summary);

  // Step 2: Run cheap modules in parallel (Description, Problem, Competition) with gpt-4o-mini
  console.log("[Orchestrator] Running cheap modules (gpt-4o-mini)...");
  const [descriptionResult, problemResult, competitionResult] =
    await Promise.all([
      runComponent("description", () => executeDescription(input.summary)),
      runComponent("problemAnalysis", () => executeProblemAnalysis(input.summary)),
      runComponent("competition", () => executeCompetitionAnalysis(input.summary)),
    ]);

  mergeErrors(errors, descriptionResult);
  registerUsage(usageByComponent, "description", descriptionResult);
  mergeErrors(errors, problemResult);
  registerUsage(usageByComponent, "problemAnalysis", problemResult);
  mergeErrors(errors, competitionResult);
  registerUsage(usageByComponent, "competition", competitionResult);

  const description = descriptionResult.data?.description ?? input.summary;
  const problem = problemResult.data ?? fallbackProblem(description);
  const competition = competitionResult.data ?? fallbackCompetition(description);

  // Step 3: Run ONLY Proof Signals with deep research (expensive but important)
  console.log("[Orchestrator] Running proof signals (deep research)...");

  // Check if background mode is enabled
  const useBackgroundMode = process.env.DEEP_RESEARCH_BACKGROUND === "true";

  const proofSignalsResult = await runComponent("proofSignals", () =>
    executeProofSignals(input.summary, { background: useBackgroundMode })
  );

  mergeErrors(errors, proofSignalsResult);
  registerUsage(usageByComponent, "proofSignals", proofSignalsResult);

  const proofSignalsBundle = proofSignalsResult.data ?? {
    proofSignals: fallbackProofSignals(description),
    summary: "Fallback proof signals",
    marketStage: "Emerging",
    disclaimer: "Generated from heuristics",
  };

  // Check if this is a background job
  const isBackgroundJob = !!proofSignalsBundle.backgroundJobId;
  const backgroundJobId = proofSignalsBundle.backgroundJobId;

  // Build final result using hybrid approach
  const result: ResearchBriefResult = {
    industryTag: classification.industry,
    businessType: classification.businessType,
    description,
    problem: problem.problem,
    whyNow: problem.whyNow,
    competition,
    keywords,
    proofSignals: proofSignalsBundle.proofSignals,
    proofSignalSummary: proofSignalsBundle.summary,
    proofSignalStage: proofSignalsBundle.marketStage,
    proofSignalDisclaimer: proofSignalsBundle.disclaimer,
    generationTimeMs: new Date().getTime() - startedAt.getTime(),
  };

  if (isBackgroundJob) {
    console.log("[Orchestrator] ✅ Brief partially generated - proof signals running in background");
    console.log(`[Orchestrator] Background job ID: ${backgroundJobId}`);
  } else {
    console.log("[Orchestrator] ✅ Brief generated using hybrid approach (cost-optimized)");
  }
  console.log(`[Orchestrator] Total generation time: ${result.generationTimeMs}ms`);

  const completedAt = new Date();
  const totalUsage = sumUsage(Object.values(usageByComponent));

  return {
    result,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    tokenUsage: {
      total: totalUsage,
      components: usageByComponent,
    },
    errors,
    backgroundJobId,
    isBackgroundJob,
  };
};

// Main export - uses hybrid research (cost-optimized)
export const orchestrateResearchBrief = async (
  input: ResearchGenerationInput
): Promise<ResearchOrchestrationResponse> => {
  // Check if we should use legacy mode (for testing/fallback)
  const useLegacy = process.env.USE_LEGACY_RESEARCH === "true";

  if (useLegacy) {
    console.log("[Orchestrator] Using LEGACY multi-LLM research mode");
    return orchestrateResearchBriefLegacy(input);
  }

  // Use hybrid mode by default (cost-optimized: gpt-4o-mini + proof signals deep research)
  console.log("[Orchestrator] Using HYBRID research mode (cost-optimized)");
  return orchestrateResearchBriefComprehensive(input);
};

// Legacy orchestration (keep for backwards compatibility)
const orchestrateResearchBriefLegacy = async (
  input: ResearchGenerationInput,
  overrides: Partial<OrchestratorDependencies> = {}
): Promise<ResearchOrchestrationResponse> => {
  const components: OrchestratorDependencies = {
    ...defaultDependencies,
    ...overrides,
  };

  const startedAt = new Date();
  const usageByComponent: Partial<Record<ResearchComponent, TokenUsage>> = {};
  const errors: ResearchError[] = [];

  const [
    classificationResult,
    descriptionResult,
    problemResult,
    competitionResult,
    keywordResult,
    proofSignalsResult,
  ] = await Promise.all([
    runComponent("classification", () => components.classify(input.summary)),
    runComponent("description", () => components.describe(input.summary)),
    runComponent("problemAnalysis", () => components.problem(input.summary)),
    runComponent("competition", () => components.competition(input.summary)),
    runComponent("keywords", () => components.keywords(input.summary)),
    (async () => {
      const proofSignals = await runComponent("proofSignals", () =>
        components.proofSignals(input.summary)
      );
      if (proofSignals.error) {
        // Attempt lightweight LLM fallback to augment heuristic data.
        const llmFallback = await runComponent("proofSignals", () =>
          components.proofSignalsFallback(input.summary)
        );
        if (llmFallback.data) {
          proofSignals.data = llmFallback.data;
        }
        mergeErrors(errors, llmFallback);
        registerUsage(usageByComponent, "proofSignals", llmFallback);
      }
      return proofSignals;
    })(),
  ]);

  const results = [
    ["classification", classificationResult],
    ["description", descriptionResult],
    ["problemAnalysis", problemResult],
    ["competition", competitionResult],
    ["keywords", keywordResult],
    ["proofSignals", proofSignalsResult],
  ] as Array<[ResearchComponent, ComponentResult<unknown>]>;

  results.forEach(([component, result]) => {
    mergeErrors(errors, result);
    registerUsage(usageByComponent, component, result);
  });

  const classification =
    classificationResult.data ?? fallbackClassification();

  const description =
    descriptionResult.data?.description ?? input.summary;

  const problem = problemResult.data ?? fallbackProblem(description);
  const competition =
    competitionResult.data ?? fallbackCompetition(description);
  const keywords =
    keywordResult.data ?? buildFallbackKeywordAnalytics(description);
  const proofSignalsBundle: ProofSignalsBundle =
    proofSignalsResult.data ?? {
      proofSignals: fallbackProofSignals(description),
      summary: DEFAULT_PROOF_SIGNAL_FALLBACK_SUMMARY,
      marketStage: DEFAULT_PROOF_SIGNAL_FALLBACK_STAGE,
      disclaimer:
        "Proof signals generated from heuristics. Validate with live research.",
    };

  const completedAt = new Date();
  const generationTimeMs = completedAt.getTime() - startedAt.getTime();

  const result: ResearchBriefResult = {
    industryTag: classification.industry,
    businessType: classification.businessType,
    description,
    problem: problem.problem,
    whyNow: problem.whyNow,
    competition,
    keywords,
    proofSignals: proofSignalsBundle.proofSignals,
    proofSignalSummary: proofSignalsBundle.summary,
    proofSignalStage: proofSignalsBundle.marketStage,
    proofSignalDisclaimer: proofSignalsBundle.disclaimer,
    generationTimeMs,
  };

  const totalUsage = sumUsage(Object.values(usageByComponent));

  return {
    result,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    tokenUsage: {
      total: totalUsage,
      components: usageByComponent,
    },
    errors,
  };
};
