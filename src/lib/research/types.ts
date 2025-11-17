import type { z } from "zod";

export const researchComponents = [
  "classification",
  "description",
  "problemAnalysis",
  "competition",
  "keywords",
  "proofSignals",
] as const;

export type ResearchComponent = (typeof researchComponents)[number];

export type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type ResearchGenerationInput = {
  summary: string;
  userId: string;
  ideaId?: string;
  conversationId?: string;
  clarifyingContext?: ClarifyingContext; // User answers + AI assumptions
};

export type ClarifyingContext = {
  userAnswers: Record<string, string>; // Question -> User's answer
  aiAssumptions: Record<string, string>; // Question -> AI's assumption (if user didn't answer)
  contextSummary: string; // Combined narrative for deep research
};

export type IndustryClassification = {
  industry: string;
  businessType: string;
  confidence: "high" | "medium" | "low";
  rationale?: string;
};

export type ProblemWhyNowAnalysis = {
  problem: string;
  whyNow: string[];
  needsMoreContext?: boolean;
  missingContext?: string;
};

export type CompetitorInsight = {
  name: string;
  description: string;
  positioning: string;
  strengths?: string[];
  weaknesses?: string[];
  gaps?: string[];
};

export type CompetitionAnalysis = {
  summary: string;
  competitiveDensity: "low" | "medium" | "high";
  competitors: CompetitorInsight[];
  disclaimer?: string;
};

export type KeywordTrendPoint = {
  date: string;
  value: number;
};

export type KeywordInsight = {
  term: string;
  volume: number | null;
  growth: number | null;
  intent: "informational" | "navigational" | "transactional" | "commercial" | "other";
  trend: KeywordTrendPoint[];
  notes?: string;
  cpc?: number | null;
  competition?: "LOW" | "MEDIUM" | "HIGH" | null;
};

export type KeywordAnalyticsResult = {
  primaryKeyword: string;
  totalSearchVolume: number | null;
  averageGrowth: number | null;
  history: KeywordTrendPoint[];
  keywords: KeywordInsight[];
  source?: "provider" | "llm_fallback" | "heuristic";
};

export type KeywordSeed = {
  term: string;
  intent?: "informational" | "navigational" | "transactional" | "commercial" | "other";
  rationale?: string;
};

export type ProofSignal = {
  description: string;
  evidence: string;
  sources: string[];
  disclaimer?: string;
};

export type ProofSignalsBundle = {
  proofSignals: ProofSignal[];
  summary?: string;
  marketStage?: string;
  disclaimer?: string;
};

// Comprehensive Deep Research Types
export type DescriptionModule = {
  summary: string; // 2-3 sentences
  targetUser: string;
  valueProposition: string;
};

export type IdentifiedProblemModule = {
  problem: string; // Who experiences it, severity, current workarounds
  targetPersona: string;
  currentSolutions: string[];
  painLevel: "low" | "medium" | "high";
};

export type WhyNowModule = {
  timingSignals: string[]; // 3-5 concrete signals
  enablers: string[]; // Tech/regulatory/market enablers
  catalysts: string[]; // What changed recently
  opportunity: string; // 2-3 sentence summary
};

export type CompetitionModule = {
  summary: string;
  density: "low" | "medium" | "high";
  competitors: CompetitorInsight[];
  gaps: string[]; // Differentiation opportunities
  disclaimer?: string;
};

export type ComprehensiveResearchResult = {
  // Module 1: Description
  description: DescriptionModule;

  // Module 2: Identified Problem
  identifiedProblem: IdentifiedProblemModule;

  // Module 3: Why Now / Opportunity
  whyNow: WhyNowModule;

  // Module 4: Proof Signals
  proofSignals: ProofSignal[];

  // Module 5: Competition
  competition: CompetitionModule;

  // Module 6: Keywords (from deep research)
  keywords?: KeywordInsight[];

  // Metadata
  researchSummary: string;
  marketStage: string;
  disclaimer: string;
  sourcesCount: number;
};

export type ResearchBriefResult = {
  industryTag: string;
  businessType: string;
  description: string;
  problem: string;
  whyNow: string[];
  proofSignals: ProofSignal[];
  proofSignalSummary?: string;
  proofSignalStage?: string;
  proofSignalDisclaimer?: string;
  competition: CompetitionAnalysis;
  keywords: KeywordAnalyticsResult;
  generationTimeMs: number;
};

export type ResearchError = {
  component: ResearchComponent;
  message: string;
  retryable: boolean;
};

export type ComponentResult<T> = {
  data?: T;
  usage?: TokenUsage;
  error?: ResearchError;
};

export type ResearchOrchestrationResponse = {
  result: ResearchBriefResult;
  startedAt: string;
  completedAt: string;
  tokenUsage: {
    total: TokenUsage;
    components: Partial<Record<ResearchComponent, TokenUsage>>;
  };
  errors: ResearchError[];
  backgroundJobId?: string; // OpenAI job ID if deep research is running in background
  isBackgroundJob?: boolean; // True if proof signals are being processed in background
};

export type ZodSchema<T> = z.ZodType<T>;
