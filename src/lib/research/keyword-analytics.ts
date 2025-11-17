import { z } from "zod";
import type {
  KeywordAnalyticsResult,
  KeywordSeed,
  KeywordTrendPoint,
} from "./types";

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "into",
  "your",
  "their",
  "about",
  "idea",
  "solution",
  "platform",
  "service",
  "app",
]);

const rawTrendSchema = z.object({
  date: z.string(),
  value: z.number(),
});

const rawKeywordSchema = z.object({
  term: z.string(),
  volume: z.number(),
  growth: z.number(),
  intent: z.string().optional(),
  trend: z.array(rawTrendSchema).default([]),
  notes: z.string().optional(),
});

const rawAnalyticsSchema = z.object({
  primaryKeyword: z.string(),
  totalSearchVolume: z.number(),
  averageGrowth: z.number(),
  history: z.array(rawTrendSchema).default([]),
  keywords: z.array(rawKeywordSchema),
});

type RawAnalytics = z.infer<typeof rawAnalyticsSchema>;
type RawKeyword = z.infer<typeof rawKeywordSchema>;

const normalizeIntent = (
  intent?: string | null
): "informational" | "navigational" | "transactional" | "commercial" | "other" => {
  if (!intent) return "other";
  const normalized = intent.toLowerCase();
  if (
    normalized === "informational" ||
    normalized === "navigational" ||
    normalized === "transactional" ||
    normalized === "commercial"
  ) {
    return normalized;
  }
  return "other";
};

const adaptKeyword = (keyword: RawKeyword) => ({
  term: keyword.term,
  volume: keyword.volume,
  growth: keyword.growth,
  intent: normalizeIntent(keyword.intent),
  trend: keyword.trend,
  notes: keyword.notes,
});

const adaptAnalytics = (
  raw: RawAnalytics,
  source: KeywordAnalyticsResult["source"] = "provider"
): KeywordAnalyticsResult => ({
  primaryKeyword: raw.primaryKeyword,
  totalSearchVolume: raw.totalSearchVolume,
  averageGrowth: raw.averageGrowth,
  history: raw.history,
  keywords: raw.keywords.map(adaptKeyword),
  source,
});

export const selectKeywordSeeds = (summary: string) => {
  const normalized = summary
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const scored = normalized
    .filter((word) => !STOP_WORDS.has(word))
    .reduce<Record<string, number>>((acc, word) => {
      acc[word] = (acc[word] ?? 0) + 1;
      return acc;
    }, {});

  const sorted = Object.entries(scored)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  return sorted.length > 0 ? sorted : ["market research"];
};

const buildTrendHistory = (points: number, base: number): KeywordTrendPoint[] => {
  const now = new Date();
  const history: KeywordTrendPoint[] = [];

  for (let idx = points - 1; idx >= 0; idx -= 1) {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - idx, 1)
    );
    history.push({
      date: date.toISOString().slice(0, 10),
      value: Math.max(base + (points - idx) * 3 - idx * 2, 1),
    });
  }

  return history;
};

const buildLLMNotes = (seed?: KeywordSeed) =>
  seed?.rationale
    ? `LLM suggestion: ${seed.rationale}`
    : "LLM suggestion based on idea description.";

export const buildFallbackKeywordAnalytics = (
  summary: string
): KeywordAnalyticsResult => {
  const seeds = selectKeywordSeeds(summary);
  const history = buildTrendHistory(6, 25);

  const keywords = seeds.map((term, index) => ({
    term,
    volume: Math.max(600 - index * 120, 120),
    growth: Number((Math.max(3, 12 - index * 2)).toFixed(2)),
    intent: index === 0 ? "commercial" : "informational",
    trend: history,
    notes:
      index === 0
        ? "Estimated demand based on summary keywords."
        : undefined,
  }));

  return {
    primaryKeyword: keywords[0]?.term ?? seeds[0],
    totalSearchVolume: keywords.reduce((acc, keyword) => acc + keyword.volume, 0),
    averageGrowth:
      keywords.reduce((acc, keyword) => acc + keyword.growth, 0) /
      Math.max(keywords.length, 1),
    history,
    keywords,
    source: "heuristic",
  };
};

export const fetchKeywordAnalytics = async (
  input: string | { summary: string; keywords?: string[] }
): Promise<KeywordAnalyticsResult> => {
  const summary =
    typeof input === "string" ? input : input.summary;
  const keywords =
    typeof input === "string" ? undefined : input.keywords;

  // Check if DataForSEO is configured
  if (process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD) {
    const { fetchKeywordAnalyticsFromDataForSEO } = await import(
      "./dataforseo-integration"
    );
    return fetchKeywordAnalyticsFromDataForSEO(summary, keywords);
  }

  // Fall back to generic API if configured
  const apiUrl = process.env.KEYWORD_ANALYTICS_API_URL;
  const apiKey = process.env.KEYWORD_ANALYTICS_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error("Keyword analytics API is not configured.");
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      topic: summary,
      keywords,
      includeHistory: true,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Keyword analytics API failed (${response.status}): ${detail.slice(0, 200)}`
    );
  }

  const parsed = rawAnalyticsSchema.parse(await response.json());
  return adaptAnalytics(parsed, "provider");
};

export const buildLLMKeywordFallback = (
  summary: string,
  seeds: KeywordSeed[]
): KeywordAnalyticsResult => {
  if (!seeds.length) {
    return buildFallbackKeywordAnalytics(summary);
  }

  const history = buildTrendHistory(6, 25);

  const keywords = seeds.map((seed, index) => ({
    term: seed.term,
    volume: Math.max(600 - index * 120, 120),
    growth: Number((Math.max(3, 12 - index * 2)).toFixed(2)),
    intent: seed.intent ?? "other",
    trend: history,
    notes:
      index === 0
        ? "AI-generated keyword with estimated search metrics. Validate with real keyword tools."
        : buildLLMNotes(seed),
  }));

  return {
    primaryKeyword: keywords[0]?.term ?? seeds[0]?.term ?? "keyword",
    totalSearchVolume: keywords.reduce((acc, keyword) => acc + keyword.volume, 0),
    averageGrowth:
      keywords.reduce((acc, keyword) => acc + keyword.growth, 0) /
      Math.max(keywords.length, 1),
    history,
    keywords,
    source: "llm_fallback",
  };
};
