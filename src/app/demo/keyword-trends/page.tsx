import type { Metadata } from "next";
import { KeywordAnalyticsSection } from "@/components/research/keyword-analytics-section";
import { buildFallbackKeywordAnalytics } from "@/lib/research/keyword-analytics";

export const metadata: Metadata = {
  title: "Keyword Trend Visualization | Idea Analyzer",
  description: "Preview keyword search volume, growth, and historical trends.",
};

const SAMPLE_SUMMARY =
  "AI analyst that converts founder interviews into structured research briefs, including competition, proof signals, and keyword demand.";

export default function KeywordTrendDemoPage() {
  const sampleData = buildFallbackKeywordAnalytics(SAMPLE_SUMMARY);

  return (
    <div className="pb-20 pt-12">
      <KeywordAnalyticsSection
        data={sampleData}
        title="Keyword Trend Visualization"
        description="Sample keyword analytics showing estimated search demand, growth, and trendlines."
      />
    </div>
  );
}
