import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin";

const ratingMap = { low: 1, medium: 3, high: 5 } as const;
const filterSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  cohort: z.enum(["all", "founder", "team"]).optional(),
});

export async function GET(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const parsed = filterSchema.safeParse({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    minRating: searchParams.get("minRating") ?? undefined,
    cohort: searchParams.get("cohort") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid filters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const filters = parsed.data;

  const where: Parameters<typeof prisma.feedback.aggregate>[0]["where"] = {};

  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) where.createdAt.gte = new Date(filters.from);
    if (filters.to) where.createdAt.lte = new Date(filters.to);
  }

  if (filters.minRating) {
    where.rating = { gte: filters.minRating };
  }

  if (filters.cohort && filters.cohort !== "all") {
    where.user = {
      role:
        filters.cohort === "team"
          ? { in: ["admin", "team"] }
          : { notIn: ["admin", "team"] },
    };
  }

  const [aggregate, distribution, sectionEntries, comments] =
    await Promise.all([
      prisma.feedback.aggregate({
        where,
        _avg: { rating: true },
        _count: { rating: true },
      }),
      prisma.feedback.groupBy({
        where,
        by: ["rating"],
        _count: { rating: true },
      }),
      prisma.feedback.findMany({
        where,
        select: { sectionRatings: true },
      }),
      prisma.feedback.findMany({
        where: { ...where, comments: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          rating: true,
          comments: true,
          createdAt: true,
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      }),
    ]);

  const distributionMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  distribution.forEach((entry) => {
    distributionMap[entry.rating] = entry._count.rating;
  });

  const sectionTotals: Record<
    string,
    { total: number; count: number }
  > = {
    competition: { total: 0, count: 0 },
    keywords: { total: 0, count: 0 },
    whyNow: { total: 0, count: 0 },
    proofSignals: { total: 0, count: 0 },
  };

  sectionEntries.forEach((entry) => {
    const sections = (entry.sectionRatings as Record<string, keyof typeof ratingMap> | null) ?? {};
    Object.entries(sections).forEach(([key, value]) => {
      if (key in sectionTotals && value in ratingMap) {
        sectionTotals[key].total += ratingMap[value as keyof typeof ratingMap];
        sectionTotals[key].count += 1;
      }
    });
  });

  const sectionAverages = Object.entries(sectionTotals).map(
    ([key, { total, count }]) => ({
      section: key,
      average: count ? total / count : null,
      responses: count,
    })
  );

  return NextResponse.json({
    totalCount: aggregate._count.rating,
    averageRating: aggregate._avg.rating ?? null,
    distribution: distributionMap,
    sectionAverages,
    comments: comments.map((entry) => ({
      rating: entry.rating,
      comments: entry.comments,
      createdAt: entry.createdAt,
      user: entry.user,
    })),
  });
}
