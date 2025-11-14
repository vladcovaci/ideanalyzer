import { Section } from "@/components/ui/section";

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <Section className="relative overflow-hidden rounded-[40px] border border-white/60 bg-white/85 text-center shadow-[0_30px_80px_-60px_rgba(41,62,130,0.45)] md:text-left">
      <div className="pointer-events-none absolute -top-1/2 left-[-10%] h-full w-2/3 bg-[radial-gradient(60%_80%_at_20%_20%,rgba(119,140,255,0.22),transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-1/2 right-[-10%] h-full w-2/3 bg-[radial-gradient(60%_80%_at_80%_70%,rgba(255,221,173,0.22),transparent_70%)]" />
      <div className="relative mx-auto flex max-w-3xl flex-col gap-5">
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground/70">
            {eyebrow}
          </span>
        )}
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground sm:text-xl">{description}</p>
      </div>
    </Section>
  );
}
