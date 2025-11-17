'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ResearchBriefBody } from "@/components/research/brief-body";
import type { ResearchBriefResult } from "@/lib/research/types";
import {
  clearResearchJob,
  getStoredResearchJob,
  saveResearchJob,
  StoredResearchJob,
  ResearchJobStatus,
} from "@/lib/research/job-storage";
import { clearPendingSummary } from "@/lib/research/summary-storage";

const PROCESS_STEPS = [
  {
    id: "analyzing",
    label: "Analyzing your idea...",
    range: [5, 15],
    duration: 3000,
    detail: "Classifying your idea and preparing research parameters",
  },
  {
    id: "comprehensive-research",
    label: "Conducting comprehensive deep research...",
    range: [15, 90],
    duration: 8000,
    detail:
      "Our AI is conducting comprehensive market research across all 5 modules: Description, Identified Problem, Why Now, Proof Signals, and Competition. This involves searching forums, analyzing competitors, gathering proof signals, and validating timing signals with real web data.",
  },
  {
    id: "finalizing",
    label: "Structuring your research brief...",
    range: [90, 100],
    duration: 2000,
    detail: "Organizing findings and preparing your comprehensive brief",
  },
] as const;

const STALE_THRESHOLD_MS = 20_000;
const TOTAL_DURATION_MS = 40 * 60 * 1000;

const formatMinutesRemaining = (startedAt?: string) => {
  if (!startedAt) return "This may take up to 40 minutes...";
  const started = new Date(startedAt).getTime();
  const elapsed = Date.now() - started;
  const remaining = Math.max(0, TOTAL_DURATION_MS - elapsed);
  const minutes = Math.max(1, Math.ceil(remaining / 60000));
  return `~${minutes} minute${minutes === 1 ? "" : "s"} remaining`;
};

const collectSources = (content?: ResearchBriefResult | null) => {
  if (!content?.proofSignals) return [];
  const set = new Set<string>();
  content.proofSignals.forEach((signal) =>
    signal.sources?.forEach((source) => {
      if (source?.trim()) {
        set.add(source.trim());
      }
    })
  );
  return Array.from(set);
};

