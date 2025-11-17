"use client";

import { Section } from "@/components/ui/section";
import { IdeaInput } from "@/components/ui/idea-input";

export function HeroSection() {
  const handleIdeaSubmit = (idea: string, isPrivate: boolean) => {
    // For authenticated users, redirect to analysis page
    // This will be handled by the IdeaInput component
    console.log("Analyzing idea:", idea, "Private:", isPrivate);
  };

  return (
    <Section className="relative overflow-hidden">
      {/* Subtle background gradient blobs */}
      {/* <div className="pointer-events-none absolute -top-32 left-[-10%] h-72 w-72 rounded-full bg-[rgba(116,144,255,0.08)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-[-15%] h-96 w-96 rounded-full bg-[rgba(74,207,197,0.06)] blur-3xl" /> */}

      <div className="relative flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-3 rounded-lg border border-white/70 bg-[color:var(--glass-surface)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/80 shadow-sm backdrop-blur-sm">
          Idea Analyzer
        </div>

        {/* Hero Heading */}
        <div className="mt-8 space-y-4">
          <h1 className="mx-auto max-w-4xl text-4xl font-semibold leading-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Is your idea 
            <br />
            worth building?
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            Validate your business idea with AI-powered analysis and market insights.
          </p>
        </div>

        {/* Idea Input Component */}
        <div className="mt-12 w-full">
          <IdeaInput onSubmit={handleIdeaSubmit} />
        </div>
      </div>
    </Section>
  );
}
