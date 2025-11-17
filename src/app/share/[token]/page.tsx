import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ResearchBriefBody } from "@/components/research/brief-body";
import type { ResearchBriefResult } from "@/lib/research/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Shared Research Brief | Idea Analyzer",
  description: "View a shared research brief",
};

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Find the brief by share token
  const brief = await prisma.brief.findFirst({
    where: {
      shareToken: token,
      isPublic: true, // Only allow access to public briefs
    },
    include: {
      idea: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!brief) {
    notFound();
  }

  const content = brief.content as ResearchBriefResult;

  const generatedOn = new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(brief.completedAt ?? brief.createdAt));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/40 bg-gradient-to-b from-background/95 to-background/60 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-12">
          {/* Shared Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="default" className="border-[color:var(--glass-border)] backdrop-blur-sm">
              Shared Research Brief
            </Badge>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-coral">
              Research Brief
            </p>
            <h1 className="bg-gradient-to-br from-foreground to-foreground-secondary bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-4xl">
              {brief.idea?.title ?? "Untitled idea"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Generated on {generatedOn}
              {brief.user?.name && ` • Shared by ${brief.user.name}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {content.industryTag ? (
              <Badge variant="default" className="border-[color:var(--glass-border)] backdrop-blur-sm">
                {content.industryTag}
              </Badge>
            ) : null}
            {content.businessType ? (
              <Badge variant="default" className="border-[color:var(--glass-border)] backdrop-blur-sm">
                {content.businessType}
              </Badge>
            ) : null}
          </div>

          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">{content.description}</p>
        </div>
      </header>

      {/* Brief Content */}
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12">
        <ResearchBriefBody content={content} />

        <div className="glass-strong space-y-4 rounded-[32px] border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] p-8 shadow-lg transition hover:shadow-xl">
          <div>
            <h3 className="text-2xl font-semibold text-foreground">Generate your own brief</h3>
            <p className="text-sm text-muted-foreground">
              Continue iterating with our assistant to validate your next idea and share it with your team.
            </p>
          </div>
          <Button asChild size="lg" className="shadow-md">
            <Link href="/dashboard/analyze">Start New Analysis</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
