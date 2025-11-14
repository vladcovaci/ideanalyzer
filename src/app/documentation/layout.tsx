"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/common/logo";

const navigation = [
  {
    title: "Get Started",
    items: [
      { title: "Introduction", href: "/documentation" },
      { title: "Quick Start", href: "/documentation/quick-start" },
      { title: "Installation", href: "/documentation/installation" },
      { title: "Environment Setup", href: "/documentation/environment" },
      { title: "Environment Variables", href: "/documentation/env-variables" },
      { title: "Authentication", href: "/documentation/authentication" },
      { title: "Subscription & Billing", href: "/documentation/billing" },
      { title: "Email System", href: "/documentation/email" },
      { title: "Database", href: "/documentation/database" },
      { title: "Feature Gating", href: "/documentation/feature-gating" },
      { title: "Theming", href: "/documentation/theming" },
      { title: "Components Overview", href: "/documentation/components" },
      { title: "Adding Features", href: "/documentation/adding-features" },
    ],
  },
  {
    title: "Tutorials",
    items: [
      { title: "Ship in 5 minutes", href: "/documentation/tutorials/ship-in-5-minutes" },
      { title: "Static page", href: "/documentation/tutorials/static-page" },
      { title: "User authentication", href: "/documentation/tutorials/user-authentication" },
      { title: "API call", href: "/documentation/tutorials/api-call" },
      { title: "Private page", href: "/documentation/tutorials/private-page" },
      { title: "Stripe Subscriptions", href: "/documentation/tutorials/stripe-subscriptions" },
      { title: "Privacy policy with GPT", href: "/documentation/tutorials/privacy-policy-with-gpt" },
    ],
  },
  {
    title: "Features",
    items: [
      { title: "SEO", href: "/documentation/features/seo" },
      { title: "Database", href: "/documentation/features/database" },
      { title: "Emails", href: "/documentation/features/emails" },
      { title: "Payments", href: "/documentation/features/payments" },
      { title: "Google OAuth", href: "/documentation/features/google-oauth" },
      { title: "Magic Links", href: "/documentation/features/magic-links" },
      { title: "Customer support", href: "/documentation/features/customer-support" },
      { title: "Error handling", href: "/documentation/features/error-handling" },
      { title: "Analytics", href: "/documentation/features/analytics" },
    ],
  },
  {
    title: "Components",
    items: [
      { title: "Header", href: "/documentation/components/header" },
      { title: "Hero", href: "/documentation/components/hero" },
      { title: "Problem", href: "/documentation/components/problem" },
      { title: "With/Without", href: "/documentation/components/with-without" },
      { title: "Features Listicle", href: "/documentation/components/features-listicle" },
      { title: "Features Accordion", href: "/documentation/components/features-accordion" },
      { title: "Features Grid", href: "/documentation/components/features-grid" },
      { title: "CTA", href: "/documentation/components/cta" },
      { title: "Pricing", href: "/documentation/components/pricing" },
      { title: "Blog", href: "/documentation/components/blog" },
      { title: "FAQ", href: "/documentation/components/faq" },
      { title: "Testimonial Small", href: "/documentation/components/testimonial-small" },
      { title: "Testimonial Single", href: "/documentation/components/testimonial-single" },
      { title: "Testimonial Triple", href: "/documentation/components/testimonial-triple" },
      { title: "Testimonial Grid", href: "/documentation/components/testimonial-grid" },
      { title: "Footer", href: "/documentation/components/footer" },
      { title: "Button Lead", href: "/documentation/components/button-lead" },
      { title: "Button Checkout", href: "/documentation/components/button-checkout" },
      { title: "Button Sign-in", href: "/documentation/components/button-sign-in" },
      { title: "Button Account", href: "/documentation/components/button-account" },
      { title: "Button Gradient", href: "/documentation/components/button-gradient" },
      { title: "Button Popover", href: "/documentation/components/button-popover" },
      { title: "Better Icon", href: "/documentation/components/better-icon" },
      { title: "Tabs", href: "/documentation/components/tabs" },
      { title: "Rating", href: "/documentation/components/rating" },
      { title: "Modal", href: "/documentation/components/modal" },
    ],
  },
  {
    title: "Deployment",
    items: [{ title: "Deployment", href: "/documentation/deployment" }],
  },
  {
    title: "Extras",
    items: [
      { title: "Extras", href: "/documentation/extras" },
      { title: "Support", href: "/documentation/support" },
    ],
  },
];

export default function DocumentationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-background px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(true)}
        >
          <IconMenu2 className="h-6 w-6" />
        </Button>
        <div className="flex-1 text-sm font-semibold leading-6">
          Documentation
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                >
                  <IconX className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background px-6 pb-4">
                <nav className="flex flex-1 flex-col pt-6">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    {navigation.map((section) => (
                      <li key={section.title}>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {section.title}
                        </h3>
                        <ul role="list" className="mt-3 space-y-1">
                          {section.items.map((item) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                  "block rounded-md px-3 py-2 text-sm transition-colors",
                                  pathname === item.href
                                    ? "bg-blue-600 text-white font-medium"
                                    : "text-foreground hover:bg-accent"
                                )}
                              >
                                {item.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-background px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <Link href="https://startupkit.today" className="text-xl font-bold">
             <Logo />
            </Link>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              {navigation.map((section) => (
                <li key={section.title}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </h3>
                  <ul role="list" className="mt-3 space-y-1">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm transition-colors",
                            pathname === item.href
                              ? "bg-blue-600 text-white font-medium"
                              : "text-foreground hover:bg-accent"
                          )}
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <main className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="docs-content mx-auto max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
