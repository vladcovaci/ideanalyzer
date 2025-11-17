import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin";
import { FeedbackAnalyticsDashboard } from "@/components/admin/feedback-analytics-dashboard";

export const metadata = {
  title: "Feedback Analytics | Admin",
};

export default async function AdminFeedbackPage() {
  const session = await requireAdminSession();
  if (!session) {
    redirect("/dashboard?error=forbidden");
  }

  return (
    <div className="min-h-screen bg-muted/20 px-4 py-10 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Admin Dashboard
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Feedback Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor research brief quality across cohorts and time.
          </p>
        </div>

        <FeedbackAnalyticsDashboard />
      </div>
    </div>
  );
}
