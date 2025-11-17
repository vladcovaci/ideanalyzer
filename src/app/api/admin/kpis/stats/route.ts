import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin";

const LLM_COST_PER_BRIEF = Number(process.env.LLM_COST_PER_BRIEF || "0.35");

const dailyRange = Array.from({ length: 30 }).map((_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - index));
  date.setHours(0, 0, 0, 0);
  return date;
});

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsers,
    totalBriefs,
    recentBriefs,
    briefStats,
    feedbackStats,
    dailyUsers,
    dailyBriefs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: last30 } } }),
    prisma.brief.count(),
    prisma.brief.count({ where: { createdAt: { gte: last30 } } }),
    prisma.brief.aggregate({
      _avg: { generationTimeMs: true },
      _sum: { generationTimeMs: true },
    }),
    prisma.feedback.aggregate({
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.user.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: last30 } },
      _count: { _all: true },
    }),
    prisma.brief.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: last30 } },
      _count: { _all: true },
    }),
  ]);

  const usersWithMultipleBriefs = (
    await prisma.brief.groupBy({
      by: ["userId"],
      _count: { _all: true },
    })
  ).filter((group) => group._count._all > 1);

  const retention =
    totalUsers > 0
      ? Math.round((usersWithMultipleBriefs.length / totalUsers) * 100)
      : 0;

  const avgBriefsPerUser =
    totalUsers > 0 ? Number((totalBriefs / totalUsers).toFixed(2)) : 0;

  const dailyUserTrend = dailyRange.map((day) => {
    const match = dailyUsers.find(
      (entry) =>
        new Date(entry.createdAt).toDateString() === day.toDateString()
    );
    return {
      date: day.toISOString().slice(0, 10),
      value: match?._count?._all ?? 0,
    };
  });

  const dailyBriefTrend = dailyRange.map((day) => {
    const match = dailyBriefs.find(
      (entry) =>
        new Date(entry.createdAt).toDateString() === day.toDateString()
    );
    return {
      date: day.toISOString().slice(0, 10),
      value: match?._count?._all ?? 0,
    };
  });

  const costPerBrief =
    totalBriefs > 0 ? Number((LLM_COST_PER_BRIEF).toFixed(2)) : 0;

  return NextResponse.json({
    totals: {
      usersAllTime: totalUsers,
      users30d: newUsers,
      briefsAllTime: totalBriefs,
      briefs30d: recentBriefs,
      avgBriefsPerUser,
      avgGenerationMs: briefStats._avg.generationTimeMs ?? 0,
      retentionPercent: retention,
      avgFeedbackRating: feedbackStats._avg.rating ?? null,
      costPerBrief,
    },
    trends: {
      users: dailyUserTrend,
      briefs: dailyBriefTrend,
    },
  });
}
