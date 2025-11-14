import { Section, SectionHeader } from "@/components/ui/section";

const steps = [
  {
    title: "Lorem ipsum dolor",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt.",
    time: "~15 minutes",
  },
  {
    title: "Sit amet consect",
    description:
      "Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    time: "~1 hour",
  },
  {
    title: "Adipiscing elit",
    description:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    time: "~30 minutes",
  },
];

export function HowItWorksSection() {
  return (
    <Section
      id="how-it-works"
      className="relative overflow-hidden rounded-[48px] border border-white/60 bg-gradient-to-br from-[rgba(119,140,255,0.12)] via-[rgba(255,221,173,0.12)] to-white/80"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_80%_at_10%_10%,rgba(76,184,202,0.2),transparent)]" />
      <div className="relative">
        <SectionHeader
          eyebrow="Lorem"
          title="Lorem ipsum dolor sit amet."
          description="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque."
        />
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-[0_20px_60px_-45px_rgba(32,55,125,0.8)] backdrop-blur"
            >
              <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(119,140,255,0.2)] text-lg font-semibold text-[hsl(var(--primary))]">
                {index + 1}
              </span>
              <h3 className="relative mt-6 text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="relative mt-4 text-sm text-muted-foreground">
                {step.description}
              </p>
              <div className="relative mt-8 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/70">
                {step.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
