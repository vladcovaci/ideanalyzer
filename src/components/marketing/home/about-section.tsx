import { Section, SectionHeader } from "@/components/ui/section";

const highlights = [
  {
    icon: "✨",
    title: "Lorem ipsum primis",
    description:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt.",
  },
  {
    icon: "⚙️",
    title: "Dolor sit amet",
    description:
      "Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    icon: "🧩",
    title: "Consectetur integer",
    description:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
];

export function AboutSection() {
  return (
    <Section
      id="about"
      className="relative overflow-hidden rounded-[40px] border border-white/60 bg-white/80 shadow-[0_30px_80px_-60px_rgba(39,71,144,0.45)]"
    >
      <div className="pointer-events-none absolute -top-24 right-10 h-40 w-40 rounded-full bg-[rgba(255,221,173,0.35)] blur-3xl" />
      <div className="relative space-y-12">
        <SectionHeader
          eyebrow="Lorem"
          title="Lorem ipsum dolor sit amet."
          description="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
          align="center"
        />

        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((highlight) => (
            <div
              key={highlight.title}
              className="group relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white/90 via-white/70 to-white/60 p-8 shadow-[0_20px_50px_-35px_rgba(32,55,125,0.7)] transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(119,140,255,0.35),transparent_65%)]" />
              </div>
              <div className="relative space-y-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(119,140,255,0.1)] text-2xl">
                  {highlight.icon}
                </span>
                <h3 className="text-xl font-semibold text-foreground">
                  {highlight.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {highlight.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
