"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveIdeaToStorage } from "@/lib/idea-storage";
import { toast } from "sonner";
import { trackClientEvent } from "@/lib/analytics/client";

interface IdeaInputProps {
  onSubmit?: (idea: string, isPrivate: boolean) => void;
  maxLength?: number;
  className?: string;
}

export function IdeaInput({
  onSubmit,
  maxLength = 1000,
  className,
}: IdeaInputProps) {
  const [idea, setIdea] = useState("");
  const isPrivate = false;
  const { status } = useSession();
  const router = useRouter();

  const handleSubmit = () => {
    const trimmedIdea = idea.trim();

    // Validation: Check if idea is empty
    if (!trimmedIdea) {
      toast.error("Please enter an idea", {
        description: "You need to describe your business idea before we can analyze it.",
      });
      return;
    }

    onSubmit?.(trimmedIdea, isPrivate);
    void trackClientEvent({
      event: "idea_submitted",
      properties: {
        source: "homepage",
        privacy_mode: isPrivate,
        authenticated: status === "authenticated",
      },
    });

    // Check if user is authenticated
    if (status === "unauthenticated") {
      // Save idea to session storage
      saveIdeaToStorage(trimmedIdea, isPrivate);

      // Redirect to login with callbackUrl
      const analyzePath = `/dashboard/analyze?idea=${encodeURIComponent(trimmedIdea)}`;
      const callbackUrl = encodeURIComponent(analyzePath);
      router.push(`/login?callbackUrl=${callbackUrl}&reason=analyze`);
      return;
    }

    // User is authenticated, save idea and redirect to analysis page
    saveIdeaToStorage(trimmedIdea, isPrivate);
    router.push(`/dashboard/analyze?idea=${encodeURIComponent(trimmedIdea)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const characterCount = idea.length;
  const isOverLimit = characterCount > maxLength;

  return (
    <div className={cn("w-full max-w-3xl mx-auto", className)}>
      {/* Main Input Container - Liquid Glass Effect */}
      <div className="group relative">
        {/* Frosted glass container */}
        <div className="relative rounded-2xl border border-white/60 bg-[color:var(--glass-surface)] p-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all duration-300 hover:border-white/80 hover:bg-white/90 hover:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.15)] md:p-8">
          {/* Textarea */}
          <Textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your business idea..."
            className="min-h-[120px] resize-none border-none bg-transparent px-0 py-0 text-base shadow-none outline-none focus-visible:ring-0 md:min-h-[160px] md:text-lg"
            maxLength={maxLength}
            aria-label="Business idea input"
          />

          {/* Submit Button - Circular with arrow */}
          <div className="absolute bottom-[55px] right-6 md:bottom-8 md:right-8">
            <Button
              onClick={handleSubmit}
              disabled={!idea.trim() || isOverLimit}
              size="icon"
              className={cn(
                "h-12 w-12 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100",
                "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-[hsl(var(--primary-foreground))] shadow-[0_20px_40px_-15px_var(--shadow-primary)] text-white"
              )}
              aria-label="Analyze idea"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
