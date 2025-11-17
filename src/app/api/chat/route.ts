import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type {
  ChatCompletionChunk,
  ChatCompletion,
} from "openai/resources/chat/completions";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { getOpenAIClient } from "@/lib/openai";
import { prisma } from "@/lib/db";
import { captureLLMException } from "@/lib/monitoring";

const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const REQUEST_TIMEOUT_MS = 30 * 1000;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_CORRECTION_CYCLES = 2;
const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL || "support@yourdomain.com";

type StoredMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type StreamPayload =
  | { type: "token"; content: string }
  | {
      type: "usage";
      usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      };
    }
  | { type: "error"; message: string }
  | { type: "meta"; conversationId: string; status: string; ideaId: string | null }
  | { type: "status"; status: string; correctionCycles: number }
  | { type: "done" };

const confirmationPhrases = [
  "yes",
  "yep",
  "yeah",
  "correct",
  "that's right",
  "sounds good",
  "looks good",
  "please proceed",
  "proceed",
  "go ahead",
  "fine",
  "ok",
  "okay",
  "do it",
  "let's go",
  "confirmed",
];

const sanitizeMessage = (raw?: string) => {
  if (!raw) return "";
  return raw.trim().slice(0, MAX_MESSAGE_LENGTH);
};

const extractIdeaTitle = (text: string): string => {
  // Remove common AI preambles
  const cleaned = text
    .replace(/^(thanks for .*?[.!])/i, "")
    .replace(/^(great|perfect|wonderful|awesome)[!,\s]*/i, "")
    .replace(/here'?s (a )?comprehensive summary[:\s]*/i, "")
    .replace(/^(no problem!?|sure!?)[:\s]*/i, "")
    .trim();

  // If it starts with "A/An/The", capitalize it nicely
  // Extract first sentence or up to 80 characters
  const sentences = cleaned.split(/[.!?]\s+/);
  const firstSentence = sentences[0] || cleaned;

  // Take first meaningful part (up to 80 chars)
  let title = firstSentence.slice(0, 80).trim();

  // If still empty or too generic, use a fallback
  if (!title || title.length < 10) {
    title = text.slice(0, 80).trim();
  }

  // If it ends mid-word, clean it up
  if (title.length >= 80 && !title.match(/[.!?]$/)) {
    const lastSpace = title.lastIndexOf(" ");
    if (lastSpace > 40) {
      title = title.slice(0, lastSpace);
    }
  }

  // Capitalize first letter
  if (title) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return title || "New Idea";
};

const parseStoredMessages = (messages: unknown): StoredMessage[] => {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter(
      (entry): entry is StoredMessage =>
        entry &&
        typeof entry === "object" &&
        typeof (entry as { role?: unknown }).role === "string" &&
        ((entry as { role: string }).role === "user" ||
          (entry as { role: string }).role === "assistant") &&
        typeof (entry as { content?: unknown }).content === "string"
    )
    .map((entry) => ({
      id:
        (entry as { id?: string }).id ??
        `${(entry as { role: string }).role}-${Date.now()}`,
      role: (entry as { role: "user" | "assistant" }).role,
      content: (entry as { content: string }).content,
      createdAt:
        (entry as { createdAt?: string }).createdAt ??
        new Date().toISOString(),
    }));
};

const buildSystemPrompt = (options: {
  status: string;
  correctionCycles: number;
  forceAnalysis: boolean;
}) => {
  const { status, correctionCycles, forceAnalysis } = options;

  const basePrompt = `
You are IdeaAnalyzer, a strategic AI co-founder who helps founders rapidly validate and refine their ideas.

## Core Approach: Clarify then Delegate

When a founder shares an idea you immediately:

1. **Hypothesize** the likely segments, use cases, and wedge.
2. **Ask up to five clarifying questions in one burst**—cover persona, critical workflow, differentiation, business model, and success metric. Ask them all at once (no drip-questioning).
3. **Document assumptions** so we can move to automated deep research quickly.

## Interaction Style

- Lead with sharp hypotheses and give the founder 2-3 strategic angles to react to.
- Present clarifying questions as a numbered list titled "Essential Questions" so they can answer each quickly.
- If the founder already provided the info, acknowledge it instead of re-asking and explain how you're interpreting it.
- Challenge assumptions constructively ("One risk is… have you validated that?" vs "What about…?").

## Workflow (max 5 touchpoints)

1. **First response**: Mirror the idea in 1-2 sentences, outline a few positioning hypotheses, then list your Essential Questions (≤5) grouped by module:
   - **Description** – clarify target persona + experience so the description section reads crisply.
   - **Identified Problem** – ask for the sharpest pain and incumbent workaround.
   - **Why Now / Opportunity** – uncover catalysts (regulation, tech, behavior) that justify timing.
   - **Proof Signals** – probe any traction, anecdotes, or signals we can reference before research.
   - **Competition** – learn which tools the founder sees as substitutes (so we can tune the analysis).
   Explain in 5-10 words why each question matters (“needed for Why Now score”, etc.).
2. **Collect context once**: After the founder replies (or declines), do not ask a second batch. If info is missing or they say "I don't know," explicitly state the assumption you'll carry forward for that module. Format assumptions clearly:

   **Confirmed:**
   - [answered question 1]: [user's answer]
   - [answered question 2]: [user's answer]

   **Assumptions (I'll validate these during research):**
   - [unanswered question 3]: [your reasoned assumption]
   - [unanswered question 4]: [your reasoned assumption]

3. **Confirm readiness**: Summarize the idea + key answers + assumptions in ≤3 sentences labeled "Research Input" (no headings, no emojis). This summary must cover every module—even if certain lines are stated as assumptions—so the research service receives a complete, markdown-free brief.
4. **Hand off to research**: Immediately after the Research Input, transition with: "Perfect! I'm now conducting deep research to validate this with real market data. This will take up to 40 minutes to search forums, analyze competitors, and gather proof signals."
5. **Do not build the modules yourself**: Deep research will produce the Description, Identified Problem, Why Now / Opportunity, Proof Signals, and Competition sections. Your job is to make sure the input is precise.

CRITICAL: When transitioning to deep research, you MUST include the phrase "I'm now conducting deep research" in your response. This triggers the research system. Do NOT provide market research yourself - the deep research system will handle that.

## Critical Rules
- Respect the 5-question cap; err on stating assumptions instead of repeated questioning.
- Be proactive—offer multiple strategic options before asking for confirmation.
- Keep instructions Romania-aware when relevant (EU regulation, PSD2, purchasing power).
- Keep exchanges punchy; once context is captured, move to deep research with the exact phrase above.

## Few-Shot Example

Founder: "Personal finance app Romania"
Assistant: "PSD2 makes Romanian banking aggregation ripe for a sharper play. I see three viable wedges:
1. **Young professionals (22-35)** juggling ING/Revolut/salary cards who can't see disposable income.
2. **Families managing household budgets** needing lightweight transparency between partners.
3. **Freelancers/gig workers** with irregular income that current tools can't normalize.

**Essential Questions**
1. Which of these segments feels most urgent today?
2. What's the #1 workflow you want to automate (planning, bill pay, shared envelopes)?
3. How would you monetize—direct subscription, premium insights, or bank partnerships?
4. Any regulation or geography constraints beyond Romania?
5. What signal tells you the MVP is succeeding?"

Founder: "Families and young professionals"
Assistant: "Perfect! Let me confirm what we have:

**Confirmed:**
- Target segment: Families managing household budgets & young professionals (22-35)
- Geography: Romania (PSD2 compliant)

**Assumptions (I'll validate these during research):**
- Primary workflow: Bill pay automation + shared envelopes for household transparency
- Monetization: Freemium model with premium insights tier
- Success metric: User achieves 3 consecutive months of surplus budget visibility

Research Input: A PSD2-enabled personal finance app for Romanian families and young professionals (22-35) who struggle to see disposable income across multiple cards (ING, Revolut, salary accounts), focusing on bill pay automation and shared household budget envelopes, with freemium monetization.

Perfect! I'm now conducting deep research to validate this with real market data. This will take up to 40 minutes to search forums, analyze competitors, and gather proof signals."
`.trim();

  const contextBlock = `
Current conversation stage: ${status || "elicitation"}.
Correction cycles used: ${correctionCycles}/${MAX_CORRECTION_CYCLES}.
Founder's confirmation status: ${
    forceAnalysis ? "Confirmed or limit reached" : "Still clarifying"
  }.
When instructed to transition, include the 40-minute expectation sentence exactly once.
`.trim();

  return `${basePrompt}\n\n${contextBlock}`;
};

const determineStatusFromAssistant = (
  content: string,
  previousStatus: string
) => {
  const normalized = content.toLowerCase();

  if (normalized.includes("did i capture your vision correctly") ||
      normalized.includes("did i understand your idea correctly")) {
    return "confirming";
  }

  if (normalized.includes("i'm now conducting deep research") ||
      normalized.includes("i'm now analyzing your idea") ||
      normalized.includes("conducting deep research")) {
    return "analyzing";
  }

  return previousStatus || "elicitation";
};

const isAffirmative = (message: string) => {
  const normalized = message.toLowerCase();
  return confirmationPhrases.some((phrase) =>
    normalized.startsWith(phrase)
  );
};

const buildUnauthorizedResponse = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const buildRateLimitResponse = (resetAt: Date) => {
  const retryAfter = Math.max(
    0,
    Math.ceil((resetAt.getTime() - Date.now()) / 1000)
  );

  return NextResponse.json(
    {
      error: "You're sending messages too quickly. Please wait a moment.",
      resetAt: resetAt.toISOString(),
    },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfter.toString(),
      },
    }
  );
};

