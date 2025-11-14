import Link from "next/link";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Section className="!mt-0 flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-8">
          <h1 className="mb-4 text-6xl font-bold text-primary sm:text-7xl md:text-8xl lg:text-9xl">
            404
          </h1>
          <h2 className="mb-4 text-3xl font-semibold md:text-4xl">
            Lorem ipsum dolor sit amet
          </h2>
          <p className="text-lg text-muted-foreground">
            Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        <div className="mb-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/">Lorem ipsum</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contact">Dolor sit</Link>
          </Button>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8">
          <h3 className="mb-4 text-xl font-semibold">Lorem ipsum</h3>
          <div className="grid gap-4 text-left sm:grid-cols-2">
            <Link
              href="/pricing"
              className="group flex items-center gap-3 rounded-2xl border border-border p-4 transition-all hover:border-primary/30 hover:bg-muted/50"
            >
              <svg
                className="h-5 w-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="font-medium group-hover:text-primary transition-colors">
                  Lorem
                </p>
                <p className="text-sm text-muted-foreground">
                  Ipsum dolor
                </p>
              </div>
            </Link>

            <Link
              href="/services"
              className="group flex items-center gap-3 rounded-2xl border border-border p-4 transition-all hover:border-primary/30 hover:bg-muted/50"
            >
              <svg
                className="h-5 w-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <div className="flex-1">
                <p className="font-medium group-hover:text-primary transition-colors">
                  Sit amet
                </p>
                <p className="text-sm text-muted-foreground">
                  Consectetur elit
                </p>
              </div>
            </Link>

            <Link
              href="/blog"
              className="group flex items-center gap-3 rounded-2xl border border-border p-4 transition-all hover:border-primary/30 hover:bg-muted/50"
            >
              <svg
                className="h-5 w-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              <div className="flex-1">
                <p className="font-medium group-hover:text-primary transition-colors">
                  Adipiscing
                </p>
                <p className="text-sm text-muted-foreground">
                  Elit sed do
                </p>
              </div>
            </Link>

            <Link
              href="/faq"
              className="group flex items-center gap-3 rounded-2xl border border-border p-4 transition-all hover:border-primary/30 hover:bg-muted/50"
            >
              <svg
                className="h-5 w-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="font-medium group-hover:text-primary transition-colors">
                  Tempor
                </p>
                <p className="text-sm text-muted-foreground">
                  Incididunt ut
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
