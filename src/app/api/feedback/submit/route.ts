import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { trackServerEvent } from "@/lib/analytics/server";

const bodySchema = z.object({
  briefId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comments: z.string().max(500).optional(),
  sectionRatings: z
    .record(z.enum(["competition", "keywords", "whyNow", "proofSignals"]), z.enum(["low", "medium", "high"]))
    .optional(),
});

export async function POST(req: Request) {
  const apiStart = Date.now();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: z.infer<typeof bodySchema>;
  try {
    payload = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const brief = await prisma.brief.findUnique({
    where: { id: payload.briefId },
    select: { id: true, userId: true },
  });

  if (!brief) {
    return NextResponse.json({ error: "Brief not found." }, { status: 404 });
  }

  if (brief.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.feedback.findFirst({
    where: {
      briefId: payload.briefId,
      userId: session.user.id,
    },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ error: "Feedback already submitted." }, { status: 409 });
  }

  await prisma.feedback.create({
    data: {
      briefId: payload.briefId,
      userId: session.user.id,
      rating: payload.rating,
      comments: payload.comments?.trim() || null,
      sectionRatings: payload.sectionRatings ?? undefined,
    },
  });

  await trackServerEvent({
    event: "feedback_submitted",
    distinctId: session.user.id,
    properties: {
      brief_id: payload.briefId,
      rating: payload.rating,
      sections: payload.sectionRatings,
    },
  });

  await trackServerEvent({
    event: "api_response",
    properties: {
      path: "/api/feedback/submit",
      duration_ms: Date.now() - apiStart,
    },
  });

  return NextResponse.json({ success: true });
}
