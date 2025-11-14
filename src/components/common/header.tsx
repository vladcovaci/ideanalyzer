"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { services } from "@/constants/services";

type NavItem =
  | {
      type: "link";
      href: string;
      label: string;
    }
  | {
      type: "services";
    };

const navItems: NavItem[] = [
  { type: "link", href: "/about", label: "About" },
  { type: "services" },
  { type: "link", href: "/pricing", label: "Pricing" },
  { type: "link", href: "/blog", label: "Blog" },
  { type: "link", href: "/faq", label: "FAQ" },
  { type: "link", href: "/contact", label: "Contact" },
];

const serviceMenuItems = services.slice(0, 3).map((service) => ({
  href: `/services/${service.slug}`,
  label: service.title,
  description:
    service.description.length > 110
      ? `${service.description.slice(0, 107)}...`
      : service.description,
}));

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const closeServicesTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideHeader =
    pathname?.startsWith("/dashboard") || pathname?.startsWith("/documentation");

  useEffect(() => {
    if (!open) {
      setServicesOpen(false);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeServicesTimeout.current) {
        clearTimeout(closeServicesTimeout.current);
      }
    };
  }, []);

  const clearServicesCloseTimeout = () => {
    if (closeServicesTimeout.current) {
      clearTimeout(closeServicesTimeout.current);
      closeServicesTimeout.current = null;
    }
  };

  const openServicesMenu = () => {
    clearServicesCloseTimeout();
    setServicesOpen(true);
  };

  const scheduleServicesMenuClose = () => {
    clearServicesCloseTimeout();
    closeServicesTimeout.current = setTimeout(() => {
      setServicesOpen(false);
      closeServicesTimeout.current = null;
    }, 120);
  };

  if (hideHeader) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 flex justify-center px-4 pb-4 pt-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-5 py-3 shadow-[0_18px_60px_-28px_var(--glass-shadow-strong)] backdrop-blur-lg supports-[backdrop-filter]:bg-[color:var(--glass-surface)] md:px-8">
        <Logo asLink />

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navItems.map((item) => {
            if (item.type === "link") {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <div
                key="services"
                className="relative"
                onMouseEnter={openServicesMenu}
                onMouseLeave={scheduleServicesMenuClose}
                onFocusCapture={openServicesMenu}
                onBlur={(event) => {
                  if (
                    event.relatedTarget &&
                    event.currentTarget.contains(event.relatedTarget as Node)
                  ) {
                    return;
                  }
                  clearServicesCloseTimeout();
                  setServicesOpen(false);
                }}
              >
                <div className="flex items-center gap-1">
                  <Link
                    href="/services"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Services
                  </Link>
                  <button
                    type="button"
                    className="flex items-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label="Toggle services menu"
                    aria-haspopup="true"
                    aria-expanded={servicesOpen}
                    aria-controls="site-header-services-menu"
                    onClick={() => {
                      clearServicesCloseTimeout();
                      setServicesOpen((prev) => !prev);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        event.preventDefault();
                        setServicesOpen(false);
                      }
                    }}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        servicesOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </div>
                {servicesOpen && (
                  <div
                    id="site-header-services-menu"
                    className="absolute left-1/2 top-full z-50 mt-4 w-[320px] -translate-x-1/2 rounded-3xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface-strong)] p-6 shadow-[0_24px_60px_-40px_var(--shadow-elevated)] backdrop-blur"
                    onMouseEnter={openServicesMenu}
                    onMouseLeave={scheduleServicesMenuClose}
                  >
                    <ul className="space-y-3 text-left">
                      {serviceMenuItems.map((service) => (
                        <li key={service.href}>
                          <Link
                            href={service.href}
                            className="block rounded-2xl border border-transparent px-4 py-3 transition hover:border-[color:var(--glass-border)] hover:bg-muted/60 hover:text-foreground"
                            onClick={() => setServicesOpen(false)}
                          >
                            <span className="text-sm font-semibold text-foreground">
                              {service.label}
                            </span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {service.description}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Login
          </Link>
          <Button asChild>
            <Link href="/register">Start free trial</Link>
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
            {navItems.map((item) => {
              if (item.type === "link") {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <div
                  key="services-mobile"
                  className="rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-4 py-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Services
                  </p>
                  <ul className="mt-3 space-y-2">
                    {serviceMenuItems.map((service) => (
                      <li key={service.href}>
                        <Link
                          href={service.href}
                          className="block rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
                          onClick={() => setOpen(false)}
                        >
                          <span className="font-medium text-foreground">{service.label}</span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {service.description}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            <Link
              href="/login"
              className="rounded-xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
            <Button asChild className="mt-3 w-full">
              <Link href="/register" onClick={() => setOpen(false)}>
                Start free trial
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
