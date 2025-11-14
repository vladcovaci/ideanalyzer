import Link from "next/link";
import { pricingPlans } from "@/constants/pricing";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Section, SectionHeader } from "@/components/ui/section";

export function PricingSection({
  showHeader = true,
}: {
  showHeader?: boolean;
}) {
  return (
    <Section
      id="pricing"
      className="relative overflow-hidden rounded-[48px] border border-white/60 bg-white/85 shadow-[0_40px_90px_-70px_rgba(36,52,120,0.6)]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(80%_80%_at_50%_-10%,rgba(119,140,255,0.25),transparent)]" />
      {showHeader && (
        <SectionHeader
          eyebrow="Lorem"
          title="Lorem ipsum dolor sit amet."
          description="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
        />
      )}
      <div className="relative mt-14 grid gap-8 md:grid-cols-3">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative h-full overflow-hidden rounded-[36px] border border-white/70 bg-white/85 p-8 shadow-[0_25px_80px_-50px_rgba(32,55,125,0.55)] backdrop-blur ${
              plan.isPopular
                ? "scale-[1.015] border-[rgba(119,140,255,0.6)] shadow-[0_35px_90px_-50px_rgba(86,112,255,0.45)]"
                : ""
            }`}
          >
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground/80">
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col justify-between">
              <div className="space-y-6">
                <p className="text-4xl font-semibold text-foreground">
                  {plan.price}
                  <span className="text-base font-normal text-muted-foreground">
                    {plan.period}
                  </span>
                </p>
                {plan.trialDays ? (
                  <p className="text-sm font-medium text-[hsl(var(--primary))]">
                    {plan.trialDays}-day free trial included
                  </p>
                ) : null}
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(119,140,255,0.12)] text-sm text-[hsl(var(--primary))]">
                        ●
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-1">
                <Button asChild size="lg" className="w-full">
                  <Link href="/register">Lorem with {plan.name}</Link>
                </Button>
                {plan.secondaryCta && (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className={
                      plan.isPopular
                        ? "border-[rgba(119,140,255,0.45)] text-[hsl(var(--primary))]"
                        : ""
                    }
                  >
                    <Link href={plan.secondaryCta.href}>{plan.secondaryCta.label}</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Lorem ipsum dolor sit amet consectetur adipiscing elit{" "}
        <Link href="/contact" className="text-foreground underline">
          sed do eiusmod
        </Link>
        .
      </p>
    </Section>
  );
}
