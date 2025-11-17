import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardTracker } from "@/components/analytics/dashboard-tracker";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  MessageCircle,
  FileText,
  ArrowRight,
} from "lucide-react";
import {
  MyIdeasSection,
  MyIdeasSkeleton,
} from "@/components/dashboard/my-ideas-list";

const quickStartSteps = [
  {
    title: "Describe your idea",
    description: "Tell us what you’re building and who it serves.",
    icon: Lightbulb,
  },
  {
    title: "Answer questions",
    description: "Clarify your market, customer, and differentiation.",
    icon: MessageCircle,
  },
  {
    title: "Get insights",
    description: "Receive a full research brief with analysis and proof.",
    icon: FileText,
  },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=%2Fdashboard");
  }
  const totalBriefs = await prisma.brief.count({
    where: { userId: session.user.id },
  });

  const hasBriefs = totalBriefs > 0;

  return (
    <DashboardShell>
      <DashboardTracker userId={session.user.id} />
      <div className="flex flex-col gap-6">
        <header className="glass-strong flex flex-col gap-3 rounded-[32px] border border-border/60 bg-card/80 p-8 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="bg-gradient-to-br from-foreground to-foreground-secondary bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
              Let&apos;s validate your next big idea.
            </h1>
          </div>
          <Button asChild size="lg" className="mt-4 w-full shadow-md sm:mt-0 sm:w-auto">
            <Link href="/dashboard/analyze">
              Start New Analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </header>

        {!hasBriefs && (
          <section className="glass rounded-[32px] border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-8 shadow-lg">
            <div className="mb-6 space-y-3">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary">
                Get Started
              </p>
              <h2 className="bg-gradient-to-br from-primary to-primary-hover bg-clip-text text-3xl font-bold text-transparent">
                Your first research brief is moments away
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                Follow the three steps below to move from idea to insight in
                under 15 minutes.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {quickStartSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="glass-strong group rounded-2xl border border-[color:var(--glass-border)] bg-card/90 p-5 text-left shadow-md transition hover:scale-[1.02] hover:shadow-lg"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-md">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wide text-primary">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <Suspense fallback={<MyIdeasSkeleton />}>
          <MyIdeasSection userId={session.user.id} totalCount={totalBriefs} />
        </Suspense>
      </div>
    </DashboardShell>
  );
}
