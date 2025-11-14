import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

export type CtaSectionProps = {
  title: string;
  description: string;
  primaryCta: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  variant?: "default" | "accent";
};

export function CtaSection({
  title,
  description,
  primaryCta,
  secondaryCta,
  variant = "default",
}: CtaSectionProps) {
  const isAccent = variant === "accent";
  return (
    <Section
      className={`relative overflow-hidden rounded-[40px] border border-white/60 ${
        isAccent
          ? "bg-gradient-to-br from-[rgba(23,28,68,1)] via-[rgba(49,58,119,1)] to-[rgba(16,19,45,1)] text-white"
          : "bg-white/85 shadow-[0_24px_70px_-60px_rgba(32,55,125,0.6)]"
      }`}
    >
      {!isAccent && (
        <div className="pointer-events-none absolute -top-1/2 left-[-10%] h-full w-2/3 bg-[radial-gradient(60%_80%_at_20%_30%,rgba(119,140,255,0.25),transparent_70%)]" />
      )}
      {isAccent && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_90%_at_80%_10%,rgba(102,124,255,0.35),transparent_70%)]" />
      )}

      <div className="relative mx-auto flex max-w-4xl flex-col items-start gap-8 text-left md:flex-row md:items-center md:text-left">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
          <p className={`text-lg ${isAccent ? "text-white/75" : "text-muted-foreground"}`}>
            {description}
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:justify-end">
          <Button asChild size="lg" variant={isAccent ? "outline" : "default"}>
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </Button>
          {secondaryCta && (
            <Button asChild size="lg" variant={isAccent ? "secondary" : "outline"}>
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          )}
        </div>
      </div>
    </Section>
  );
}
