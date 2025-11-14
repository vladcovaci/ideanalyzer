import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";



export function HeroSection() {
  return (
    <Section className="relative overflow-hidden rounded-[48px] border border-white/60 bg-white/85 shadow-[0_40px_100px_-60px_rgba(32,55,125,0.55)] backdrop-blur-xl md:px-12">
      <div className="pointer-events-none absolute -top-32 left-[-10%] h-72 w-72 rounded-full bg-[rgba(116,144,255,0.35)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-[-15%] h-96 w-96 rounded-full bg-[rgba(74,207,197,0.3)] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[url('data:image/svg+xml,%3Csvg width=\'160\' height=\'160\' viewBox=\'0 0 160 160\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath opacity=\'0.08\' d=\'M0 40L160 0V40L0 80V40Z\' fill=\'#1B3A90\'/%3E%3C/svg%3E')] opacity-40" />

      <div className="relative grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
            Lorem ipsum
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-[1.05] text-foreground sm:text-6xl">
              Lorem ipsum dolor sit amet consectetur adipiscing elit.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link href="/pricing">Lorem ipsum</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Dolor sit amet</Link>
            </Button>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-md rounded-[40px] bg-gradient-to-br from-[rgba(119,140,255,0.9)] via-[rgba(105,205,222,0.85)] to-[rgba(255,221,173,0.9)] p-1 shadow-[0_40px_60px_-40px_rgba(32,55,125,0.8)]">
            <div className="relative h-full rounded-[36px] bg-white/85 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground/60">
                    Lorem plan
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-foreground">
                    Dolor timeline
                  </h3>
                </div>
                <span className="rounded-full bg-[rgba(255,255,255,0.7)] px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))]">
                  3× faster
                </span>
              </div>

              <div className="mt-8 space-y-5">
                {[
                  { label: "Lorem ipsum setup", value: 82, time: "Day 1" },
                  { label: "Dolor sit amet", value: 68, time: "Day 2" },
                  { label: "Consectetur review", value: 45, time: "Day 3" },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <span>{item.label}</span>
                      <span>{item.time}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[hsl(var(--muted))]">
                      <div
                        className="h-2 rounded-full bg-[hsl(var(--primary))] shadow-[0_6px_16px_-8px_rgba(86,112,255,0.9)]"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-3xl border border-white/60 bg-white/80 p-4 text-sm text-muted-foreground">
                “Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.”
                <span className="mt-3 block text-sm font-semibold text-foreground">
                  — Lorem, Ipsum Company
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Section>
  );
}
