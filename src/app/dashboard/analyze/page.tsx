import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ChatClient } from "@/components/chat/chat-client";
import { NewConversationButton } from "@/components/chat/new-conversation-button";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata = {
  title: "Analyze Idea",
  description: "Chat with AI Agent to analyze and develop your business idea",
};

export default async function AnalyzePage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?callbackUrl=%2Fdashboard%2Fanalyze&reason=analyze");
  }

  return (
    <DashboardShell hideHeader>
      <div className="flex h-[calc(100vh-100px)] flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-br from-foreground to-foreground-secondary bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Idea Analysis Chat
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Discuss your business idea with our AI Agent
            </p>
          </div>
          <NewConversationButton />
        </div>

        <div className="glass-strong flex-1 overflow-hidden rounded-[32px] border border-border/60 bg-card/80 shadow-lg">
          <ChatClient />
        </div>
      </div>
    </DashboardShell>
  );
}
