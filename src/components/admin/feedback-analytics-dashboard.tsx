"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type StatsResponse = {
  totalCount: number;
  averageRating: number | null;
  distribution: Record<number, number>;
  sectionAverages: Array<{
    section: string;
    average: number | null;
    responses: number;
  }>;
  comments: Array<{
    rating: number;
    comments: string | null;
    createdAt: string;
    user: { email: string | null; name: string | null } | null;
  }>;
};

const FILTER_OPTIONS = {
  dateRange: [
    { label: "Last 7 days", value: "7" },
    { label: "Last 30 days", value: "30" },
    { label: "All time", value: "all" },
  ],
  cohort: [
    { label: "All users", value: "all" },
    { label: "Founders", value: "founder" },
    { label: "Team/Admin", value: "team" },
  ],
  minRating: [
    { label: "All ratings", value: "0" },
    { label: "3+ stars", value: "3" },
    { label: "4+ stars", value: "4" },
  ],
};

const formatSectionLabel = (section: string) => {
  switch (section) {
    case "competition":
      return "Competition Analysis";
    case "keywords":
      return "Keyword Analytics";
    case "whyNow":
      return "Why Now?";
    case "proofSignals":
      return "Proof Signals";
    default:
      return section;
  }
};

export function FeedbackAnalyticsDashboard() {
  const [filters, setFilters] = useState({
    dateRange: "30",
    cohort: "all",
    minRating: "0",
  });
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (filters.dateRange !== "all") {
      const days = Number(filters.dateRange);
      const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      qs.set("from", from.toISOString());
    }
    if (filters.cohort !== "all") qs.set("cohort", filters.cohort);
    if (filters.minRating !== "0") qs.set("minRating", filters.minRating);

    const response = await fetch(`/api/admin/feedback/stats?${qs.toString()}`);
    if (!response.ok) {
      setData(null);
      setLoading(false);
      return;
    }
    const stats = (await response.json()) as StatsResponse;
    setData(stats);
    setLoading(false);
  };

  useEffect(() => {
    void fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const distributionData = useMemo(
    () =>
      [1, 2, 3, 4, 5].map((rating) => ({
        rating,
        count: data?.distribution?.[rating] ?? 0,
      })),
    [data]
  );

  const exportHref = useMemo(() => {
    const qs = new URLSearchParams();
    if (filters.dateRange !== "all") {
      const days = Number(filters.dateRange);
      const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      qs.set("from", from.toISOString());
    }
    if (filters.cohort !== "all") qs.set("cohort", filters.cohort);
    if (filters.minRating !== "0") qs.set("minRating", filters.minRating);
    return `/api/admin/feedback/export?${qs.toString()}`;
  }, [filters]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4 rounded-[32px] border border-border/60 bg-card/60 p-6">
        <SelectFilter
          label="Date Range"
          options={FILTER_OPTIONS.dateRange}
          value={filters.dateRange}
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, dateRange: value }))
          }
        />
        <SelectFilter
          label="Cohort"
          options={FILTER_OPTIONS.cohort}
          value={filters.cohort}
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, cohort: value }))
          }
        />
        <SelectFilter
          label="Rating Threshold"
          options={FILTER_OPTIONS.minRating}
          value={filters.minRating}
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, minRating: value }))
          }
        />
        <Button asChild className="ml-auto">
          <a href={exportHref}>Export CSV</a>
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-64 rounded-[32px]" />
      ) : data && data.totalCount > 0 ? (
        <>
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[32px] border border-border/60 bg-card/70 p-6">
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <p className="text-4xl font-semibold text-foreground">
                {data.averageRating?.toFixed(2) ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                Based on {data.totalCount} feedback entries
              </p>
            </div>
            <div className="rounded-[32px] border border-border/60 bg-card/70 p-6">
              <p className="text-sm text-muted-foreground">Section Signals</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {data.sectionAverages.map((section) => (
                  <div
                    key={section.section}
                    className="rounded-2xl border border-border/40 px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {formatSectionLabel(section.section)}
                    </p>
                    <p className="text-xl font-semibold text-foreground">
                      {section.average
                        ? `${(section.average / 5).toFixed(2)} / 5`
                        : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {section.responses} responses
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-border/60 bg-card/70 p-6">
            <p className="mb-4 text-sm font-medium text-foreground">
              Rating distribution
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData}>
                  <XAxis dataKey="rating" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-[32px] border border-border/60 bg-card/70 p-6">
            <p className="mb-4 text-sm font-medium text-foreground">
              Recent qualitative feedback
            </p>
            <div className="space-y-4">
              {data.comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No qualitative feedback for the selected filters.
                </p>
              ) : (
                data.comments.map((comment, index) => (
                  <article
                    key={`${comment.createdAt}-${index}`}
                    className="rounded-2xl border border-border/40 bg-background/80 px-5 py-4"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{comment.user?.email ?? "Unknown user"}</span>
                      <span>{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 text-sm text-foreground">
                      {comment.comments}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-[32px] border border-dashed border-muted px-8 py-12 text-center">
          <p className="text-base font-semibold text-foreground">
            No feedback yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Once founders start reviewing briefs, their feedback will appear here.
          </p>
        </section>
      )}
    </div>
  );
}

function SelectFilter({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <select
        className="rounded-full border border-border bg-background px-3 py-2 text-sm text-foreground"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
