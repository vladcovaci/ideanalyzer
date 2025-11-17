"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [];


export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const hideHeader = pathname?.startsWith("/dashboard");

  if (hideHeader) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 flex justify-center px-4 pb-4 pt-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 rounded-xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-5 py-3 shadow-[0_18px_60px_-28px_var(--glass-shadow-strong)] backdrop-blur-lg supports-[backdrop-filter]:bg-[color:var(--glass-surface)] md:px-8">
        <Logo asLink />

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Button
            variant="outline"
            size="icon"
            aria-label="Toggle navigation"
            aria-expanded={open}
            aria-controls="site-header-mobile-menu"
            onClick={() => setOpen((prev) => !prev)}
          >
            ☰
          </Button>
        </div>
      </div>

      {open && (
        <div
          id="site-header-mobile-menu"
          className="absolute left-4 right-4 top-[88px] rounded-3xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface-strong)] px-6 py-4 shadow-[0_18px_60px_-28px_var(--glass-shadow-soft)] backdrop-blur md:hidden"
        >
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild className="mt-3 w-full">
              <Link href="/login" onClick={() => setOpen(false)}>
                Login
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
