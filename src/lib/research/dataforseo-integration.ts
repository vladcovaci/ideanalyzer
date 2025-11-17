/**
 * DataForSEO Integration for Keyword Analytics
 *
 * Fetches real keyword data from DataForSEO APIs and formats it
 * for our keyword analytics system.
 */

import {
  getDataForSEOClient,
  calculateGrowth,
  formatTrendData,
  normalizeCompetition,
} from "./dataforseo-client";
import { generateKeywordSeeds } from "./keyword-generator";
import type { KeywordAnalyticsResult, KeywordInsight } from "./types";

/**
 * Fetch keyword analytics from DataForSEO
 *
 * This function:
 * 1. Generates relevant keywords using AI (if not provided)
 * 2. Fetches search volume, CPC, competition from Google Ads API
 * 3. Fetches trend data from DataForSEO Trends API
 * 4. Combines everything into our KeywordAnalyticsResult format
 */
export async function fetchKeywordAnalyticsFromDataForSEO(
  summary: string,
  providedKeywords?: string[]
): Promise<KeywordAnalyticsResult> {
  const client = getDataForSEOClient();

  // Step 1: Get keywords to analyze
  let keywords: string[] = [];

  if (providedKeywords && providedKeywords.length > 0) {
    keywords = providedKeywords;
  } else {
    // Use AI to generate relevant keywords
    const seeds = await generateKeywordSeeds(summary);
    keywords = seeds.map((s) => s.term);
  }

  if (keywords.length === 0) {
    throw new Error("No keywords to analyze");
  }

  // Step 2: Get keyword data (volume, CPC, competition)
  const keywordData = await client.getKeywordData(keywords.slice(0, 20));

  // Step 3: Get trend data for top 5 keywords
  const topKeywords = keywordData
    .sort((a, b) => (b.search_volume || 0) - (a.search_volume || 0))
    .slice(0, 5)
    .map((k) => k.keyword);

  const trendsMap = await client.getTrendData(topKeywords);

  // Step 4: Format data for our system
  const formattedKeywords: KeywordInsight[] = keywordData.map((kw) => {
    const trendData = trendsMap.get(kw.keyword);
    const growth = calculateGrowth(kw.monthly_searches ?? undefined);

    return {
      term: kw.keyword,
      volume: kw.search_volume,
      growth: growth,
      intent: inferIntent(kw),
      trend: trendData ? formatTrendData(trendData) : [],
      notes: buildNotes(kw),
      cpc: kw.cpc,
      competition: normalizeCompetition(kw.competition),
    };
  });

  // Calculate aggregates
  const totalSearchVolume = formattedKeywords.reduce(
    (sum, k) => sum + (k.volume || 0),
    0
  );

  const validGrowths = formattedKeywords
    .map((k) => k.growth)
    .filter((g): g is number => g !== null);

  const averageGrowth =
    validGrowths.length > 0
      ? validGrowths.reduce((sum, g) => sum + g, 0) / validGrowths.length
      : 0;

  // Build overall history from primary keyword
  const primaryKeywordTrend = formattedKeywords[0]?.trend || [];

  return {
    primaryKeyword: formattedKeywords[0]?.term || keywords[0],
    totalSearchVolume,
    averageGrowth: Number(averageGrowth.toFixed(2)),
    history: primaryKeywordTrend,
    keywords: formattedKeywords,
    source: "provider",
  };
}

/**
 * Infer search intent from keyword data
 */
function inferIntent(
  keyword: {
    keyword: string;
    cpc: number | null;
    competition: string | null;
  }
): "informational" | "navigational" | "transactional" | "commercial" | "other" {
  const term = keyword.keyword.toLowerCase();
  const cpc = keyword.cpc || 0;
  const competition = keyword.competition?.toUpperCase();

  // High CPC + High competition = Commercial/Transactional
  if (cpc > 2 && competition === "HIGH") {
    if (
      term.includes("buy") ||
      term.includes("price") ||
      term.includes("cost") ||
      term.includes("cheap") ||
      term.includes("discount")
    ) {
      return "transactional";
    }
    return "commercial";
  }

  // Informational keywords
  if (
    term.includes("how") ||
    term.includes("what") ||
    term.includes("why") ||
    term.includes("guide") ||
    term.includes("tutorial")
  ) {
    return "informational";
  }

  // Navigational keywords (brand names, specific products)
  if (
    term.includes("login") ||
    term.includes("sign in") ||
    term.includes("official") ||
    term.includes("app")
  ) {
    return "navigational";
  }

  // Default to commercial if has decent CPC
  if (cpc > 0.5) {
    return "commercial";
  }

  return "other";
}

/**
 * Build notes/context for keyword
 */
function buildNotes(keyword: {
  keyword: string;
  search_volume: number | null;
  cpc: number | null;
  competition: string | null;
}): string | undefined {
  const parts: string[] = [];

  if (keyword.search_volume === null) {
    parts.push("No search volume data available");
  } else if (keyword.search_volume > 10000) {
    parts.push("High search demand");
  } else if (keyword.search_volume < 100) {
    parts.push("Niche keyword with low volume");
  }

  if (keyword.cpc && keyword.cpc > 5) {
    parts.push("highly competitive CPC");
  }

  if (keyword.competition === "HIGH") {
    parts.push("saturated market");
  } else if (keyword.competition === "LOW") {
    parts.push("low competition opportunity");
  }

  return parts.length > 0 ? parts.join(", ") : undefined;
}

/**
 * Get related keywords for a seed term
 * Useful for the keyword selector dropdown in the UI
 */
export async function fetchRelatedKeywords(
  seedKeyword: string,
  maxResults: number = 20
): Promise<string[]> {
  const client = getDataForSEOClient();
  return client.getRelatedKeywords(seedKeyword, maxResults);
}

/**
 * Get detailed data for a specific keyword
 * Used when user selects a keyword from the dropdown
 */
export async function fetchKeywordDetails(keyword: string): Promise<{
  term: string;
  volume: number | null;
  growth: number | null;
  cpc: number | null;
  competition: "LOW" | "MEDIUM" | "HIGH" | null;
  trend: Array<{ date: string; value: number }>;
  relatedKeywords: string[];
}> {
  const client = getDataForSEOClient();

  // Fetch keyword data and trends in parallel
  const [keywordDataList, trendsMap, relatedKeywords] = await Promise.all([
    client.getKeywordData([keyword]),
    client.getTrendData([keyword]),
    client.getRelatedKeywords(keyword, 15),
  ]);

  const keywordData = keywordDataList[0];
  if (!keywordData) {
    throw new Error(`No data found for keyword: ${keyword}`);
  }

  const trendData = trendsMap.get(keyword);
  const growth = calculateGrowth(keywordData.monthly_searches ?? undefined);

  return {
    term: keywordData.keyword,
    volume: keywordData.search_volume,
    growth,
    cpc: keywordData.cpc,
    competition: normalizeCompetition(keywordData.competition),
    trend: trendData ? formatTrendData(trendData) : [],
    relatedKeywords,
  };
}