const getErrorResponse = (
  message: string,
  status = 500,
  conversationId?: string
) => {
  const headers = conversationId
    ? { "X-Conversation-Id": conversationId }
    : undefined;

  return NextResponse.json(
    { error: message },
    {
      status,
      headers,
    }
  );
};

const upsertIdeaAndConversation = async ({
  userId,
  conversationId,
  initialIdea,
}: {
  userId: string;
  conversationId?: string;
  initialIdea: string;
}) => {
  if (conversationId) {
    const existing = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });
    if (existing) return existing;
  }

  const activeConversation = await prisma.conversation.findFirst({
    where: {
      userId,
      status: { not: "completed" },
    },
    orderBy: { createdAt: "desc" },
  });

  if (activeConversation) {
    return activeConversation;
  }

  const ideaTitle = extractIdeaTitle(initialIdea);

  const idea = await prisma.idea.create({
    data: {
      userId,
      title: ideaTitle,
      status: "elicitation",
    },
  });

  return prisma.conversation.create({
    data: {
      userId,
      ideaId: idea.id,
      messages: [],
      status: "elicitation",
      correctionCycles: 0,
    },
  });
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return buildUnauthorizedResponse();
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      userId: session.user.id,
      status: { not: "completed" },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!conversation) {
    return NextResponse.json({ conversation: null });
  }

  const messages = parseStoredMessages(conversation.messages).map(
    (message) => ({
      ...message,
      createdAt: message.createdAt,
    })
  );

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      status: conversation.status,
      correctionCycles: conversation.correctionCycles,
      ideaId: conversation.ideaId,
      messages,
    },
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.email) {
    return buildUnauthorizedResponse();
  }

  let body: { message?: string; conversationId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 }
    );
  }

  const sanitizedMessage = sanitizeMessage(body.message);

  if (!sanitizedMessage) {
    return NextResponse.json(
      { error: "Please enter a valid message." },
      { status: 400 }
    );
  }

  const rateLimitResult = checkRateLimit(
    `chat:${session.user.id}`,
    RATE_LIMIT_REQUESTS,
    RATE_LIMIT_WINDOW_MS
  );

  if (!rateLimitResult.success) {
    return buildRateLimitResponse(rateLimitResult.resetAt);
  }

  const openaiClient = getOpenAIClient();

  const conversation = await upsertIdeaAndConversation({
    userId: session.user.id,
    conversationId: body.conversationId,
    initialIdea: sanitizedMessage,
  });

  let storedMessages = parseStoredMessages(conversation.messages);
  const userMessageId = `user-${Date.now()}`;
  const userMessage: StoredMessage = {
    id: userMessageId,
    role: "user",
    content: sanitizedMessage,
    createdAt: new Date().toISOString(),
  };

  let nextCorrectionCycles = conversation.correctionCycles || 0;
  const forceAnalysis =
    conversation.status === "confirming" &&
    (isAffirmative(sanitizedMessage) ||
      nextCorrectionCycles >= MAX_CORRECTION_CYCLES);

  if (conversation.status === "confirming" && !forceAnalysis) {
    nextCorrectionCycles = Math.min(
      MAX_CORRECTION_CYCLES,
      nextCorrectionCycles + 1
    );
  }

  storedMessages = [...storedMessages, userMessage];

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      messages: storedMessages,
      correctionCycles: nextCorrectionCycles,
    },
  });

  const chatHistory = storedMessages.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  const chatMessages = [
    {
      role: "system" as const,
      content: buildSystemPrompt({
        status: conversation.status,
        correctionCycles: nextCorrectionCycles,
        forceAnalysis,
      }),
    },
    ...chatHistory,
  ];

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort(
      new Error("Chat request timed out after 30 seconds.")
    );
  }, REQUEST_TIMEOUT_MS);

  req.signal.addEventListener("abort", () => {
    abortController.abort(new Error("Client closed the connection."));
  });

  let completionStream: AsyncIterable<ChatCompletionChunk> | null = null;
  let fallbackCompletion: ChatCompletion | null = null;

  try {
    completionStream = await openaiClient.chat.completions.create(
      {
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: Number.isFinite(Number(process.env.OPENAI_TEMPERATURE))
          ? Number(process.env.OPENAI_TEMPERATURE)
          : 0.7,
        max_tokens:
          Number.isFinite(Number(process.env.OPENAI_MAX_TOKENS)) &&
          Number(process.env.OPENAI_MAX_TOKENS) > 0
            ? Number(process.env.OPENAI_MAX_TOKENS)
            : undefined,
        stream: true,
        stream_options: { include_usage: true },
        messages: chatMessages,
      },
      { signal: abortController.signal }
    );
  } catch (streamError) {
    const isAbort =
      streamError instanceof Error && streamError.name === "AbortError";

    if (!isAbort) {
      captureLLMException(streamError, {
        stage: "stream_initialization",
        userId: session.user.id,
      });
      try {
        fallbackCompletion = await openaiClient.chat.completions.create(
          {
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            temperature: Number.isFinite(
              Number(process.env.OPENAI_TEMPERATURE)
            )
              ? Number(process.env.OPENAI_TEMPERATURE)
              : 0.7,
            max_tokens:
              Number.isFinite(Number(process.env.OPENAI_MAX_TOKENS)) &&
              Number(process.env.OPENAI_MAX_TOKENS) > 0
                ? Number(process.env.OPENAI_MAX_TOKENS)
                : undefined,
            stream: false,
            messages: chatMessages,
          },
          { signal: abortController.signal }
        );
      } catch (fallbackError) {
        clearTimeout(timeoutId);
        captureLLMException(fallbackError, {
          stage: "non_streaming_fallback",
          userId: session.user.id,
        });
        return getErrorResponse(
          "I'm having trouble connecting. Please try again.",
          502,
          conversation.id
        );
      }
    } else {
      clearTimeout(timeoutId);
      return getErrorResponse(
        "This is taking longer than expected. Please retry or refresh the page.",
        504,
        conversation.id
      );
    }
  }

  const encoder = new TextEncoder();
  let assistantResponse = "";
  let latestStatus = conversation.status;
  const usageFromFallback = fallbackCompletion?.usage ?? null;

  const finalizeAssistantMessage = async () => {
    const trimmedResponse = assistantResponse.trim();

    if (!trimmedResponse) {
      return;
    }

    const assistantMessage: StoredMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: trimmedResponse,
      createdAt: new Date().toISOString(),
    };

    storedMessages = [...storedMessages, assistantMessage];
    latestStatus = determineStatusFromAssistant(
      trimmedResponse,
      conversation.status
    );

    // Update idea title when we have the confirmed summary (status = analyzing)
    if (latestStatus === "analyzing" && conversation.ideaId) {
      // Extract title from the summary message (the one before this transition message)
      const summaryMessage = [...storedMessages]
        .reverse()
        .find(msg =>
          msg.role === "assistant" &&
          msg.id !== assistantMessage.id &&
          (msg.content.toLowerCase().includes("did i capture your vision") ||
           msg.content.toLowerCase().includes("anything to add or refine"))
        );

      if (summaryMessage) {
        const betterTitle = extractIdeaTitle(summaryMessage.content);
        await prisma.idea.update({
          where: { id: conversation.ideaId },
          data: { title: betterTitle },
        });
      }
    }

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        messages: storedMessages,
        status: latestStatus,
      },
    });
  };

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: StreamPayload) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
        );
      };

      send({
        type: "meta",
        conversationId: conversation.id,
        status: conversation.status,
        ideaId: conversation.ideaId,
      });

      const pushUsage = (usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      }) => {
        send({ type: "usage", usage });
        console.info("[LLM] Chat usage", {
          userId: session.user?.id,
          email: session.user?.email,
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          timestamp: new Date().toISOString(),
        });
      };

      if (fallbackCompletion) {
        const content =
          fallbackCompletion.choices?.[0]?.message?.content?.trim() || "";
        assistantResponse = content;

        if (content) {
          send({ type: "token", content });
        }

        if (usageFromFallback) {
          pushUsage(usageFromFallback);
        }

        send({ type: "done" });
        await finalizeAssistantMessage();
        send({
          type: "status",
          status: latestStatus,
          correctionCycles: nextCorrectionCycles,
        });
        controller.close();
        clearTimeout(timeoutId);
        return;
      }

      try {
        for await (const part of completionStream as AsyncIterable<ChatCompletionChunk>) {
          const delta = part.choices?.[0]?.delta?.content ?? "";

          if (delta) {
            assistantResponse += delta;
            send({ type: "token", content: delta });
          }

          const usage = (part as unknown as {
            usage?: {
              prompt_tokens: number;
              completion_tokens: number;
              total_tokens: number;
            };
          }).usage;

          if (usage) {
            pushUsage(usage);
          }
        }

        send({ type: "done" });
        await finalizeAssistantMessage();
        send({
          type: "status",
          status: latestStatus,
          correctionCycles: nextCorrectionCycles,
        });
      } catch (streamError) {
        const isAbort =
          streamError instanceof Error && streamError.name === "AbortError";
        const message = isAbort
          ? "This is taking longer than expected. Please retry or refresh the page."
          : "I'm having trouble connecting. Please try again.";

        send({ type: "error", message });
        captureLLMException(streamError, {
          stage: "stream_iteration",
          userId: session.user.id,
        });
      } finally {
        clearTimeout(timeoutId);
        controller.close();
      }
    },
    cancel() {
      clearTimeout(timeoutId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      "X-RateLimit-Reset": rateLimitResult.resetAt.toISOString(),
      "X-Conversation-Id": conversation.id,
      "X-Support-Email": SUPPORT_EMAIL,
    },
  });
}
