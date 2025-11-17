"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type FeedbackPromptProps = {
  briefId: string;
  initialFeedback?: {
    rating: number;
    comments?: string | null;
    sectionRatings?: Record<string, "low" | "medium" | "high"> | null;
  };
};

const SECTION_LABELS: Record<string, string> = {
  competition: "Competition Analysis",
  keywords: "Keyword Analytics",
  whyNow: "Why Now?",
  proofSignals: "Proof Signals",
};

const SectionRatingRow = ({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected?: "low" | "medium" | "high";
  onSelect: (value: "low" | "medium" | "high") => void;
}) => (
  <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-4">
    <span className="text-muted-foreground sm:w-44">{label}</span>
    <div className="flex flex-wrap gap-2">
      {[
        { value: "low", label: "Not helpful" },
        { value: "medium", label: "Somewhat" },
        { value: "high", label: "Very helpful" },
      ].map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition",
            selected === option.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/40"
          )}
          onClick={() => onSelect(option.value as "low" | "medium" | "high")}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

export function FeedbackPrompt({
  briefId,
  initialFeedback,
}: FeedbackPromptProps) {
  const [rating, setRating] = useState(initialFeedback?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState(initialFeedback?.comments ?? "");
  const [sectionRatings, setSectionRatings] = useState<
    Record<string, "low" | "medium" | "high">
  >(initialFeedback?.sectionRatings ?? {});
  const [sectionExpanded, setSectionExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitted">(
    initialFeedback ? "submitted" : "idle"
  );
  const [skipped, setSkipped] = useState(false);

  // Move useEffect before early returns to maintain consistent hook order
  useEffect(() => {
    if (!sectionExpanded) return;
    const timer = setTimeout(() => {
      if (Object.keys(sectionRatings).length === 0) {
        setSectionExpanded(false);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [sectionExpanded, sectionRatings]);

  if (skipped) return null;

  if (status === "submitted") {
    return (
      <section className="rounded-[32px] border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-6 py-5 text-sm text-emerald-900">
        <p className="font-semibold">Thank you for your feedback!</p>
        <p>We appreciate you helping us improve future research briefs.</p>
      </section>
    );
  }

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          briefId,
          rating,
          comments: comments.trim() || undefined,
          sectionRatings: Object.keys(sectionRatings).length
            ? sectionRatings
            : undefined,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Failed to submit feedback.");
      }

      setStatus("submitted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit feedback."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const charCount = comments.length;
  const maxChars = 500;

  return (
    <section className="glass-strong rounded-[32px] border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] p-8 shadow-lg transition hover:shadow-xl">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-base font-semibold text-foreground">
            How helpful was this research brief?
          </p>
          <p className="text-sm text-muted-foreground">
            1 = Not helpful, 5 = Very helpful
          </p>
        </div>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => {
            const active = value <= (hoverRating || rating);
            return (
              <button
                key={value}
                type="button"
                className={cn(
                  "rounded-full p-2 transition",
                  active ? "text-amber-400" : "text-muted-foreground"
                )}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(value)}
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
              >
                <Star
                  className="h-7 w-7"
                  fill={active ? "currentColor" : "none"}
                />
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="feedback-comments"
            className="text-sm font-medium text-foreground"
          >
            Tell us more (optional)
          </label>
          <Textarea
            id="feedback-comments"
            placeholder="Share what was most helpful or what could be improved..."
            maxLength={maxChars}
            value={comments}
            onChange={(event) => setComments(event.target.value)}
          />
          <p className="text-right text-xs text-muted-foreground">
            {charCount}/{maxChars}
          </p>
        </div>

        {sectionExpanded ? (
          <div className="space-y-3 rounded-2xl border border-dashed border-muted px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Rate specific sections (optional)</p>
              <button
                type="button"
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                onClick={() => setSectionExpanded(false)}
              >
                Collapse
              </button>
            </div>
            {Object.entries(SECTION_LABELS).map(([key, label]) => (
              <SectionRatingRow
                key={key}
                label={label}
                selected={sectionRatings[key]}
                onSelect={(value) =>
                  setSectionRatings((prev) => ({
                    ...prev,
                    [key]: value,
                  }))
                }
              />
            ))}
          </div>
        ) : (
          <button
            type="button"
            className="text-sm text-left font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => setSectionExpanded(true)}
          >
            Rate Sections
          </button>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <Button
            onClick={handleSubmit}
            size="lg"
            disabled={submitting || rating === 0}
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
          <button
            type="button"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => setSkipped(true)}
          >
            Skip
          </button>
        </div>
      </div>
    </section>
  );
}
