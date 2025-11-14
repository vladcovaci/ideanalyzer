import Link from "next/link";
import { Section } from "@/components/ui/section";
import { getLegalContent } from "@/lib/legal";
import { buildPageMetadata } from "@/lib/metadata";

const description =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.";

export const metadata = {
  ...buildPageMetadata({
    title: "Cookie Policy",
    description,
    path: "/cookies",
  }),
  robots: {
    index: true,
    follow: true,
  },
};

export default async function CookiesPage() {
  const content = await getLegalContent("cookies");

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
          Cookie Policy
        </h1>
        <p className="text-lg text-muted-foreground">
          Last updated: Lorem 2025
        </p>
      </div>

      <div
        className="markdown"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <div className="mt-12 rounded-3xl border border-border bg-card p-8">
        <h2 className="mb-4 text-xl font-semibold">Lorem ipsum?</h2>
        <p className="mb-4 text-muted-foreground">
          Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Contact us
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
