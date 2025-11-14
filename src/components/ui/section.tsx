import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("mx-auto w-full max-w-6xl px-6 py-24 md:px-8 md:py-28 mt-12 md:mt-20", className)}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-3xl flex-col gap-5",
        align === "center" ? "text-center" : "text-left",
      )}
    >
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground/70">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-muted-foreground sm:text-xl">{description}</p>
      )}
    </div>
  );
}
