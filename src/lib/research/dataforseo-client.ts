/**
 * DataForSEO API Client
 *
 * Integrates with DataForSEO's Google Ads API and Trends API
 * to provide real keyword analytics data.
 *
 * APIs Used:
 * 1. Google Ads API - Search volume, CPC, competition, related keywords
 * 2. Trends API (Explore) - Historical trend data for charts
 */

import { z } from "zod";

// ============================================================================
// Configuration
// ============================================================================

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN || "";
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD || "";
const DATAFORSEO_BASE_URL = "https://api.dataforseo.com/v3";

// ============================================================================
// Schemas
// ============================================================================

const googleAdsKeywordSchema = z.object({
  keyword: z.string(),
  search_volume: z.number().nullable(),
  competition: z.string().nullable(), // "LOW", "MEDIUM", "HIGH"
  cpc: z.number().nullable(),
  monthly_searches: z
    .array(
      z.object({
        year: z.number(),
        month: z.number(),
        search_volume: z.number(),
      })
    )
    .nullable()
    .optional(),
});

const googleAdsResponseSchema = z.object({
  tasks: z.array(
    z.object({
      result: z.array(googleAdsKeywordSchema).nullable().optional(),
      status_code: z.number(),
      status_message: z.string().optional(),
    })
  ),
});

const trendsDataPointSchema = z.object({
  date_from: z.string(),
  date_to: z.string(),
  timestamp: z.number(),
  values: z.array(z.number().nullable()),
});

const trendsResponseSchema = z.object({
  tasks: z.array(
    z.object({
      result: z
        .array(
          z.object({
            items: z
              .array(
                z.object({
                  type: z.string(),
                  keywords: z.array(z.string()).nullable().optional(),
                  data: z.array(trendsDataPointSchema).nullable().optional(),
                })
              )
              .nullable()
              .optional(),
          })
        )
        .nullable()
        .optional(),
      status_code: z.number(),
      status_message: z.string().optional(),
    })
  ),
});

// ============================================================================
// Types
// ============================================================================

type GoogleAdsKeyword = z.infer<typeof googleAdsKeywordSchema>;
type TrendsDataPoint = z.infer<typeof trendsDataPointSchema>;

export type DataForSEOKeywordData = {
  keyword: string;
  searchVolume: number | null;
  competition: "LOW" | "MEDIUM" | "HIGH" | null;
  cpc: number | null;
  monthlyTrend?: Array<{
    date: string;
    volume: number;
  }>;
};

export type DataForSEOTrendData = {
  keyword: string;
  trendData: Array<{
    date: string;
    value: number;
  }>;
};

// ============================================================================
// API Client
// ============================================================================

class DataForSEOClient {
  private authHeader: string;

  constructor() {
    const credentials = Buffer.from(
      `${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`
    ).toString("base64");
    this.authHeader = `Basic ${credentials}`;
  }