export function ResearchProcessingView() {
  const router = useRouter();
  const [job, setJob] = useState<StoredResearchJob | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(5);
  const [timeLabel, setTimeLabel] = useState("This may take up to 40 minutes...");
  const [statusMessage, setStatusMessage] = useState<string>(
    PROCESS_STEPS[0]?.label ?? "Analyzing your idea..."
  );
  const abortRef = useRef<AbortController | null>(null);
  const statusTrackerRef = useRef<ResearchJobStatus | null>(null);

  useEffect(() => {
    const storedJob = getStoredResearchJob();
    if (storedJob && storedJob.status === "in_progress") {
      const lastUpdated = new Date(storedJob.updatedAt).getTime();
      if (Date.now() - lastUpdated > STALE_THRESHOLD_MS) {
        storedJob.status = "pending";
        storedJob.updatedAt = new Date().toISOString();
      }
    }
    setJob(storedJob);
  }, []);

  useEffect(() => {
    if (!job) return;
    saveResearchJob(job);
  }, [job]);

  const currentStep = useMemo(() => {
    const index = Math.min(stepIndex, PROCESS_STEPS.length - 1);
    return PROCESS_STEPS[index];
  }, [stepIndex]);

  useEffect(() => {
    if (!job) return;
    setTimeLabel(formatMinutesRemaining(job.startedAt));
    const interval = setInterval(() => {
      setTimeLabel(formatMinutesRemaining(job.startedAt));
    }, 10_000);
    return () => clearInterval(interval);
  }, [job]);

  useEffect(() => {
    if (!job || job.status !== "in_progress") return;
    setStatusMessage(
      currentStep?.label ?? PROCESS_STEPS[PROCESS_STEPS.length - 1]?.label ?? statusMessage
    );
    setProgress(currentStep?.range[1] ?? 100);

    if (stepIndex >= PROCESS_STEPS.length - 1) {
      return;
    }

    const timer = setTimeout(() => {
      setStepIndex((prev) => Math.min(prev + 1, PROCESS_STEPS.length - 1));
      setJob((prev) =>
        prev
          ? {
              ...prev,
              updatedAt: new Date().toISOString(),
            }
          : prev
      );
    }, currentStep?.duration ?? 2000);

    return () => clearTimeout(timer);
  }, [job, stepIndex, currentStep, statusMessage]);

  const pollResearchStatus = useCallback(
    async (researchJobId: string, ideaId: string) => {
      const maxPolls = 240; // 240 * 5s = 20 minutes max
      let pollCount = 0;

      const poll = async () => {
        if (pollCount >= maxPolls) {
          setJob((prev) =>
            prev
              ? {
                  ...prev,
                  status: "failed",
                  error: "Research took too long. Please try again.",
                  updatedAt: new Date().toISOString(),
                }
              : prev
          );
          return;
        }

        try {
          const response = await fetch(`/api/research/status/${researchJobId}`);
          if (!response.ok) {
            throw new Error("Failed to check research status");
          }

          const data = await response.json();

          if (data.isComplete) {
            if (data.status === "completed" && data.briefId) {
              // Research completed successfully
              setJob((prev) =>
                prev
                  ? {
                      ...prev,
                      status: "completed",
                      briefId: data.briefId,
                      ideaId,
                      updatedAt: new Date().toISOString(),
                    }
                  : prev
              );
              setStepIndex(PROCESS_STEPS.length - 1);
              setProgress(100);
              setStatusMessage("Your research brief is ready!");

              setTimeout(() => {
                clearResearchJob();
                router.push(`/brief/${data.briefId}`);
              }, 1500);
            } else {
              // Research failed
              setJob((prev) =>
                prev
                  ? {
                      ...prev,
                      status: "failed",
                      error: data.error || "Research failed",
                      updatedAt: new Date().toISOString(),
                    }
                  : prev
              );
            }
          } else {
            // Still processing - continue polling
            pollCount++;
            setTimeout(poll, 5000); // Poll every 5 seconds
          }
        } catch (error) {
          console.error("Error polling research status:", error);
          setJob((prev) =>
            prev
              ? {
                  ...prev,
                  status: "failed",
                  error: "Failed to check research status",
                  updatedAt: new Date().toISOString(),
                }
              : prev
          );
        }
      };

      poll();
    },
    [router]
  );

  const sendGenerationRequest = useCallback(
    async (activeJob: StoredResearchJob) => {
      if (!activeJob.summary?.trim()) {
        setJob({
          ...activeJob,
          status: "failed",
          error: "Idea summary missing. Return to the chat and restate your idea.",
          updatedAt: new Date().toISOString(),
        });
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStepIndex(0);
      setProgress(PROCESS_STEPS[0]?.range[0] ?? 5);
      setStatusMessage(PROCESS_STEPS[0]?.label ?? "Analyzing your idea...");

      try {
        const response = await fetch("/api/research/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            summary: activeJob.summary,
            ideaId: activeJob.ideaId,
            conversationId: activeJob.conversationId,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorPayload = await response
            .json()
            .catch(() => ({ error: "Failed to generate research brief." }));
          throw new Error(errorPayload?.error ?? "Failed to generate research brief.");
        }

        const data = await response.json();

        // Check if this is a background job
        if (data.isBackgroundJob && data.researchJobId) {
          console.log("[Research] Background job started, polling for completion...");
          // Start polling for completion
          pollResearchStatus(data.researchJobId, data.ideaId);
          return;
        }

        // Synchronous mode - job completed immediately
        setJob((prev) =>
          prev
            ? {
                ...prev,
                status: "completed",
                briefId: data.briefId ?? null,
                ideaId: data.ideaId ?? prev.ideaId,
                result: data.result,
                storageWarning: data.storageWarning ?? null,
                updatedAt: new Date().toISOString(),
              }
            : prev
        );
        setStepIndex(PROCESS_STEPS.length - 1);
        setProgress(100);
        setStatusMessage("Your research brief is ready!");

        if (data.briefId) {
          setTimeout(() => {
            clearResearchJob();
            router.push(`/brief/${data.briefId}`);
          }, 1500);
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setJob((prev) =>
          prev
            ? {
                ...prev,
                status: "failed",
                error:
                  error instanceof Error
                    ? error.message
                    : "Something went wrong while generating your brief.",
                updatedAt: new Date().toISOString(),
              }
            : prev
        );
        setStatusMessage("Generation failed");
      }
    },
    [router, pollResearchStatus]
  );

  useEffect(() => {
    if (!job) return;

    if (job.status === "pending") {
      const nextJob: StoredResearchJob = {
        ...job,
        status: "in_progress",
        startedAt: job.startedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        error: undefined,
        attemptCount: (job.attemptCount ?? 0) + 1,
      };
      statusTrackerRef.current = "in_progress";
      setJob(nextJob);
      void sendGenerationRequest(nextJob);
      return;
    }

    if (job.status === "in_progress" && statusTrackerRef.current !== "in_progress") {
      statusTrackerRef.current = "in_progress";
      void sendGenerationRequest(job);
    }
  }, [job, sendGenerationRequest]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!job) {
      statusTrackerRef.current = null;
      return;
    }

    if (job.status === "completed" || job.status === "failed") {
      statusTrackerRef.current = job.status;
    }
  }, [job]);

  const retry = () => {
    if (!job) return;
    setJob({
      ...job,
      status: "pending",
      error: undefined,
      updatedAt: new Date().toISOString(),
    });
  };

  // Move these before the early return to maintain hook order
  const isCompleted = job?.status === "completed";
  const isFailed = job?.status === "failed";
  const hasStoredBrief = Boolean(job?.briefId);
  const canCancel = job?.status === "in_progress";
  const inlineSources = useMemo(() => collectSources(job?.result), [job?.result]);
  const showInlineBrief = isCompleted && !hasStoredBrief && job?.result;

  const cancelGeneration = useCallback(() => {
    if (!job || job.status !== "in_progress") {
      return;
    }
    abortRef.current?.abort();
    statusTrackerRef.current = "failed";
    setStatusMessage("Generation canceled");
    setJob((prev) =>
      prev
        ? {
            ...prev,
            status: "failed",
            error: "Generation canceled by user.",
            updatedAt: new Date().toISOString(),
          }
        : prev
    );
  }, [job]);

  if (!job) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-medium text-foreground">
          No research job found.
        </p>
        <p className="text-sm text-muted-foreground">
          Head back to the chat and confirm your conversation summary to start generating a brief.
        </p>
        <Button onClick={async () => {
          clearResearchJob();
          clearPendingSummary();
          try {
            await fetch("/api/chat/reset", { method: "POST" });
          } catch (error) {
            console.error("Failed to reset conversation:", error);
          }
          window.location.href = "/dashboard/analyze";
        }}>
          Return to chat
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-background via-background to-muted/30">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16 text-center">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
            Generating Research Brief
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {showInlineBrief
              ? "Your brief is ready, but we couldn't save it"
              : isCompleted
                ? "Your research brief is ready!"
                : "Sit tight while we complete your analysis"}
          </h1>
          <p className="text-sm text-muted-foreground">{timeLabel}</p>
        </div>

        <div className="space-y-6 rounded-[32px] border bg-card/60 px-8 py-8 shadow-lg backdrop-blur">
          {canCancel && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={cancelGeneration}>
                Cancel
              </Button>
            </div>
          )}
          <div className="flex flex-col items-center gap-4 text-center">
            {isCompleted ? (
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            ) : isFailed ? (
              <AlertCircle className="h-10 w-10 text-rose-500" />
            ) : (
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            )}
            <p className="text-lg font-medium text-foreground">
              {statusMessage}
            </p>
            {currentStep?.detail && !isCompleted && !isFailed && (
              <p className="text-sm text-muted-foreground">{currentStep.detail}</p>
            )}
          </div>

          <Progress value={isCompleted ? 100 : progress} className="h-3 w-full rounded-full bg-primary/10" />

          <div className="grid gap-3 text-left sm:grid-cols-2">
            {PROCESS_STEPS.map((step, index) => {
              const complete =
                isCompleted || index < stepIndex || (job.status === "failed" && index < stepIndex);
              const active = index === stepIndex && !isCompleted && !isFailed;
              return (
                <div
                  key={step.id}
                  className="flex items-center gap-3 rounded-2xl border border-dashed border-muted px-4 py-3 text-sm"
                >
                  <div
                    className={`h-3 w-3 rounded-full ${
                      complete
                        ? "bg-primary"
                        : active
                          ? "bg-primary/70 animate-pulse"
                          : "bg-muted"
                    }`}
                  />
                  <span
                    className={`${
                      complete
                        ? "text-foreground"
                        : active
                          ? "text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {isFailed && (
            <div className="rounded-2xl border border-rose-200/60 bg-rose-50 px-4 py-3 text-left text-sm text-rose-700">
              <p className="font-medium">Generation failed</p>
              <p className="mb-3">{job.error ?? "Something went wrong. Please try again."}</p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={retry}>Retry</Button>
                <Button variant="outline" onClick={async () => {
                  clearResearchJob();
                  clearPendingSummary();
                  try {
                    await fetch("/api/chat/reset", { method: "POST" });
                  } catch (error) {
                    console.error("Failed to reset conversation:", error);
                  }
                  window.location.href = "/dashboard/analyze";
                }}>
                  Return to chat
                </Button>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50 px-4 py-3 text-left text-sm text-emerald-700">
              <p>
                {showInlineBrief
                  ? "We generated your brief but couldn't store it. Review the insights below."
                  : "Your research brief is ready! Redirecting you to the report now..."}
              </p>
            </div>
          )}

          {showInlineBrief && job.storageWarning && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-900">
              {job.storageWarning}
            </div>
          )}
        </div>

        {showInlineBrief && job.result && (
          <InlineBriefPreview content={job.result} sources={inlineSources} />
        )}
      </div>
    </div>
  );
}

type InlineBriefPreviewProps = {
  content: ResearchBriefResult;
  sources: string[];
};

const InlineBriefPreview = ({ content, sources }: InlineBriefPreviewProps) => (
  <div className="grid gap-6 rounded-[32px] border bg-card/70 px-6 py-8 text-left shadow-lg">
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        Research insights (unsaved)
      </h2>
      <p className="text-sm text-muted-foreground">
        Copy anything important—you’ll need to rerun the analysis if you leave this page without saving.
      </p>
    </div>
    <ResearchBriefBody content={content} />
    {sources.length > 0 && (
      <div className="rounded-2xl border border-dashed border-muted px-4 py-3">
        <p className="text-sm font-medium text-foreground">Sources referenced</p>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {sources.map((source) => (
            <li key={source} className="truncate">
              {source}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);
