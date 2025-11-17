"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Type your message...",
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to calculate scrollHeight properly
    textarea.style.height = "auto";

    // Calculate new height (max 5 rows = ~120px at text-base)
    const maxHeight = 120;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [message]);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    onSend(trimmedMessage);
    setMessage("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends message, Shift+Enter adds new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={cn(
        "border-t border-[color:var(--glass-border)] bg-transparent backdrop-blur-xl",
        className
      )}
    >
      <div className="mx-auto max-w-4xl p-6">
        {/* Frosted glass container */}
        <div className="group relative rounded-2xl border border-white/60 bg-[color:var(--glass-surface)] p-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all duration-300 hover:border-white/80 hover:bg-white/90 hover:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.15)]">
          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[60px] max-h-[120px] resize-none border-none bg-transparent px-0 py-0 text-base shadow-none outline-none focus-visible:ring-0"
            rows={1}
          />

          {/* Submit Button - Circular with arrow */}
          <div className="absolute bottom-6 right-6">
            <Button
              onClick={handleSend}
              disabled={!message.trim() || disabled}
              size="icon"
              className={cn(
                "h-12 w-12 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100",
                "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-[hsl(var(--primary-foreground))] shadow-[0_20px_40px_-15px_var(--shadow-primary)] text-white"
              )}
              aria-label="Send message"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Press <kbd className="rounded border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-1.5 py-0.5">Enter</kbd> to
          send, <kbd className="rounded border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-1.5 py-0.5">Shift+Enter</kbd>{" "}
          for new line
        </p>
      </div>
    </div>
  );
}
