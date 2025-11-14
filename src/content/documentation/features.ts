import type { DocPage } from "./types";

export const featureDocs: Record<string, DocPage> = {
  seo: {
    title: "SEO",
    description:
      "Metadata helpers, sitemap routes, and a consistent typographic system keep every page indexable out of the box.",
    sections: [
      {
        heading: "Metadata everywhere",
        body: [
          "`src/lib/metadata.ts` exposes `buildPageMetadata`, which each route (privacy, services, blog posts) already uses. Update `siteConfig` once to refresh OG images and canonical URLs globally.",
        ],
        references: [
          { title: "Metadata helper", path: "src/lib/metadata.ts" },
          { title: "Root layout metadata", path: "src/app/layout.tsx" },
        ],
      },
      {
        heading: "Robots and sitemap",
        body: [
          "The App Router export files (`src/app/robots.ts` and `src/app/sitemap.ts`) make sure crawlers find your marketing and documentation URLs immediately after deployment.",
        ],
        references: [
          { title: "Robots config", path: "src/app/robots.ts" },
          { title: "Sitemap generator", path: "src/app/sitemap.ts" },
        ],
      },
    ],
  },
  database: {
    title: "Database",
    description:
      "Prisma + MongoDB back every auth, billing, and usage feature while keeping schemas simple to extend.",
    sections: [
      {
        heading: "Schema design",
        body: [
          "`prisma/schema.prisma` includes Users, Sessions, Accounts, Subscriptions, UsageRecord, and NotificationPreferences. Add your own models and run `npx prisma db push` to sync.",
        ],
        references: [
          { title: "Prisma schema", path: "prisma/schema.prisma" },
        ],
      },
      {
        heading: "Typed queries",
        body: [
          "Import the singleton Prisma client from `src/lib/db.ts` anywhere in the project. Server components, API routes, and cron jobs can all share it safely.",
        ],
        references: [
          { title: "Prisma client helper", path: "src/lib/db.ts" },
        ],
      },
    ],
  },
  emails: {
    title: "Emails",
    description:
      "Resend delivers verification, password reset, welcome, and billing notifications with graceful fallbacks in development.",
    sections: [
      {
        heading: "HTML templates",
        body: [
          "All transactional emails live in `src/lib/email.ts`. Each helper builds branded HTML and logs a development preview link to the console when `RESEND_API_KEY` is missing.",
        ],
        references: [
          { title: "Email helper", path: "src/lib/email.ts" },
        ],
      },
      {
        heading: "Testing locally",
        body: [
          "Hit `/api/test-email` (see `src/app/api/test-email/route.ts`) or rely on `/dev-tools` to bypass verification until you're ready to wire real DNS.",
        ],
        references: [
          { title: "Test email route", path: "src/app/api/test-email/route.ts" },
          { title: "Dev tools", path: "src/app/dev-tools/page.tsx" },
        ],
      },
    ],
  },
  payments: {
    title: "Payments",
    description:
      "Checkout, portal management, plan upgrades, and feature gating all flow through the Stripe integration.",
    sections: [
      {
        heading: "Server-side helpers",
        body: [
          "`src/lib/stripe.ts` bootstraps the SDK only when `STRIPE_SECRET_KEY` exists, so the app still runs without payments. Update `STRIPE_PLANS` to sync pricing details everywhere.",
        ],
        references: [
          { title: "Stripe config", path: "src/lib/stripe.ts" },
        ],
      },
      {
        heading: "Customer experience",
        body: [
          "Billing UI at `/dashboard/billing` calls `/api/stripe/checkout` and `/api/stripe/portal`. Webhooks keep Prisma in sync, and the `FeatureGate` component nudges users to upgrade.",
        ],
        references: [
          { title: "Billing UI", path: "src/app/dashboard/billing/page.tsx" },
          { title: "Webhook handler", path: "src/app/api/stripe/webhook/route.ts" },
          { title: "Feature gate", path: "src/components/dashboard/feature-gate.tsx" },
        ],
      },
    ],
  },
  "google-oauth": {
    title: "Google OAuth",
    description:
      "Google sign-in ships enabled. Drop your client ID/secret into `.env` and the login buttons immediately work.",
    sections: [
      {
        heading: "Provider config",
        body: [
          "The Google provider inside `src/lib/auth.ts` sets `allowDangerousEmailAccountLinking` to keep multiple sign-in attempts synced, and auto-verifies email addresses on the first callback.",
        ],
        references: [
          { title: "NextAuth config", path: "src/lib/auth.ts" },
        ],
      },
      {
        heading: "UI surfaces",
        body: [
          "Register/login forms already show the Google buttons using `lucide-react` branding. No extra UI wiring is needed beyond the env vars.",
        ],
        references: [
          { title: "Register form", path: "src/components/auth/register-form.tsx" },
          { title: "Login form", path: "src/components/auth/login-form.tsx" },
        ],
      },
    ],
  },
  "magic-links": {
    title: "Magic Links",
    description:
      "While the starter focuses on passwords + OAuth, all the primitives for magic links already exist in Prisma.",
    sections: [
      {
        heading: "Token storage",
        body: [
          "The `VerificationToken` model in `prisma/schema.prisma` mirrors what NextAuth Email providers expect. You can enable the email provider inside `authOptions` and reuse `sendVerificationEmail` for delivering the link.",
        ],
        references: [
          { title: "VerificationToken model", path: "prisma/schema.prisma" },
          { title: "Email helper", path: "src/lib/email.ts" },
        ],
      },
      {
        heading: "Rate limiting",
        body: [
          "Use the `UsageRecord` collection or a simple Redis counter to cap how often a link is issued. The middleware already prevents unverified users from reaching the dashboard, so you only need to toggle the provider.",
        ],
        references: [
          { title: "Usage records", path: "prisma/schema.prisma" },
          { title: "Middleware guard", path: "src/middleware.ts" },
        ],
      },
    ],
  },
  "customer-support": {
    title: "Customer support",
    description:
      "A full support intake exists in the dashboard, piping conversations into `/api/support` for forwarding or CRM syncing.",
    sections: [
      {
        heading: "Dashboard form",
        body: [
          "The `SupportForm` component accepts category, subject, and description, providing a clean example of how to build authenticated forms with form state and toasts.",
        ],
        references: [
          { title: "Support form", path: "src/components/dashboard/support-form.tsx" },
        ],
      },
      {
        heading: "API handler",
        body: [
          "Requests hit `/api/support/route.ts`, which currently logs JSON. Wire it to your help desk, Slack webhook, or Resend template to notify the team.",
        ],
        references: [
          { title: "Support API", path: "src/app/api/support/route.ts" },
        ],
      },
    ],
  },
  "error-handling": {
    title: "Error handling",
    description:
      "Friendly fallbacks keep users oriented if they wander to a missing page or something fails inside the dashboard.",
    sections: [
      {
        heading: "Static 404",
        body: [
          "`src/app/not-found.tsx` renders a polished 404 with quick links back to Pricing, Blog, and Services, so crawlers and humans always land somewhere useful.",
        ],
        references: [
          { title: "Not found page", path: "src/app/not-found.tsx" },
        ],
      },
      {
        heading: "Loading and suspense states",
        body: [
          "Dashboard charts rely on Suspense-ready components. When you add new pages, mirror the skeleton patterns from `src/components/ui/skeleton.tsx` to keep the UX consistent.",
        ],
        references: [
          { title: "Skeleton utility", path: "src/components/ui/skeleton.tsx" },
        ],
      },
    ],
  },
  analytics: {
    title: "Analytics",
    description:
      "The Growth plan ships with a dedicated analytics dashboard powered by server-side queries and client-side charts.",
    sections: [
      {
        heading: "Data fetching",
        body: [
          "`src/app/dashboard/analytics/page.tsx` is a server component, so you can hit Prisma directly (or an external warehouse) before streaming chart-ready data to the client.",
        ],
        references: [
          { title: "Analytics route", path: "src/app/dashboard/analytics/page.tsx" },
        ],
      },
      {
        heading: "Chart primitives",
        body: [
          "Charts are centralized in `src/components/ui/chart.tsx` and `src/components/chart-area-interactive.tsx`, giving you a consistent theming layer for Recharts visualizations.",
        ],
        references: [
          { title: "Chart container", path: "src/components/ui/chart.tsx" },
          { title: "Area chart example", path: "src/components/chart-area-interactive.tsx" },
        ],
      },
    ],
  },
};
