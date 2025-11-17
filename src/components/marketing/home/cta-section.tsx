import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

interface CtaSectionProps {
  title: string;
  description?: string;
  primaryCta?: {
    href: string;
    label: string;
  };
  secondaryCta?: {
    href: string;
    label: string;
  };
}

export function CtaSection({
  title,
  description,
  primaryCta,
  secondaryCta,
}: CtaSectionProps) {
  return (
    <Section>
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold text-foreground md:text-4xl">{title}</h2>
        {description && (
          <p className="mt-4 text-lg text-muted-foreground">{description}</p>
        )}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {primaryCta && (
            <Button asChild size="lg">
              <Link href={primaryCta.href}>{primaryCta.label}</Link>
            </Button>
          )}
          {secondaryCta && (
            <Button asChild size="lg" variant="outline">
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          )}
        </div>
      </div>
    </Section>
  );
}
