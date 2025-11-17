import { prisma } from "@/lib/db";
import { Skeleton } from "@/components/ui/skeleton";
import { MyIdeasListClient } from "./my-ideas-list-client";

export function MyIdeasSkeleton() {
  return (
    <section className="glass-strong rounded-[32px] border border-border/80 bg-background/80 p-8 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-40 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-2xl" />
        ))}
      </div>
    </section>
  );
}

export async function MyIdeasSection({
  userId,
  totalCount,
}: {
  userId: string;
  totalCount: number;
}) {
  const briefs = await prisma.brief.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { idea: true },
    take: 11,
  });

  const hasBriefs = totalCount > 0;
  const displayBriefs = briefs.slice(0, 10).map((brief) => ({
    id: brief.id,
    title: brief.idea?.title ?? "Untitled idea",
    industryTag: (brief.content as { industryTag?: string })?.industryTag ?? null,
    createdAt: brief.createdAt.toISOString(),
    status: brief.status,
    summary: brief.summary ?? (brief.content as { description?: string })?.description ?? "",
    isPublic: brief.isPublic,
    shareToken: brief.shareToken,
  }));

  return (
    <MyIdeasListClient
      briefs={displayBriefs}
      hasBriefs={hasBriefs}
      totalCount={totalCount}
      hasMoreThanTen={briefs.length > 10}
    />
  );
}
