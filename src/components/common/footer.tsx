"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/common/logo";

const footerLinks: Record<string, { href: string; label: string }[]> = {
  Legal: [
    { href: "/terms", label: "Terms & Conditions" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/cookies", label: "Cookies" },
  ],
};

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="relative overflow-hidden border-t border-[color:var(--border)] bg-[#f9e7d2] text-foreground">
      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 pb-16 pt-20 sm:grid-cols-[1.5fr_2fr] md:gap-16">
        <div className="space-y-6">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            Idea Analyzer helps you validate, prioritize, and plan ideas with AI-powered research.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-1 text-right">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                {title}
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Idea Analyzer. All rights reserved.</p>
          <span>Built to analyze and refine your ideas.</span>
        </div>
    </footer>
  );
}
