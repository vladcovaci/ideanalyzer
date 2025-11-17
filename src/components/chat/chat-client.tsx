"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { getIdeaFromStorage, clearIdeaFromStorage } from "@/lib/idea-storage";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  getStoredResearchJob,
  initializeResearchJob,
} from "@/lib/research/job-storage";
import {
  savePendingSummary,
  getPendingSummary,
  clearPendingSummary,
} from "@/lib/research/summary-storage";
import { trackClientEvent } from "@/lib/analytics/client";

const MAX_PRELOADED_IDEA_LENGTH = 4000;
const LOGIN_REDIRECT =
  "/login?callbackUrl=%2Fdashboard%2Fanalyze&reason=analyze";
const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@yourdomain.com";

type ConversationStatus = "elicitation" | "confirming" | "analyzing" | "completed";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ConversationResponse {
  conversation: null | {
    id: string;
    ideaId?: string | null;
    status: ConversationStatus;
    correctionCycles: number;
    messages: { id: string; role: "user" | "assistant"; content: string; createdAt: string }[];
  };
}

const sanitizeIdeaText = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.slice(0, MAX_PRELOADED_IDEA_LENGTH);
};

const logError = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(...args);
  }
};

const extractSummaryText = (content: string) => {
  if (!content) return "";

  const lower = content.toLowerCase();

  // NEW FORMAT: Check for "Research Input:" section
  const researchInputIndex = lower.indexOf("research input:");
  if (researchInputIndex !== -1) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[Summary Extraction] Found 'Research Input:' marker");
    }

    // Extract everything after "Research Input:" up to next section or transition
    const afterResearchInput = content.slice(researchInputIndex + "research input:".length);

    // Find where the summary ends (before "Perfect!" or "I'm now conducting")
    const endMarkers = [
      "\n\nperfect!",
      "\n\ni'm now",
      "\n\ngreat!",
      "perfect! i'm now conducting",
      "i'm now conducting deep research",
    ];

    let summaryEnd = afterResearchInput.length;
    for (const marker of endMarkers) {
      const idx = afterResearchInput.toLowerCase().indexOf(marker);
      if (idx !== -1 && idx < summaryEnd) {
        summaryEnd = idx;
        if (process.env.NODE_ENV !== "production") {
          console.log(`[Summary Extraction] Found end marker: "${marker}"`);
        }
      }
    }

    let summary = afterResearchInput.slice(0, summaryEnd).trim();

    // Remove any leading/trailing quotes, newlines
    summary = summary.replace(/^["'\n\s]+|["'\n\s]+$/g, "");

    if (process.env.NODE_ENV !== "production") {
      console.log("[Summary Extraction] Extracted summary length:", summary.length);
      console.log("[Summary Extraction] Summary:", summary.slice(0, 200));
    }

    if (summary && summary.length > 20) {
      return summary;
    } else if (process.env.NODE_ENV !== "production") {
      console.warn("[Summary Extraction] Summary too short or empty after extraction");
    }
  }

  // OLD FORMAT: Check if this is a transition message
  const transitionPhrases = [
    "i'm now conducting deep research",
    "perfect! i'm now",
    "great! i'm now",
  ];

  const isTransitionMessage = transitionPhrases.some(phrase =>
    lower.includes(phrase)
  );

  if (isTransitionMessage) {
    return ""; // This is not a summary, it's a transition
  }

  // Find the confirmation question marker
  const confirmMarkers = [
    "did i capture your vision correctly",
    "did i understand your idea correctly",
    "did i capture everything correctly",
    "does this capture your vision",
    "does this sound right",
    "is this accurate",
    "anything to add or refine",
    "would you like to add or change anything"
  ];

  let confirmIndex = -1;
  for (const marker of confirmMarkers) {
    const idx = lower.indexOf(marker);
    if (idx !== -1) {
      confirmIndex = idx;
      break;
    }
  }

  // If no confirmation marker, return full content
  if (confirmIndex === -1) {
    return content.trim();
  }

  // Extract everything before the confirmation question
  let summary = content.slice(0, confirmIndex).trim();

  // Remove common AI preambles before the actual summary
  const preambles = [
    "no problem! let's summarize everything",
    "no problem! here's",
    "perfect! here's a comprehensive summary",
    "perfect! here's a summary",
    "great! here's a comprehensive summary",
    "great! let's summarize",
    "thank you for the details!",
    "here's a comprehensive summary",
    "here's a summary",
    "here's what i understand",
    "let me summarize",
    "great! here's",
  ];

  const summaryLower = summary.toLowerCase();
  for (const preamble of preambles) {
    const preambleIndex = summaryLower.indexOf(preamble);
    if (preambleIndex !== -1) {
      // Find the end of the sentence containing the preamble
      const afterPreamble = summary.slice(preambleIndex + preamble.length);
      const sentenceEnd = afterPreamble.search(/[:.]\s/);
      if (sentenceEnd !== -1) {
        const cleaned = afterPreamble.slice(sentenceEnd + 2).trim();
        if (process.env.NODE_ENV !== "production") {
          console.log(`[Summary Extraction] Removed preamble "${preamble}"`);
          console.log(`[Summary Extraction] Before: ${summary.slice(0, 100)}...`);
          console.log(`[Summary Extraction] After: ${cleaned.slice(0, 100)}...`);
        }
        summary = cleaned;
        break; // Only remove the first preamble found
      }
    }
  }

  // Clean up markdown and formatting
  summary = summary
    .replace(/^[\s-]+\*+[^*]*\*+:\s*/gm, "")   // Remove markdown headers like "-- **Problem Statement**:"
    .replace(/^\s*-\s*\*\*[^*]+\*\*:\s*/gm, "") // Remove bold bullet labels
    .replace(/^\s*[-*]\s*/gm, "")               // Remove bullet points
    .replace(/\n\s*\n/g, " ")                    // Collapse multiple newlines
    .replace(/\s+/g, " ")                        // Normalize whitespace
    .trim();

  // If the summary is too short after cleaning, try returning content before confirmation
  if (summary.length < 30) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[Summary Extraction] Summary too short after cleaning:", summary.length, "chars");
      console.log("[Summary Extraction] Falling back to full content before confirmation");
    }
    // Fallback: return everything before the confirmation marker, with minimal cleaning
    if (confirmIndex !== -1) {
      const fallback = content.slice(0, confirmIndex)
        .replace(/\n\s*\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (fallback.length >= 30) {
        return fallback;
      }
    }

    // Last resort: return the full content
    if (process.env.NODE_ENV !== "production") {
      console.log("[Summary Extraction] Using full content as last resort");
    }
    return content.trim();
  }

  return summary;
};

