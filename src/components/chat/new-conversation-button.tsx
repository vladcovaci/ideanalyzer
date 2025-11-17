'use client';

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { clearResearchJob } from "@/lib/research/job-storage";
import { clearPendingSummary } from "@/lib/research/summary-storage";
import { toast } from "sonner";

export function NewConversationButton() {
  const router = useRouter();

  const handleNewConversation = async () => {
    try {
      // Clear all localStorage data
      clearResearchJob();
      clearPendingSummary();

      // Mark current conversation as completed
      await fetch("/api/chat/reset", {
        method: "POST",
      });

      // Show success message
      toast.success("Starting new conversation");

      // Reload the page to start fresh
      router.refresh();

      // Force a hard reload after a brief delay to ensure all state is cleared
      setTimeout(() => {
        window.location.href = "/dashboard/analyze";
      }, 100);
    } catch (error) {
      console.error("Failed to start new conversation:", error);
      toast.error("Failed to start new conversation. Please refresh the page.");
    }
  };

  return (
    <Button
      onClick={handleNewConversation}
      variant="outline"
      size="sm"
      className="gap-2 border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] backdrop-blur-sm hover:bg-[color:var(--glass-surface-strong)]"
    >
      <PlusCircle className="h-4 w-4" />
      New Idea
    </Button>
  );
}
