"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";

const performanceData = [
  { month: "Jan", acquisition: 420, retention: 340 },
  { month: "Feb", acquisition: 460, retention: 355 },
  { month: "Mar", acquisition: 520, retention: 380 },
  { month: "Apr", acquisition: 610, retention: 420 },
  { month: "May", acquisition: 690, retention: 455 },
  { month: "Jun", acquisition: 760, retention: 490 },
];

const performanceConfig: ChartConfig = {
  acquisition: {
    label: "New accounts",
    color: "hsl(var(--primary))",
  },
  retention: {
    label: "Net retention",
    color: "hsl(var(--secondary))",
  },
};

const metricCards = [
  {
    label: "Activation rate",
    value: "62.4%",
    change: "+6.2%",
  },
  {
    label: "Time-to-value",
    value: "3.4 days",
    change: "-1.1 days",
  },
  {
    label: "Revenue per account",
    value: "$428",
    change: "+12.8%",
  },
  {
    label: "Churn (rolling 30d)",
    value: "3.6%",
    change: "-0.9 pts",
  },
];

const cohortSegments = [
  { name: "Product qualified leads", volume: 182, lift: "+21%" },
  { name: "Sales assisted", volume: 94, lift: "+8%" },
  { name: "Expansions", volume: 43, lift: "+14%" },
  { name: "Re-engaged", volume: 36, lift: "+5%" },
];

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Analytics
        </p>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Growth and retention analytics
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Understand how product engagement translates into revenue. Blend
              acquisition, activation and retention metrics to guide roadmap
              decisions.
            </p>
          </div>
          <Badge
            variant="outline"
            className="rounded-full border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-4 py-1.5 text-xs font-medium"
          >
            Updated · {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date())}
          </Badge>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="gap-3">
            <div>
              <CardTitle>Account performance</CardTitle>
              <CardDescription>
                Compare new account creation alongside net retention trends.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-6 pt-4 sm:px-6 w-full">
            <ChartContainer config={performanceConfig} className="h-[280px] w-full">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="fill-acquisition" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-acquisition)" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="var(--color-acquisition)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fill-retention" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-retention)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-retention)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="4 6" stroke="rgba(86,112,255,0.15)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={8} />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent indicator="dot" />
                  }
                />
                <Area
                  dataKey="acquisition"
                  type="monotone"
                  fill="url(#fill-acquisition)"
                  stroke="var(--color-acquisition)"
                  strokeWidth={2.5}
                />
                <Area
                  dataKey="retention"
                  type="monotone"
                  fill="url(#fill-retention)"
                  stroke="var(--color-retention)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segment lift</CardTitle>
            <CardDescription>
              Identify which cohorts drive your headline metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cohortSegments.map((segment, index) => (
              <div key={segment.name} className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {segment.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {segment.volume} active accounts
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-full border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-3 py-1 text-xs font-medium text-[hsl(var(--primary))]"
                  >
                    {segment.lift}
                  </Badge>
                </div>
                {index < cohortSegments.length - 1 ? (
                  <Separator className="bg-[color:var(--glass-border)]" />
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Momentum snapshot</CardTitle>
          <CardDescription>
            Quick view of the levers that influence revenue performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-4 py-5"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {metric.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {metric.value}
              </p>
              <p className="text-xs font-medium text-[hsl(var(--primary))]">
                {metric.change}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
