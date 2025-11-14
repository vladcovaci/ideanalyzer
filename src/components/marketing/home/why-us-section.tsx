import { Section, SectionHeader } from "@/components/ui/section";

const values = [
  {
    title: "Lorem ipsum dolor",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.",
    accent: "from-[rgba(119,140,255,0.25)]",
  },
  {
    title: "Sit amet consect",
    description:
      "Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    accent: "from-[rgba(76,184,202,0.25)]",
  },
  {
    title: "Adipiscing elit",
    description:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    accent: "from-[rgba(255,221,173,0.35)]",
  },
  {
    title: "Sed do eiusmod",
    description:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    accent: "from-[rgba(173,144,255,0.28)]",
  },
];

export function WhyUsSection() {
  return (
    <Section id="why-us" className="relative !mt-0">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-32 rounded-full bg-[rgba(119,140,255,0.18)] blur-3xl" />
      <div className="relative space-y-12">
        <SectionHeader
          eyebrow="Lorem"
          title="Lorem ipsum dolor sit amet."
          description="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          {values.map((value) => (
            <div
              key={value.title}
              className={`group relative overflow-hidden rounded-[36px] border border-white/60 bg-white/80 p-8 shadow-[0_25px_60px_-50px_rgba(41,62,130,0.65)] transition-transform duration-300 hover:-translate-y-2`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${value.accent} via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />
              <div className="relative space-y-4">
                <h3 className="text-xl font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
