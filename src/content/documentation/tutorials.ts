import type { DocPage } from "./types";

export const tutorialDocs: Record<string, DocPage> = {
  "ship-in-5-minutes": {
    title: "Ship in 5 minutes",
    description:
      "Unzip the boilerplate, wire the minimum env vars, and lean on the built-in dev tooling to get a live SaaS preview right away.",
    sections: [
      {
        heading: "Unpack and install",
        body: [
          "Every customer download is a self-contained zip. Unzip it anywhere, run `npm install`, and you're already holding the same source that powers the live demo.",
        ],
        references: [
          {
            title: "Quick Start steps",
            path: "src/app/documentation/quick-start/page.tsx",
            description: "Matches the exact CLI commands surfaced inside the docs.",
          },
        ],
      },
      {
        heading: "Configure only the essentials",
        body: [
          "Copy `.env.example` to `.env` and fill `DATABASE_URL`, `NEXTAUTH_SECRET`, and the local URLs. Everything else (Stripe, Google, Resend) can wait until you're ready to demo payments or email.",
        ],
        references: [
          {
            title: ".env template",
            path: ".env.example",
          },
        ],
      },
      {
        heading: "Verify auth instantly",
        body: [
          "Run `npm run dev`, register at `/register`, then open `/dev-tools` to mark the account verified without configuring Resend. Within five minutes you can walk someone through onboarding, dashboard widgets, and billing states.",
        ],
        references: [
          {
            title: "Dev tools page",
            path: "src/app/dev-tools/page.tsx",
          },
        ],
      },
    ],
  },
  "static-page": {
    title: "Static page",
    description:
      "Marketing pages use pure React Server Components plus the glassmorphic design tokens defined in `globals.css`, making it trivial to add or remix sections.",
    sections: [
      {
        heading: "Duplicate the home layout",
        body: [
          "The landing hero, feature rows, testimonial grid, and CTA each live in modular components under `src/components/marketing/home`. Import what you need into any `/src/app/{route}/page.tsx` file.",
        ],
        references: [
          {
            title: "Hero section",
            path: "src/components/marketing/home/hero-section.tsx",
          },
          {
            title: "CTA section",
            path: "src/components/marketing/home/cta-section.tsx",
          },
        ],
      },
      {
        heading: "Legal and info pages",
        body: [
          "About, privacy, terms, and FAQ already exist as examples. Clone these routes when you need quick static content and update the markdown sources when necessary.",
        ],
        references: [
          { title: "About page", path: "src/app/about/page.tsx" },
          { title: "Privacy page", path: "src/app/privacy/page.tsx" },
        ],
      },
      {
        heading: "Global theming",
        body: [
          "All typography, gradients, and shadows are defined in `src/app/globals.css`. Tweak the CSS variables once and every static page adopts the new look.",
        ],
        references: [
          { title: "Design tokens", path: "src/app/globals.css" },
        ],
      },
    ],
  },
  "user-authentication": {
    title: "User authentication",
    description:
      "NextAuth.js handles email/password plus Google OAuth, with onboarding and middleware-protected dashboards baked in.",
    sections: [
      {
        heading: "Auth providers",
        body: [
          "Credentials and Google providers are configured in `authOptions`. Email accounts respect verification status before allowing sign-in, and Google logins auto-verify on the first callback.",
        ],
        references: [
          { title: "NextAuth config", path: "src/lib/auth.ts" },
        ],
      },
      {
        heading: "Pages and middleware",
        body: [
          "Login/register/forgot/reset screens live under `src/app/(auth)`. `src/middleware.ts` funnels users through onboarding before they can reach `/dashboard/*` routes and keeps auth-only pages hidden once someone is signed in.",
        ],
        references: [
          { title: "Middleware rules", path: "src/middleware.ts" },
        ],
      },
      {
        heading: "Session data in the UI",
        body: [
          "Dashboard pages access the server session via `getServerSession`, while client components use `useSession` to show greetings, plan badges, and conditional UI.",
        ],
        references: [
          { title: "Dashboard header example", path: "src/components/site-header.tsx" },
        ],
      },
    ],
  },
  "api-call": {
    title: "API call",
    description:
      "App Router API routes make it easy to wire new endpoints with full access to Prisma, Stripe helpers, and NextAuth sessions.",
    sections: [
      {
        heading: "Model a route",
        body: [
          "Place a `route.ts` file under `src/app/api/{resource}`. Use `NextResponse` for structured JSON, and reach for `getServerSession(authOptions)` whenever the handler needs to know who is calling.",
        ],
        references: [
          { title: "Support API example", path: "src/app/api/support/route.ts" },
        ],
      },
      {
        heading: "Share business helpers",
        body: [
          "Stripe utilities, Prisma client, and plan lookups already live in `src/lib`. Import them directly inside the API route so everything stays type-safe and centralized.",
        ],
        references: [
          { title: "Stripe helpers", path: "src/lib/stripe.ts" },
          { title: "Prisma client", path: "src/lib/db.ts" },
        ],
      },
      {
        heading: "Surface data in the UI",
        body: [
          "Client components fetch with `fetch('/api/...')` as shown in `src/components/site-header.tsx`, or server components can call the underlying function directly for better performance.",
        ],
        references: [
          { title: "Plan badge fetch", path: "src/components/site-header.tsx" },
        ],
      },
    ],
  },
  "private-page": {
    title: "Private page",
    description:
      "Dashboard routes render inside a shared shell, enforce onboarding, and can opt into plan-gated components.",
    sections: [
      {
        heading: "Create the route",
        body: [
          "Add a folder under `src/app/dashboard`. Each `page.tsx` uses server components so you can query Prisma directly before rendering charts or tables.",
        ],
        references: [
          { title: "Analytics route template", path: "src/app/dashboard/analytics/page.tsx" },
        ],
      },
      {
        heading: "Use the dashboard shell",
        body: [
          "Wrap content with `DashboardShell` and `DashboardHeader` to inherit spacing, breadcrumbs, and responsive layout.",
        ],
        references: [
          { title: "Shell component", path: "src/components/dashboard/dashboard-shell.tsx" },
        ],
      },
      {
        heading: "Lock it down",
        body: [
          "Middleware already blocks anonymous traffic and can optionally require a paid plan through `ENABLE_SUBSCRIPTION_ENFORCEMENT`. Use the `FeatureGate` component for fine-grained gating inside the page.",
        ],
        references: [
          { title: "Middleware", path: "src/middleware.ts" },
          { title: "Feature gate UI", path: "src/components/dashboard/feature-gate.tsx" },
        ],
      },
    ],
  },
  "stripe-subscriptions": {
    title: "Stripe subscriptions",
    description:
      "Checkout, portal access, plan gating, and webhook sync are wired end-to-end for the Starter/Growth/Scale plans defined in `STRIPE_PLANS`.",
    sections: [
      {
        heading: "Plan config",
        body: [
          "Update pricing, limits, and feature flags in `STRIPE_PLANS`. The object feeds both the marketing site and the dashboard gating helpers.",
        ],
        references: [
          { title: "Stripe config", path: "src/lib/stripe.ts" },
        ],
      },
      {
        heading: "Customer journey",
        body: [
          "Users start checkout via `/dashboard/billing`, hit `/api/stripe/checkout`, and manage their subscription in the portal triggered by `/api/stripe/portal`.",
        ],
        references: [
          { title: "Billing page", path: "src/app/dashboard/billing/page.tsx" },
          { title: "Checkout route", path: "src/app/api/stripe/checkout/route.ts" },
          { title: "Portal route", path: "src/app/api/stripe/portal/route.ts" },
        ],
      },
      {
        heading: "Keep Prisma in sync",
        body: [
          "The webhook handler listens for checkout completion, subscription updates, and cancellations, ensuring `User` records always carry the latest customer IDs and plan metadata.",
        ],
        references: [
          { title: "Webhook handler", path: "src/app/api/stripe/webhook/route.ts" },
          { title: "User model fields", path: "prisma/schema.prisma" },
        ],
      },
    ],
  },
  "privacy-policy-with-gpt": {
    title: "Privacy policy with GPT",
    description:
      "Legal pages are rendered from markdown, so you can generate content with GPT (or any LLM) and drop it straight into the repository.",
    sections: [
      {
        heading: "Markdown-driven content",
        body: [
          "The privacy route reads `src/content/legal/privacy.md` through `getLegalContent`. Any markdown generated by GPT instantly renders with the typographic system already in place.",
        ],
        references: [
          { title: "Markdown loader", path: "src/lib/legal.ts" },
          { title: "Privacy markdown", path: "src/content/legal/privacy.md" },
        ],
      },
      {
        heading: "Update cadence",
        body: [
          "Store the AI prompt and responses alongside the repo so you can regenerate policies whenever regulations change. Because the markdown lives in Git, you retain a history of every revision.",
        ],
      },
      {
        heading: "Link back everywhere",
        body: [
          "Use `buildPageMetadata` to keep metadata accurate and add links from onboarding, checkout, or the footer when you need to reference the updated language.",
        ],
        references: [
          { title: "Metadata helper", path: "src/lib/metadata.ts" },
          { title: "Footer links", path: "src/components/common/footer.tsx" },
        ],
      },
    ],
  },
};
