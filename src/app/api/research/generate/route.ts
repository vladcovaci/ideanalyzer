import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { orchestrateResearchBrief } from "@/lib/research/orchestrator";
import { captureLLMException } from "@/lib/monitoring";
import { trackServerEvent } from "@/lib/analytics/server";
import { extractClarifyingContext, extractResearchInput } from "@/lib/research/context-extractor";
import type { ClarifyingContext } from "@/lib/research/types";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

const isConversationMessage = (value: unknown): value is ConversationMessage => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const { role, content } = value as { role?: unknown; content?: unknown };
  return (
    (role === "user" || role === "assistant") &&
    typeof content === "string"
  );
};

// Configure route to allow longer execution time for Deep Research
// Vercel: max 300s (5 min) for Pro, 900s (15 min) for Enterprise
// Self-hosted: can be longer 
export const maxDuration = 1200; // 20 minutes 
export const dynamic = 'force-dynamic';

const requestSchema = z.object({
  summary: z.string().min(20, "Conversation summary is required."),
  conversationId: z.string().min(1).optional(),
  ideaId: z.string().min(1).optional(),   
});

const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const invalidRequest = (details: unknown) =>
  NextResponse.json(
    {
      error: "Invalid request payload.",
      details,
    },
    { status: 400 }
  );

export async function POST(req: Request) {
  const apiStart = Date.now();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return unauthorized();
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return invalidRequest("Body must be valid JSON.");
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return invalidRequest(parsed.error.flatten());
  }

  const { summary, conversationId } = parsed.data;
  let { ideaId } = parsed.data;
  const trimmedSummary = summary.trim();

  console.log("[Research API] Received summary:", trimmedSummary.slice(0, 200));

  if (!trimmedSummary) {
    return invalidRequest("Summary cannot be empty.");
  }

  const userId = session.user.id;

  if (ideaId) {
    const idea = await prisma.idea.findFirst({
      where: { id: ideaId, userId },
      select: { id: true },
    });

    if (!idea) {
      return NextResponse.json(
        { error: "Idea not found." },
        { status: 404 }
      );
    }
  } else if (conversationId) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      select: { ideaId: true },
    });
    if (conversation?.ideaId) {
      ideaId = conversation.ideaId;
    }
  }

  if (!ideaId) {
    const idea = await prisma.idea.create({
      data: {
        userId,
        title: trimmedSummary.slice(0, 120) || "Research brief",
        status: "analyzing",
      },
      select: { id: true },
    });
    ideaId = idea.id;
  } else {
    await prisma.idea.updateMany({
      where: { id: ideaId, userId },
      data: { status: "analyzing" },
    });
  }

  // Extract clarifying context from conversation (if available)
  let clarifyingContext: ClarifyingContext | undefined;
  let researchSummary = trimmedSummary;

  if (conversationId) {
    try {
      const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
        select: { messages: true },
      });

      if (conversation?.messages) {
        // Parse messages and extract context
        const messages: ConversationMessage[] = Array.isArray(conversation.messages)
          ? conversation.messages
              .filter(isConversationMessage)
              .map((msg) => ({ role: msg.role, content: msg.content }))
          : [];

        // Extract clarifying context (user answers + AI assumptions)
        clarifyingContext = extractClarifyingContext(messages);

        // Try to extract the "Research Input" summary from assistant's message
        const extractedInput = extractResearchInput(messages);
        if (extractedInput) {
          researchSummary = extractedInput;
          console.log("[Research API] Using Research Input from conversation:", researchSummary.slice(0, 100));
        }

        if (clarifyingContext) {
          console.log("[Research API] Extracted clarifying context:", {
            userAnswers: Object.keys(clarifyingContext.userAnswers).length,
            aiAssumptions: Object.keys(clarifyingContext.aiAssumptions).length,
          });
        }
      }
    } catch (error) {
      console.warn("[Research API] Failed to extract context from conversation:", error);
      // Continue with original summary if extraction fails
    }
  }

  let orchestrationResult;
  try {
    orchestrationResult = await orchestrateResearchBrief({
      summary: researchSummary,
      userId,
      ideaId,
      conversationId,
      clarifyingContext, // Now includes user answers and AI assumptions!
    });
  } catch (error) {
    captureLLMException(error, {
      stage: "research_orchestration",
      userId,
      ideaId,
    });
    return NextResponse.json(
      { error: "Failed to generate research brief." },
      { status: 500 }
    );
  }

  const status = orchestrationResult.errors.length
    ? "completed_with_warnings"
    : "completed";

  const generatedTitle =
    orchestrationResult.result.description?.split("\n")[0]?.slice(0, 140) ||
    trimmedSummary.slice(0, 140) ||
    "Research brief";

  let briefId: string | null = null;
  let storageWarning: string | null = null;

  try {
    const brief = await prisma.$transaction(async (tx) => {
      await tx.idea.update({
        where: { id: ideaId, userId },
        data: {
          title: generatedTitle,
          status,
        },
      });

      return tx.brief.create({
        data: {
          ideaId,
          userId,
          summary: trimmedSummary,
          content: orchestrationResult.result,
          generationTimeMs: orchestrationResult.result.generationTimeMs,
          status,
          tokenUsage: orchestrationResult.tokenUsage,
          errorLog: orchestrationResult.errors,
          startedAt: new Date(orchestrationResult.startedAt),
          completedAt: new Date(orchestrationResult.completedAt),
        },
        select: { id: true },
      });
    });
    briefId = brief.id;
  } catch (error) {
    captureLLMException(error, {
      stage: "brief_persistence",
      userId,
      ideaId,
    });
    storageWarning =
      "We generated your brief but couldn't save it. Please review and copy the insights before leaving this page.";
  }

  await prisma.idea.updateMany({
    where: { id: ideaId, userId },
    data: { status: "completed", title: generatedTitle },
  });

  if (conversationId) {
    await prisma.conversation.updateMany({
      where: { id: conversationId, userId },
      data: { status: "completed" },
    });
  }

  const totalBriefs = await prisma.brief.count({
    where: { userId },
  });

  await trackServerEvent({
    event: "research_brief_generated",
    distinctId: userId,
    properties: {
      idea_id: ideaId,
      brief_id: briefId,
      generation_time_ms: orchestrationResult.result.generationTimeMs,
      storage_status: storageWarning ? "warning" : "stored",
      total_briefs: totalBriefs,
      errors: orchestrationResult.errors.length,
    },
  });

  await trackServerEvent({
    event: "api_response",
    properties: {
      path: "/api/research/generate",
      duration_ms: Date.now() - apiStart,
    },
  });

  return NextResponse.json({
    briefId,
    ideaId,
    result: orchestrationResult.result,
    errors: orchestrationResult.errors,
    storageWarning,
    tokenUsage: orchestrationResult.tokenUsage,
    metadata: {
      startedAt: orchestrationResult.startedAt,
      completedAt: orchestrationResult.completedAt,
      status,
    },
  });
}