const MAX_AUTO_SUMMARY_CHARS = 800;
const MAX_SEGMENT_LENGTH = 280;

const stripFormatting = (input: string) => {
  return input
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[*_`~]/g, "")
    .replace(/^\s*\d+\.\s*/gm, "")
    .replace(/^\s*[-•]+\s*/gm, "")
    .replace(/\[\d+\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const buildResearchSummaryFromMessages = (messages: Message[]): string => {
  const userMessages = messages.filter((message) => message.role === "user");
  if (!userMessages.length) {
    return "";
  }

  const segments = userMessages
    .map((message, index) => {
      const trimmed = message.content.trim();
      if (!trimmed) {
        return "";
      }
      const prefix = index === 0 ? "Idea" : `Detail ${index}`;
      const limited =
        trimmed.length > MAX_SEGMENT_LENGTH
          ? trimmed.slice(0, MAX_SEGMENT_LENGTH).trimEnd()
          : trimmed;
      const cleaned = stripFormatting(limited);
      if (!cleaned) {
        return "";
      }
      return `${prefix}: ${cleaned}`;
    })
    .filter(Boolean);

  if (!segments.length) {
    return "";
  }

  let summary = segments.join(" ");
  summary = summary.replace(/\s+/g, " ").trim();
  if (summary.length > MAX_AUTO_SUMMARY_CHARS) {
    summary = summary.slice(0, MAX_AUTO_SUMMARY_CHARS).trimEnd();
  }

  return summary;
};

export function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [conversationStatus, setConversationStatus] =
    useState<ConversationStatus>("elicitation");
  const [correctionCycles, setCorrectionCycles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [hasBootstrappedIdea, setHasBootstrappedIdea] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousStatusRef = useRef<ConversationStatus>("elicitation");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const guidance = `If problems persist, please contact support at ${SUPPORT_EMAIL}.`;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    const loadConversation = async () => {
      try {
        const response = await fetch("/api/chat");

        if (response.status === 401) {
          router.push(LOGIN_REDIRECT);
          return;
        }

        if (!response.ok) {
          logError("Failed to load existing conversation:", response.status);
          return;
        }

        const data = (await response.json()) as ConversationResponse;
        if (data?.conversation) {
          setConversationId(data.conversation.id);
          if (data.conversation.ideaId) {
            setIdeaId(data.conversation.ideaId);
          }
          setConversationStatus(data.conversation.status);
          setCorrectionCycles(data.conversation.correctionCycles || 0);
          setMessages(
            (data.conversation.messages || []).map((message) => ({
              id: message.id,
              role: message.role,
              content: message.content,
              timestamp: new Date(message.createdAt),
            }))
          );
        }
      } catch (error) {
        logError("Conversation history load failed:", error);
      } finally {
        setIsLoading(false);
        setHistoryLoaded(true);
      }
    };

    loadConversation();
  }, [router]);

  useEffect(() => {
    if (!messages.length) return;

    const latestSummaryMessage = [...messages]
      .reverse()
      .find(
        (message) => {
          if (message.role !== "assistant") return false;
          const lower = message.content.toLowerCase();
          return (
            lower.includes("research input:") ||
            lower.includes("i'm now conducting deep research") ||
            lower.includes("did i capture your vision correctly") ||
            lower.includes("did i understand your idea correctly") ||
            lower.includes("anything to add or refine")
          );
        }
      );

    if (latestSummaryMessage) {
      // Only try to extract if message contains "Research Input:" marker
      // This avoids false positives from incomplete streaming messages
      const hasResearchInput = latestSummaryMessage.content.toLowerCase().includes("research input:");

      if (hasResearchInput) {
        const extracted = extractSummaryText(latestSummaryMessage.content);
        if (process.env.NODE_ENV !== "production") {
          console.log("[Chat Client] Saving pending summary:", extracted.slice(0, 150));
          if (!extracted || extracted.length === 0) {
            console.warn("[Chat Client] ⚠️ Extracted summary is empty despite having 'Research Input:' marker");
          }
        }
        if (extracted && extracted.trim()) {
          savePendingSummary(extracted);
        }
      }
    }
  }, [messages]);

  useEffect(() => {
    if (!conversationId) return;

    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = conversationStatus;

    if (conversationStatus !== "analyzing" || previousStatus === "analyzing") {
      return;
    }

    const existingJob = getStoredResearchJob();
    if (existingJob && existingJob.conversationId === conversationId) {
      router.push("/dashboard/analyze/processing");
      return;
    }

    // Try to get the pending summary first
    let summary = getPendingSummary();

    if (process.env.NODE_ENV !== "production") {
      console.log("[Chat Client] Pending summary from storage:", summary?.slice(0, 100) || "none");
    }

    // If no pending summary, search backwards for the summary message
    if (!summary?.trim()) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[Chat Client] No pending summary, searching messages...");
      }

      const summaryMessage = [...messages]
        .reverse()
        .find(
          (message) => {
            if (message.role !== "assistant") return false;
            const lower = message.content.toLowerCase();
            return (
              lower.includes("research input:") ||
              lower.includes("i'm now conducting deep research") ||
              lower.includes("did i capture your vision correctly") ||
              lower.includes("did i understand your idea correctly") ||
              lower.includes("anything to add or refine")
            );
          }
        );

      if (summaryMessage) {
        if (process.env.NODE_ENV !== "production") {
          console.log("[Chat Client] Found summary message, extracting...");
        }
        summary = extractSummaryText(summaryMessage.content);
        if (process.env.NODE_ENV !== "production") {
          console.log("[Chat Client] Extracted summary:", summary?.slice(0, 150) || "empty");
        }
      } else {
        if (process.env.NODE_ENV !== "production") {
          console.log("[Chat Client] No summary message found in conversation");
        }
      }
    }

    if (!summary?.trim()) {
      summary = buildResearchSummaryFromMessages(messages);
      if (summary?.trim()) {
        if (process.env.NODE_ENV !== "production") {
          console.log("[Chat Client] Built summary from user messages:", summary.slice(0, 150));
        }
        savePendingSummary(summary);
      }
    }

    if (!summary?.trim()) {
      console.error("[Chat Client] Failed to capture summary. Messages count:", messages.length);
      console.error("[Chat Client] Conversation status:", conversationStatus);
      toast.error(
        "We couldn't capture your confirmed summary. Please restate your idea if this happens again."
      );
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("[Chat Client] Initializing research with summary:", summary.slice(0, 150));
    }

    try {
      initializeResearchJob({
        conversationId,
        ideaId,
        summary,
      });
      clearPendingSummary();
      router.push("/dashboard/analyze/processing");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start research generation."
      );
    }
  }, [conversationId, conversationStatus, ideaId, messages, router]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) {
        return false;
      }

      if (conversationStatus === "analyzing") {
        toast.info(
          "The AI is already analyzing your idea. Hang tight while we prepare your research brief."
        );
        return false;
      }

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, conversationId }),
        });

        const newConversationId =
          response.headers.get("X-Conversation-Id") || null;

        if (newConversationId && newConversationId !== conversationId) {
          setConversationId(newConversationId);
          if (!conversationId) {
            void trackClientEvent({
              event: "conversation_started",
              properties: {
                source: "chat",
                conversation_id: newConversationId,
              },
            });
          }
        }

        if (!response.ok) {
          let errorMessage =
            "I'm having trouble connecting. Please try again.";

          try {
            const errorData = await response.json();
            if (errorData?.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // Ignore JSON parse errors
          }

          if (response.status === 401) {
            toast.error("Your session expired. Please sign in again.");
            router.push(LOGIN_REDIRECT);
            return false;
          }

          if (response.status === 429) {
            toast.error("You're sending messages too quickly. Please wait a moment.");
            return false;
          }

          const message =
            response.status === 504
              ? "This is taking longer than expected. Please retry or refresh the page."
              : errorMessage;

          toast.error(`${message} ${guidance}`, {
            action: {
              label: "Retry",
              onClick: () => handleSendMessage(trimmed),
            },
          });
          return false;
        }

        if (!response.body) {
          toast.error(
            `The AI response stream was empty. Please try again. ${guidance}`,
            {
              action: {
                label: "Retry",
                onClick: () => handleSendMessage(trimmed),
              },
            }
          );
          return false;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        const assistantMessageId = `assistant-${Date.now()}`;
        let streamComplete = false;

        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
          },
        ]);

        let buffer = "";

        while (!streamComplete) {
          const { value, done } = await reader.read();
          const chunk = value ? decoder.decode(value, { stream: true }) : "";
          buffer += chunk;

          if (done) {
            buffer += decoder.decode();
          }

          let boundary = buffer.indexOf("\n\n");
          while (boundary !== -1) {
            const rawEvent = buffer.slice(0, boundary).trim();
            buffer = buffer.slice(boundary + 2);

            if (!rawEvent.startsWith("data:")) {
              boundary = buffer.indexOf("\n\n");
              continue;
            }

            const payloadStr = rawEvent.replace(/^data:\s*/, "");
            if (!payloadStr) {
              boundary = buffer.indexOf("\n\n");
              continue;
            }

            let payload:
              | {
                  type: "token" | "done" | "error";
                  content?: string;
                  message?: string;
                }
              | {
                  type: "meta" | "status";
                  conversationId?: string;
                  ideaId?: string;
                  status?: ConversationStatus;
                  correctionCycles?: number;
                };

            try {
              payload = JSON.parse(payloadStr);
            } catch (error) {
              logError("Failed to parse chat stream payload:", error);
              boundary = buffer.indexOf("\n\n");
              continue;
            }

            if (payload.type === "token" && typeof payload.content === "string") {
              setMessages((prev) =>
                prev.map((message) =>
                  message.id === assistantMessageId
                    ? {
                        ...message,
                        content: message.content + payload.content,
                      }
                    : message
                )
              );
            } else if (payload.type === "meta" && payload.conversationId) {
              setConversationId(payload.conversationId);
              if (payload.status) {
                setConversationStatus(payload.status);
              }
              if (payload.ideaId) {
                setIdeaId(payload.ideaId);
              }
            } else if (payload.type === "status" && payload.status) {
              setConversationStatus(payload.status);
              if (
                typeof payload.correctionCycles === "number" &&
                payload.correctionCycles !== correctionCycles
              ) {
                setCorrectionCycles(payload.correctionCycles);
              }
            } else if (payload.type === "error") {
              const streamError =
                payload.message ??
                "I'm having trouble connecting. Please try again.";

              setMessages((prev) =>
                prev.map((message) =>
                  message.id === assistantMessageId
                    ? { ...message, content: `⚠️ ${streamError}` }
                    : message
                )
              );

              toast.error(`${streamError} ${guidance}`, {
                action: {
                  label: "Retry",
                  onClick: () => handleSendMessage(trimmed),
                },
              });
              streamComplete = true;
              break;
            } else if (payload.type === "done") {
              streamComplete = true;
              break;
            }

            boundary = buffer.indexOf("\n\n");
          }

          if (done) {
            break;
          }
        }

        return true;
      } catch (error) {
        logError("Failed to send message:", error);
        toast.error(
          `I'm having trouble connecting. Please try again. ${guidance}`,
          {
            action: {
              label: "Retry",
              onClick: () => handleSendMessage(trimmed),
            },
          }
        );
        return false;
      } finally {
        setIsTyping(false);
      }
    },
    [conversationId, conversationStatus, correctionCycles, guidance, router]
  );

  useEffect(() => {
    if (!historyLoaded || hasBootstrappedIdea) {
      return;
    }

    if (messages.length > 0) {
      setHasBootstrappedIdea(true);
      return;
    }

    const storedIdea = getIdeaFromStorage();
    const sessionIdea = sanitizeIdeaText(storedIdea?.text);
    const urlIdea = sanitizeIdeaText(searchParams.get("idea"));
    const hasIdeaParam = searchParams.has("idea");

    const removeIdeaParamFromUrl = () => {
      if (!hasIdeaParam) return;
      const params = new URLSearchParams(searchParams.toString());
      params.delete("idea");
      const nextQuery = params.toString();
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      router.replace(nextUrl, { scroll: false });
    };

    if (storedIdea && !sessionIdea) {
      clearIdeaFromStorage();
    }

    const bootstrap = async (idea: string | null) => {
      if (!idea) {
        const welcomeMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            "Hi, I'm Friday, here to help you analyze your idea. Let's get started—tell me what you're building!",
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
        setHasBootstrappedIdea(true);
        return;
      }

      const success = await handleSendMessage(idea);
      if (success) {
        toast.success("Chat initialized with your idea!");
      }
      setHasBootstrappedIdea(true);
    };

    if (sessionIdea) {
      clearIdeaFromStorage();
      if (hasIdeaParam) {
        removeIdeaParamFromUrl();
      }
      void bootstrap(sessionIdea);
      return;
    }

    if (urlIdea) {
      removeIdeaParamFromUrl();
      void bootstrap(urlIdea);
      return;
    }

    if (hasIdeaParam) {
      removeIdeaParamFromUrl();
    }

    void bootstrap(null);
  }, [
    handleSendMessage,
    hasBootstrappedIdea,
    historyLoaded,
    messages.length,
    pathname,
    router,
    searchParams,
  ]);

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-8 mx-auto">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Initializing chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-4xl">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Status Banner */}
      {conversationStatus === "analyzing" && (
        <div className="border-t border-[color:var(--glass-border)] bg-gradient-to-br from-primary/10 to-primary/5 px-6 py-4 text-sm backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-primary">
              Generating your research brief now. This may take up to 40 minutes for
              comprehensive deep research.
            </span>
          </div>
        </div>
      )}

      {/* Fixed Input at Bottom */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={isTyping || conversationStatus === "analyzing"}
        placeholder={
          messages.length === 0
            ? "Describe your business idea..."
            : "Type your message..."
        }
      />
    </div>
  );
}
