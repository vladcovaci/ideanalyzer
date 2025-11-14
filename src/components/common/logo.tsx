import { cn } from "@/lib/utils";
import Link from "next/link";

type LogoProps = {
  className?: string;
  asLink?: boolean;
  href?: string;
};

export function Logo({ className = "", asLink = false, href = "/" }: LogoProps) {
  const baseClassName = cn(
    "flex items-center gap-3 text-lg font-semibold tracking-tight text-foreground",
    className,
  );

  const content = (
    <>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--logo-gradient-start))] via-[hsl(var(--logo-gradient-mid))] to-[hsl(var(--logo-gradient-end))] text-base font-semibold text-[hsl(var(--primary-foreground))] shadow-[0_12px_30px_-12px_var(--logo-shadow)]">
        SK
      </span>
      <span className="sr-only md:not-sr-only md:inline md:text-base md:font-medium">
        StartupKit
      </span>
    </>
  );

  if (asLink) {
    return (
      <Link href={href} className={baseClassName} aria-label="StartupKit home">
        {content}
      </Link>
    );
  }

  return (
    <div className={baseClassName} aria-label="StartupKit">
      {content}
    </div>
  );
}
