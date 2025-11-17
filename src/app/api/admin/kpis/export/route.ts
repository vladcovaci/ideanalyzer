import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.brief.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      createdAt: true,
      generationTimeMs: true,
      idea: { select: { title: true } },
    },
  });

  const header = ["Brief ID", "Idea Title", "Created At", "Generation Time (ms)"];
  const csv = [
    header.join(","),
    ...rows.map((row) =>
      [
        row.id,
        row.idea?.title ?? "Untitled",
        row.createdAt.toISOString(),
        row.generationTimeMs ?? 0,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="kpi-briefs.csv"`,
    },
  });
}
