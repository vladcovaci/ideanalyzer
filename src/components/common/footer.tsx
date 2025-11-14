"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/common/logo";

const footerLinks = {
  Product: [
    { href: "/services", label: "Services" },
    { href: "/pricing", label: "Pricing" },
    { href: "/faq", label: "FAQ" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ],
  Legal: [
    { href: "/terms", label: "Terms & Conditions" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/cookies", label: "Cookies" },
  ],
};

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/documentation")) {
    return null;
  }

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[rgba(23,28,68,1)] via-[rgba(49,58,119,1)] to-[rgba(16,19,45,1)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_90%_at_80%_10%,rgba(102,124,255,0.35),transparent_70%)]" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 pb-16 pt-20 sm:grid-cols-[1.5fr_2fr] md:gap-16">
        <div className="space-y-6">
          <Logo className="text-white" />
          <p className="max-w-sm text-sm text-white/75">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                {title}
              </p>
              <ul className="space-y-3 text-sm text-white/75">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition hover:text-white"
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
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Lorem Ipsum. All rights reserved.</p>
          <span>Lorem ipsum dolor sit amet.</span>
        </div>
    </footer>
  );
}
