import type { Metadata } from "next";
import { HeroSection } from "@/components/marketing/home/hero-section";

export const metadata: Metadata = {
  title: "Make something people actually want | AI-Powered Idea Validation",
  description:
    "Research and plan your product with AI. Validate your business ideas with intelligent analysis and market insights.",
};

export default function HomePage() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Idea Analyzer",
    url: "https://ideaanalyzer.com",
    logo: "https://ideaanalyzer/og.png",
    description: "Research and plan your product with AI",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <HeroSection />
    </>
  );
}
