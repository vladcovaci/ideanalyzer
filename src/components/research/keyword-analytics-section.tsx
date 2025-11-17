'use client';

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
import { SectionHeader } from "@/components/ui/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type KeywordAnalyticsSectionProps = {
  data: KeywordAnalyticsResult | null;
  title?: string;
  description?: string;
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

const KeywordTrendCard = ({
  keyword,
  fallbackHistory,
}: {
  keyword: KeywordInsight;
  fallbackHistory: KeywordTrendPoint[];
}) => {
  const chartData = buildChartData(keyword, fallbackHistory);
  const hasTrend = chartData.length > 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="mb-0 flex flex-col gap-1">
        <CardTitle className="text-2xl">{keyword.term}</CardTitle>
        <div className="mt-2 flex flex-wrap items-center gap-6 text-sm font-medium">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Search Volume
            </p>
            <p className="text-xl font-semibold">{formatVolume(keyword.volume)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Growth (12m)
            </p>
            <p className={cn("text-xl font-semibold", growthColor(keyword.growth))}>
              {formatGrowth(keyword.growth)}
            </p>
          </div>
        </div>
        {keyword.notes && (
          <p className="text-sm text-muted-foreground">{keyword.notes}</p>
        )}
      </CardHeader>
      <CardContent className="mt-4 flex-1">
        {hasTrend ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
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
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-muted py-10 text-sm text-muted-foreground">
            Trend data not available for this keyword
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function KeywordAnalyticsSection({
  data,
  title = "Keyword Demand Signals",
  description = "Search demand and growth signals across your target opportunity.",
}: KeywordAnalyticsSectionProps) {
  if (!data) {
    return null;
  }

  const keywords = data.keywords ?? [];

  return (
    <div id="keyword-insights" className="!max-w-7xl">
      <SectionHeader
        eyebrow="Search Interest"
        title={title}
        description={description}
        align="left"
      />

      {keywords.length === 0 ? (
        <p className="mt-12 text-sm text-muted-foreground">
          Keyword analytics will appear here once research is generated.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {keywords.map((keyword) => (
            <KeywordTrendCard
              key={keyword.term}
              keyword={keyword}
              fallbackHistory={data.history}
            />
          ))}
        </div>
      )}

      <p className="mt-8 text-sm text-muted-foreground">
        Keyword data is estimated and may vary by source.
      </p>
    </div>
  );
}
