import Link from "next/link";
import { Section } from "@/components/ui/section";
import { getLegalContent } from "@/lib/legal";
import { buildPageMetadata } from "@/lib/metadata";

const description =
  "Understand how Idea Analyzer collects, uses, and protects your personal data.";

export const metadata = {
  ...buildPageMetadata({
    title: "Privacy Policy",
    description,
    path: "/privacy",
  }),
  robots: {
    index: true,
    follow: true,
  },
};

export default async function PrivacyPage() {
  const content = await getLegalContent("privacy");

  return (
    <Section className="!mt-0 mx-auto max-w-4xl">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to home
      </Link>

      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          Privacy Policy
        </h1>
        <p className="text-lg text-muted-foreground">
          Last updated: March 2025
        </p>
      </div>

      <div className="markdown" dangerouslySetInnerHTML={{ __html: content }} />

      <div className="mt-12 rounded-3xl border border-border bg-card p-8">
        <h2 className="mb-4 text-xl font-semibold">Questions about privacy?</h2>
        <p className="mb-4 text-muted-foreground">
          If you have concerns about how we handle your information or want to request changes, reach out anytime.
        </p>
        <Link
          href="mailto:privacy@ideanalyzer.app"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Contact our privacy team
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </Section>
  );
}
