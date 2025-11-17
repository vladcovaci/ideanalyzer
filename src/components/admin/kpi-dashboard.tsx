"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type KpiStats = {
  totals: {
    usersAllTime: number;
    users30d: number;
    briefsAllTime: number;
    briefs30d: number;
    avgBriefsPerUser: number;
    avgGenerationMs: number;
    retentionPercent: number;
    avgFeedbackRating: number | null;
    costPerBrief: number;
  };
  trends: {
    users: Array<{ date: string; value: number }>;
    briefs: Array<{ date: string; value: number }>;
  };
};

export function KpiDashboard() {
  const [data, setData] = useState<KpiStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const response = await fetch("/api/admin/kpis/stats");
    if (!response.ok) {
      setData(null);
      setLoading(false);
      return;
    }
    setData((await response.json()) as KpiStats);
    setLoading(false);
  };

  useEffect(() => {
    void fetchStats();
    const interval = setInterval(fetchStats, 60_000);
    return () => clearInterval(interval);
  }, []);

  const exportHref = "/api/admin/kpis/export";

  if (loading) {
    return <Skeleton className="h-96 rounded-[32px]" />;
  }

  if (!data) {
    return (
      <div className="rounded-[32px] border border-dashed border-muted px-8 py-12 text-center">
        <p className="text-base font-semibold text-foreground">
          No KPI data available yet.
        </p>
        <p className="text-sm text-muted-foreground">
          Metrics will appear once activity begins across the platform.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button asChild>
          <a href={exportHref}>Export CSV</a>
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Total users"
          primary={data.totals.usersAllTime}
          secondary={`+${data.totals.users30d} last 30d`}
        />
        <MetricCard
          label="Total briefs"
          primary={data.totals.briefsAllTime}
          secondary={`+${data.totals.briefs30d} last 30d`}
        />
        <MetricCard
          label="Avg briefs per user"
          primary={data.totals.avgBriefsPerUser.toFixed(2)}
          secondary={`${data.totals.retentionPercent}% retention`}
        />
        <MetricCard
          label="Avg generation time"
          primary={`${(data.totals.avgGenerationMs / 1000).toFixed(1)}s`}
          secondary="LLM processing window"
        />
        <MetricCard
          label="Avg feedback rating"
          primary={
            data.totals.avgFeedbackRating
              ? `${data.totals.avgFeedbackRating.toFixed(2)} / 5`
              : "—"
          }
          secondary="Across all briefs"
        />
        <MetricCard
          label="Cost per brief"
          primary={`$${data.totals.costPerBrief.toFixed(2)}`}
          secondary="Includes LLM + infra"
        />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <TrendCard
          title="Users per day (30d)"
          data={data.trends.users}
          dataKey="value"
        />
        <TrendCard
          title="Briefs per day (30d)"
          data={data.trends.briefs}
          dataKey="value"
        />
      </section>
    </div>
  );
}

const MetricCard = ({
  label,
  primary,
  secondary,
}: {
  label: string;
  primary: string | number;
  secondary?: string;
}) => (
  <div className="rounded-[32px] border border-border/60 bg-card/70 p-6">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-3xl font-semibold text-foreground">{primary}</p>
    {secondary && (
      <p className="text-xs text-muted-foreground">{secondary}</p>
    )}
  </div>
);

const TrendCard = ({
  title,
  data,
  dataKey,
}: {
  title: string;
  data: Array<{ date: string; value: number }>;
  dataKey: string;
}) => (
  <div className="rounded-[32px] border border-border/60 bg-card/70 p-6">
    <p className="mb-4 text-sm font-medium text-foreground">{title}</p>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="hsl(var(--primary))"
            fillOpacity={1}
            fill="url(#trend)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);
