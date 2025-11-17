import { cn } from "@/lib/utils";
import { User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-3 px-4 py-6 md:px-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          "max-w-[95%] space-y-2 rounded-2xl px-5 py-4 md:max-w-[90%]",
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-white/60 bg-white/85 backdrop-blur-xl"
        )}
      >
        <div className={cn(
          "prose prose-sm max-w-none break-words md:prose-base",
          isUser ? "text-white" : "",
          "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
          "[&_p]:leading-relaxed [&_p]:my-2",
          "[&_strong]:font-semibold",
          "[&_ol]:my-2 [&_ol]:pl-4",
          "[&_ul]:my-2 [&_ul]:pl-4",
          "[&_li]:my-1"
        )}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
        {timestamp && (
          <div
            className={cn(
              "text-xs",
              isUser ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
          <User className="h-4 w-4 text-primary text-white" />
        </div>
      )}
    </div>
  );
}
