import Link from "next/link";
import {
  IconRocket,
  IconCloudDownload,
  IconSettings,
  IconShield,
  IconBolt,
  IconMail,
  IconDatabase,
  IconAdjustments,
  IconFileText,
  IconLifebuoy,
} from "@tabler/icons-react";

const quickLinks = [
  {
    title: "Quick Start",
    description: "Spin up the dev environment from the zip you received.",
    href: "/documentation/quick-start",
    icon: IconRocket,
  },
  {
    title: "Installation Guide",
    description: "Full walkthrough covering MongoDB, Stripe, Google, and Resend.",
    href: "/documentation/installation",
    icon: IconCloudDownload,
  },
  {
    title: "Environment Setup",
    description: "Prepare your local tooling, commands, and dev helpers.",
    href: "/documentation/environment",
    icon: IconSettings,
  },
  {
    title: "Env Variables",
    description: "Complete reference for every secret you need to fill.",
    href: "/documentation/env-variables",
    icon: IconFileText,
  },
];

const featureGuides = [
  {
    title: "Authentication",
    description: "NextAuth.js with email/password, Google OAuth, onboarding, and password reset.",
    href: "/documentation/authentication",
    icon: IconShield,
  },
  {
    title: "Billing & Subscriptions",
    description: "Stripe checkout, portal access, proration, trials, and webhook sync.",
    href: "/documentation/billing",
    icon: IconBolt,
  },
  {
    title: "Email System",
    description: "Resend-powered transactional emails with dev fallbacks.",
    href: "/documentation/email",
    icon: IconMail,
  },
  {
    title: "Database & Prisma",
    description: "MongoDB schema, subscription records, usage tracking, and migration tips.",
    href: "/documentation/database",
    icon: IconDatabase,
  },
  {
    title: "Feature Gating",
    description: "Plan-based access controls, middleware routing, and usage limits.",
    href: "/documentation/feature-gating",
    icon: IconAdjustments,
  },
  {
    title: "Deployment",
    description: "Vercel-first playbook plus notes for self-hosting.",
    href: "/documentation/deployment",
    icon: IconCloudDownload,
  },
];

const releaseSteps = [
  "Unzip the download you received from StartupKit (no Git history included).",
  "Fill in .env using the Environment Variables guide and run Prisma migrations.",
  "Register a test account, verify the email via Resend or /dev-tools, and walk through onboarding.",
  "Connect Stripe (products, webhook, CLI) and run a full checkout + cancellation cycle.",
  "Customize theming, pricing copy, and dashboard modules to match your brand.",
  "Zip the project back up (or push to a private repo) when handing it off to your buyers.",
];

const componentCatalog = [
  {
    title: "Tutorials",
    description: "Guided blueprints that mirror the ShipFast playbooks so anyone can follow along.",
    items: [
      "Ship in 5 minutes",
      "Static page",
      "User authentication",
      "API call",
      "Private page",
      "Stripe Subscriptions",
      "Privacy policy with GPT",
    ],
  },
  {
    title: "Features",
    description: "Deep-dives on the production features included in StartupKit.",
    items: [
      "SEO",
      "Database",
      "Emails",
      "Payments",
      "Google OAuth",
      "Magic Links",
      "Customer support",
      "Error handling",
      "Analytics",
    ],
  },
  {
    title: "Components",
    description: "All the UI sections you can remix for your marketing site or app.",
    items: [
      "Header",
      "Hero",
      "Problem",
      "With/Without",
      "Features listicle",
      "Features accordion",
      "Features grid",
      "CTA",
      "Pricing",
      "Blog",
      "FAQ",
      "Testimonial small",
      "Testimonial single",
      "Testimonial triple",
      "Testimonial grid",
      "Footer",
      "Button lead",
      "Button checkout",
      "Button sign-in",
      "Button account",
      "Button gradient",
      "Button popover",
      "Better icon",
      "Tabs",
      "Rating",
      "Modal",
    ],
  },
  {
    title: "Security",
    description: "Operational guardrails to keep subscriptions, email, and AI usage safe.",
    items: [
      "Sending limit in Mailgun",
      "Monthly budget in OpenAI",
      "Rate limiting (Magic Links)",
      "Rate limiting (API Routes)",
      "Security headers",
      "Schema validation",
    ],
  },
  {
    title: "Deployment & Extras",
    description: "Everything you need to ship confidently and keep iterating.",
    items: ["Deployment", "Extras"],
  },
];