  private async request<T>(
    endpoint: string,
    payload: unknown,
    schema: z.ZodType<T>
  ): Promise<T> {
    const url = `${DATAFORSEO_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `DataForSEO API error (${response.status}): ${text.slice(0, 200)}`
      );
    }

    const data = await response.json();
    return schema.parse(data);
  }

  /**
   * Get keyword data from Google Ads API
   * Returns search volume, CPC, competition for up to 1,000 keywords
   */
  async getKeywordData(
    keywords: string[],
    locationCode: number = 2840, // United States
    languageCode: string = "en"
  ): Promise<GoogleAdsKeyword[]> {
    const response = await this.request(
      "/keywords_data/google_ads/search_volume/live",
      [
        {
          location_code: locationCode,
          language_code: languageCode,
          keywords: keywords.slice(0, 1000), // Max 1,000 per request
        },
      ],
      googleAdsResponseSchema
    );

    const task = response.tasks[0];
    if (!task) {
      throw new Error("No task returned from DataForSEO");
    }

    if (task.status_code !== 20000) {
      throw new Error(
        `DataForSEO task failed: ${task.status_message || "Unknown error"}`
      );
    }

    return task.result || [];
  }

  /**
   * Get related keywords for a search term
   * Uses Google Ads API to find keyword ideas
   */
  async getRelatedKeywords(
    seedKeyword: string,
    maxResults: number = 20,
    locationCode: number = 2840,
    languageCode: string = "en"
  ): Promise<string[]> {
    const response = await this.request(
      "/keywords_data/google_ads/keywords_for_keywords/live",
      [
        {
          location_code: locationCode,
          language_code: languageCode,
          keywords: [seedKeyword],
        },
      ],
      googleAdsResponseSchema
    );

    const task = response.tasks[0];
    if (!task || task.status_code !== 20000 || !task.result) {
      return [];
    }

    return task.result
      .sort((a, b) => (b.search_volume || 0) - (a.search_volume || 0))
      .slice(0, maxResults)
      .map((k) => k.keyword);
  }

  /**
   * Get trend data over time for keywords
   * Uses DataForSEO Trends API (Explore endpoint)
   */
  async getTrendData(
    keywords: string[],
    locationCode: number = 2840,
    timeRange: "past_hour" | "past_4_hours" | "past_day" | "past_7_days" | "past_30_days" | "past_90_days" | "past_12_months" | "past_5_years" = "past_12_months"
  ): Promise<Map<string, TrendsDataPoint[]>> {
    const response = await this.request(
      "/keywords_data/google_trends/explore/live",
      [
        {
          location_code: locationCode,
          keywords: keywords.slice(0, 5), // Max 5 keywords for Trends
          time_range: timeRange,
          type: "web",
        },
      ],
      trendsResponseSchema
    );

    const task = response.tasks[0];
    if (!task || task.status_code !== 20000) {
      return new Map();
    }

    const items = task.result?.[0]?.items || [];
    const trendsMap = new Map<string, TrendsDataPoint[]>();

    for (const item of items) {
      if (item.type === "google_trends_graph" && item.keywords && item.data) {
        item.keywords.forEach((keyword, index) => {
          const keywordData = item.data!.map((point) => ({
            ...point,
            values: [point.values[index] ?? null],
          }));
          trendsMap.set(keyword, keywordData);
        });
      }
    }

    return trendsMap;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let client: DataForSEOClient | null = null;

export function getDataForSEOClient(): DataForSEOClient {
  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    throw new Error(
      "DataForSEO credentials not configured. Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables."
    );
  }

  if (!client) {
    client = new DataForSEOClient();
  }

  return client;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normalize competition level from DataForSEO to our format
 */
export function normalizeCompetition(
  competition: string | null
): "LOW" | "MEDIUM" | "HIGH" | null {
  if (!competition) return null;
  const upper = competition.toUpperCase();
  if (upper === "LOW" || upper === "MEDIUM" || upper === "HIGH") {
    return upper as "LOW" | "MEDIUM" | "HIGH";
  }
  return null;
}

/**
 * Format trend data for our charts
 */
export function formatTrendData(
  dataPoints: TrendsDataPoint[]
): Array<{ date: string; value: number }> {
  return dataPoints
    .map((point) => ({
      date: point.date_from,
      value: point.values[0] ?? 0,
    }))
    .filter((point) => point.value !== null);
}

/**
 * Calculate growth percentage from monthly searches
 */
export function calculateGrowth(
  monthlySearches?: Array<{ year: number; month: number; search_volume: number }>
): number | null {
  if (!monthlySearches || monthlySearches.length < 2) {
    return null;
  }

  const sorted = [...monthlySearches].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  const first = sorted[0]!.search_volume;
  const last = sorted[sorted.length - 1]!.search_volume;

  if (first === 0) return null;

  return Number((((last - first) / first) * 100).toFixed(2));
}
