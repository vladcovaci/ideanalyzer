"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type BriefItem = {
  id: string;
  title: string;
  industryTag: string | null;
  createdAt: string;
  status: string;
  summary: string;
  isPublic: boolean;
  shareToken: string | null;
};

const relativeTime = (iso: string) => {
  const timestamp = new Date(iso).getTime();
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
};

export function MyIdeasListClient({
  briefs,
  hasBriefs,
  totalCount,
  hasMoreThanTen,
}: {
  briefs: BriefItem[];
  hasBriefs: boolean;
  totalCount: number;
  hasMoreThanTen: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(briefs);
  const [, startTransition] = useTransition();

  const handleShare = async (brief: BriefItem) => {
    try {
      const response = await fetch(`/api/briefs/${brief.id}/share`, {
        method: "POST",
      });

      if (!response.ok) {
        toast.error("Failed to update sharing status.");
        return;
      }

      const data = await response.json();

      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item.id === brief.id
            ? { ...item, isPublic: data.isPublic, shareToken: data.shareToken }
            : item
        )
      );

      if (data.isPublic && data.shareUrl) {
        // Copy share link to clipboard
        await navigator.clipboard.writeText(data.shareUrl);
        toast.success("Share link copied to clipboard!");
      } else {
        toast.success("Brief is now private.");
      }

      router.refresh();
    } catch (error) {
      console.error("Error toggling share:", error);
      toast.error("Failed to update sharing status.");
    }
  };

  const handleDelete = (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this brief? This action cannot be undone."
    );
    if (!confirmDelete) return;

    startTransition(async () => {
      const response = await fetch(`/api/briefs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        toast.error("Failed to delete brief. Please try again.");
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Brief deleted.");
      router.refresh();
    });
  };

  return (
    <section className="glass-strong rounded-[32px] border border-border/80 bg-background/80 p-8 shadow-lg">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h2 className="bg-gradient-to-br from-foreground to-foreground-secondary bg-clip-text text-2xl font-bold tracking-tight text-transparent">
              My Ideas
            </h2>
            {hasBriefs && (
              <span className="rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-3 py-1 text-xs font-medium backdrop-blur-sm">
                {Math.min(totalCount, 10)}
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Track your research briefs and jump back into your analyses.
          </p>
        </div>
        {hasBriefs && (
          <Button variant="outline" asChild className="border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] backdrop-blur-sm hover:bg-[color:var(--glass-surface-strong)]">
            <Link href="/dashboard/analyze">Analyze another idea</Link>
          </Button>
        )}
      </div>

      {hasBriefs ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((brief) => (
            <article
              key={brief.id}
              className="glass group flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 px-5 py-5 shadow-md transition hover:border-primary/50 hover:shadow-lg hover:scale-[1.02]"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/brief/${brief.id}`}
                      className="line-clamp-2 text-lg font-bold text-foreground transition hover:text-primary"
                    >
                      {brief.title}
                    </Link>
                    <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                      {relativeTime(brief.createdAt)}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground shrink-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] backdrop-blur-xl rounded-2xl">
                      <DropdownMenuItem asChild>
                        <Link href={`/brief/${brief.id}`}>View</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault();
                          handleShare(brief);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {brief.isPublic ? (
                            <>
                              <Check className="h-4 w-4 text-primary" />
                              <span>Shared</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="h-4 w-4" />
                              <span>Share</span>
                            </>
                          )}
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={(event) => {
                          event.preventDefault();
                          handleDelete(brief.id);
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {brief.industryTag && (
                    <span className="rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm">
                      {brief.industryTag}
                    </span>
                  )}
                  <span className="rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-3 py-1 text-xs font-medium capitalize backdrop-blur-sm">
                    {brief.status.replaceAll("_", " ")}
                  </span>
                </div>
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {brief.summary || "Structured market analysis and proof signals."}
              </p>
            </article>
          ))}
          {hasMoreThanTen && (
            <div className="col-span-full flex justify-end pt-2">
              <Link
                href="/dashboard/briefs"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                View All
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="glass rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 px-8 py-16 text-center shadow-md">
          <p className="text-lg font-bold text-foreground">
            No analyses yet. Click Start New Analysis to begin!
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Kick off your first research brief to unlock competition, keyword, and proof-signal
            insights.
          </p>
          <Button asChild size="lg" className="mt-8 shadow-md">
            <Link href="/dashboard/analyze">Start New Analysis</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