export default function DocumentationPage() {
  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-amber-500/10 p-10 shadow-[0_25px_60px_-20px_rgba(79,70,229,0.45)]">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center rounded-full border border-white/40 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            All-in-one SaaS starter
          </span>
          <h1 className="text-4xl font-bold tracking-tight">Launch-ready boilerplate, documented for resale.</h1>
          <p className="text-lg text-muted-foreground">
            Everything in this folder ships as part of the download your customers receive: authentication, billing,
            dashboards, marketing pages, and this documentation site. Follow the sections below to configure, customize,
            and repackage StartupKit with confidence.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/documentation/quick-start"
              className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
            >
              Start with Quick Start →
            </Link>
            <Link
              href="/documentation/billing"
              className="inline-flex items-center rounded-full bg-white/80 px-5 py-2 text-sm font-medium text-blue-700 shadow hover:bg-white"
            >
              Stripe Playbook
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Start Here</h2>
            <p className="text-sm text-muted-foreground">
              Download, install, configure, and verify the boilerplate in minutes.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-white/90 p-3 text-blue-600 shadow">
                  <link.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{link.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Core Modules</h2>
            <p className="text-sm text-muted-foreground">Deep dives for every production feature included in StartupKit.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {featureGuides.map((guide) => (
            <Link
              key={guide.title}
              href={guide.href}
              className="group rounded-2xl border border-border/60 bg-white p-6 transition hover:border-blue-200 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-50 p-2 text-blue-600">
                  <guide.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">{guide.title}</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{guide.description}</p>
              <span className="mt-4 inline-flex text-sm font-medium text-blue-600 group-hover:underline">
                Read guide →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-dashed border-border/70 bg-white p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600/10 p-3 text-blue-600">
            <IconCloudDownload className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Release Playbook (Zip → Production)</h2>
            <p className="text-sm text-muted-foreground">
              Follow this loop every time you customize the boilerplate for a new customer.
            </p>
          </div>
        </div>
        <ol className="space-y-3 text-sm leading-relaxed text-foreground/80">
          {releaseSteps.map((step, index) => (
            <li key={step} className="flex gap-4">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Component Playbook</h2>
            <p className="text-sm text-muted-foreground">
              Modeled after ShipFast&rsquo;s docs so you can explain every major building block clearly.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {componentCatalog.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl border border-border/70 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {section.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="text-lg font-semibold">Tech Stack</h3>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Frontend</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>Next.js 15 (App Router)</li>
                <li>React 19 + TypeScript</li>
                <li>Tailwind CSS v4</li>
                <li>shadcn/ui + Radix primitives</li>
                <li>Recharts + dnd-kit</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Backend</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>NextAuth.js</li>
                <li>Prisma + MongoDB Atlas</li>
                <li>Stripe Billing</li>
                <li>Resend email</li>
                <li>Zod validation</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="text-lg font-semibold">Resources & Support</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>
              📄 Need extra detail? Open <code>AUTH_SETUP.md</code> or <code>STRIPE_SETUP.md</code> inside the project
              root for deep-dive playbooks.
            </li>
            <li>🧪 Use <code>/dev-tools</code> (development only) to mark emails verified instantly.</li>
            <li>
              🧭 Keep this documentation folder in sync before zipping the project so customers can follow along offline.
            </li>
            <li>
              💬 Questions while reselling? Reach out to your StartupKit support contact or add your own support email to
              this list.
            </li>
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-blue-200 bg-blue-50/70 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Need a reminder later?</h3>
            <p className="text-sm text-muted-foreground">
              Bookmark <code>/documentation</code> inside your local copy. It ships with every zip you send to buyers.
            </p>
          </div>
          <Link
            href="/documentation/adding-features"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
          >
            See how to add features
            <IconLifebuoy className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
