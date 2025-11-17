import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin";

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
  const where: Parameters<typeof prisma.feedback.findMany>[0]["where"] = {};

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

  const rows = await prisma.feedback.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      sectionRatings: true,
      comments: true,
      createdAt: true,
      user: {
        select: { email: true, name: true },
      },
      brief: {
        select: { idea: { select: { title: true } } },
      },
    },
  });

  const header = [
    "Feedback ID",
    "Rating",
    "Competition",
    "Keywords",
    "WhyNow",
    "ProofSignals",
    "Comments",
    "Created At",
    "User Email",
    "Idea Title",
  ];

  const csvRows = [
    header.join(","),
    ...rows.map((row) => {
      const sections = (row.sectionRatings ?? {}) as Record<string, string>;
      return [
        row.id,
        row.rating,
        sections.competition ?? "",
        sections.keywords ?? "",
        sections.whyNow ?? "",
        sections.proofSignals ?? "",
        JSON.stringify(row.comments ?? ""),
        row.createdAt.toISOString(),
        row.user?.email ?? "",
        row.brief?.idea?.title ?? "",
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",");
    }),
  ].join("\n");

  return new NextResponse(csvRows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="feedback-export.csv"`,
    },
  });
}
