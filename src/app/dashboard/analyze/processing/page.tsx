import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ResearchProcessingView } from "@/components/research/research-processing";

export const metadata = {
  title: "Generating Research Brief | Idea Analyzer",
  description:
    "Sit tight while we compile your industry research, competition analysis, keyword trends, and proof signals.",
};

export default async function ResearchProcessingPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login?callbackUrl=%2Fdashboard%2Fanalyze&reason=processing");
  }

  return <ResearchProcessingView />;
}
