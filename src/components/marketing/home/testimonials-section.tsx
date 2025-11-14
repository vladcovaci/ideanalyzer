import { Section, SectionHeader } from "@/components/ui/section";

const testimonials = [
  {
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.",
    name: "Harper Reed",
    role: "Lorem Studio",
    accent: "from-[rgba(119,140,255,0.25)]",
  },
  {
    quote:
      "Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    name: "Amelia Chen",
    role: "Dolor Company",
    accent: "from-[rgba(173,144,255,0.28)]",
  },
  {
    quote:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    name: "Luis Ortega",
    role: "Consectetur Labs",
    accent: "from-[rgba(76,184,202,0.28)]",
  },
];

export function TestimonialsSection() {
  return (
    <Section className="relative !mt-0 !py-0">
      <div className="pointer-events-none absolute inset-x-0 top-10 h-40 rounded-full bg-[rgba(76,184,202,0.18)] blur-3xl" />
      <div className="relative space-y-12">
        <SectionHeader
          eyebrow="Lorem"
          title="Lorem ipsum dolor sit amet."
          description="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <figure
              key={item.name}
              className="group relative overflow-hidden rounded-[32px] border border-white/60 bg-white/85 p-8 shadow-[0_25px_70px_-50px_rgba(41,62,130,0.6)]"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.accent} via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />
              <blockquote className="relative text-base leading-relaxed text-muted-foreground min-h-[100px]">
                “{item.quote}”
              </blockquote>
              <figcaption className="relative mt-6 text-sm font-medium text-foreground">
                {item.name}
                <span className="mt-1 block text-xs font-normal uppercase tracking-[0.25em] text-muted-foreground/70">
                  {item.role}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Section>
  );
}
