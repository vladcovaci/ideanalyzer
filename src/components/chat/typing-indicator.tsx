import { Sparkles } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex w-full gap-3 px-4 py-6 md:px-6">
      {/* AI Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>

      {/* Typing Animation */}
      <div className="flex items-center gap-1 rounded-2xl border border-white/60 bg-white/85 px-4 py-3 backdrop-blur-xl">
        <div className="flex gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
        </div>
      </div>
    </div>
  );
}
