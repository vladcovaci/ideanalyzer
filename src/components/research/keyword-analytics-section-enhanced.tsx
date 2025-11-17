'use client';

import { useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type {
  KeywordAnalyticsResult,
  KeywordInsight,
  KeywordTrendPoint,
} from "@/lib/research/types";
import { Section, SectionHeader } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type KeywordAnalyticsSectionProps = {
  data: KeywordAnalyticsResult | null;
  title?: string;
  description?: string;
  className?: string;
};

const formatVolume = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "—";
  if (value === 0) return "0";

  const absValue = Math.abs(value);
  if (absValue >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (absValue >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat().format(value);
};

const formatGrowth = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "—";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(0)}%`;
};

const growthColor = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "text-muted-foreground";
  if (value > 0) return "text-emerald-500";
  if (value < 0) return "text-rose-500";
  return "text-muted-foreground";
};

const competitionColor = (competition?: "LOW" | "MEDIUM" | "HIGH" | null) => {
  if (!competition) return "text-muted-foreground";
  switch (competition) {
    case "LOW":
      return "text-emerald-600";
    case "MEDIUM":
      return "text-amber-600";
    case "HIGH":
      return "text-rose-600";
    default:
      return "text-muted-foreground";
  }
};

const formatDate = (isoDate: string) => {
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "numeric",
  });
  return formatter.format(new Date(isoDate));
};

const buildChartData = (
  keyword: KeywordInsight,
  fallbackHistory: KeywordTrendPoint[]
) => {
  if (keyword.trend.length > 0) {
    return keyword.trend;
  }
  return fallbackHistory;
};

const TrendTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length || label === undefined) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background/95 px-3 py-2 text-xs shadow-lg">
      <p className="font-medium">{formatDate(label)}</p>
      <p className="text-muted-foreground">
        {new Intl.NumberFormat().format(payload[0]!.value ?? 0)} searches
      </p>
    </div>
  );
};

const KeywordRankingItem = ({
  keyword,
}: {
  keyword: KeywordInsight;
}) => (
  <div className="flex items-center gap-3 text-sm">
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
    <div className="flex-1">
      <p className="font-medium text-foreground">{keyword.term}</p>
      <div className="mt-0.5 flex items-center gap-4 text-xs text-muted-foreground">
        <span>Volume: {formatVolume(keyword.volume)}</span>
        <span className={growthColor(keyword.growth)}>
          Growth: {formatGrowth(keyword.growth)}
        </span>
      </div>
    </div>
  </div>
);

export function KeywordAnalyticsSectionEnhanced({
  data,
  title = "Keyword Demand Signals",
  description = "Search demand and growth signals across your target opportunity.",
  className,
}: KeywordAnalyticsSectionProps) {
  const keywords = data?.keywords ?? [];
  const [selectedKeyword, setSelectedKeyword] = useState<string>(
    keywords[0]?.term ?? ""
  );

  if (!data || keywords.length === 0) {
    return (
      <Section id="keyword-insights" className={cn("!max-w-7xl", className)}>
        <SectionHeader
          eyebrow="Search Interest"
          title={title}
          description={description}
          align="left"
        />
        <p className="mt-12 text-sm text-muted-foreground">
          Keyword analytics will appear here once research is generated.
        </p>
      </Section>
    );
  }

  const currentKeyword =
    keywords.find((k) => k.term === selectedKeyword) ?? keywords[0];
  const chartData = currentKeyword
    ? buildChartData(currentKeyword, data.history)
    : [];

  // Sort keywords by growth (descending)
  const fastestGrowing = [...keywords]
    .filter((k) => k.growth !== null)
    .sort((a, b) => (b.growth ?? 0) - (a.growth ?? 0))
    .slice(0, 5);

  // Sort keywords by volume (descending)
  const highestVolume = [...keywords]
    .filter((k) => k.volume !== null)
    .sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0))
    .slice(0, 5); 

  return (
    <Section id="keyword-insights" className={cn("!max-w-7xl !px-0", className)}>


      <div className="mx-auto mt-10 max-w-7xl">
        <h3 className="text-2xl font-semibold text-foreground mb-6">
          Keyword Analysis
        </h3>
        <p className="text-sm text-muted-foreground mb-8">
          Analysis of search trends and keyword opportunities related to this idea.
        </p>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* Main Chart Area */}
          <div className="space-y-6">
            {/* Keyword Selector Card */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-muted-foreground">
                      Keyword:
                    </label>
                    <Select
                      value={selectedKeyword}
                      onValueChange={setSelectedKeyword}
                    >
                      <SelectTrigger className="w-[280px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {keywords.map((keyword) => (
                          <SelectItem key={keyword.term} value={keyword.term}>
                            {keyword.term}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-muted-foreground">
                      Time:
                    </label>
                    <Select defaultValue="1-year">
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-year">1 Year</SelectItem>
                        <SelectItem value="6-months">6 Months</SelectItem>
                        <SelectItem value="3-months">3 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Metrics Row */}
                {currentKeyword && (
                  <div className="mb-6 flex flex-wrap gap-8">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {currentKeyword.term}
                      </p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className={cn("text-3xl font-bold", growthColor(currentKeyword.growth))}>
                          {formatGrowth(currentKeyword.growth)}
                        </span>
                        <span className="text-sm text-muted-foreground">Growth</span>
                      </div>
                    </div>

                    {currentKeyword.cpc !== undefined && currentKeyword.cpc !== null && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          CPC
                        </p>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-amber-600">
                            ${currentKeyword.cpc.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {currentKeyword.competition && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Competition
                        </p>
                        <div className="mt-1">
                          <span className={cn("text-3xl font-bold", competitionColor(currentKeyword.competition))}>
                            {currentKeyword.competition}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentKeyword?.notes && (
                  <p className="mb-6 text-sm text-muted-foreground">
                    {currentKeyword.notes}
                  </p>
                )}

                {/* Trend Chart */}
                {chartData.length > 0 ? (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 20, left: -10, bottom: 10 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--muted))"
                        />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => formatDate(value as string)}
                          tick={{ fontSize: 12 }}
                          minTickGap={24}
                          label={{
                            value: "Month",
                            position: "insideBottom",
                            offset: -5,
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 12,
                          }}
                        />
                        <YAxis
                          tickFormatter={(value) => formatVolume(value as number)}
                          tick={{ fontSize: 12 }}
                          width={70}
                          label={{
                            value: "Search volume",
                            angle: -90,
                            position: "insideLeft",
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 12,
                          }}
                        />
                        <Tooltip content={<TrendTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-muted py-10 text-sm text-muted-foreground">
                    Trend data not available for this keyword
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related Keywords List */}
            <Card>
              <CardContent className="p-6">
                <h4 className="mb-4 text-sm font-semibold text-foreground">
                  Related Keywords
                </h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {keywords.slice(0, 16).map((keyword) => (
                    <button
                      key={keyword.term}
                      onClick={() => setSelectedKeyword(keyword.term)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:border-primary/40",
                        selectedKeyword === keyword.term
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-muted text-muted-foreground"
                      )}
                    >
                      {keyword.term}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Rankings */}
          <div className="space-y-6">
            {/* Fastest Growing */}
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  Fastest Growing
                </h3>
                <div className="space-y-4">
                  {fastestGrowing.map((keyword) => (
                    <KeywordRankingItem
                      key={keyword.term}
                      keyword={keyword}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Highest Volume */}
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  Highest Volume
                </h3>
                <div className="space-y-4">
                  {highestVolume.map((keyword) => (
                    <KeywordRankingItem
                      key={keyword.term}
                      keyword={keyword}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Keyword Summary */}
        {data.keywords.length > 0 && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h4 className="mb-3 text-lg font-semibold text-foreground">
                Keyword Summary
              </h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                The selected keywords demonstrate {(data.averageGrowth ?? 0) > 0 ? "strong" : "moderate"} interest
                in {currentKeyword?.term.split(" ")[0]}-related technology, solutions, and services,
                reflecting {(data.averageGrowth ?? 0) > 5 ? "significant" : "steady"} market demand. This positioning
                highlights a viable business opportunity, with clear commercial intent, primarily focused
                on solutions and technology in this space.
              </p>
            </CardContent>
          </Card>
        )}

        <p className="mt-8 text-sm text-muted-foreground">
          {data.source === "provider"
            ? "Keyword data from DataForSEO with real search volumes and competition metrics."
            : data.source === "llm_fallback"
            ? "AI-generated keywords with estimated metrics. Validate with real keyword tools."
            : "Keyword data is estimated and may vary by source."}
        </p>
      </div>
    </Section>
  );
}
