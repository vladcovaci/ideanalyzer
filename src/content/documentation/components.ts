import type { DocPage } from "./types";

export const componentDocs: Record<string, DocPage> = {
  header: {
    title: "Header",
    description:
      "A logged-in aware header already exists for dashboard views, and the marketing header lives separately so you can tune both experiences.",
    sections: [
      {
        heading: "Marketing header",
        body: [
          "`src/components/common/header.tsx` handles the glassy marketing nav with dropdown services. Update the `navItems` array to surface new docs or landing sections.",
        ],
        references: [
          { title: "Marketing header", path: "src/components/common/header.tsx" },
        ],
      },
      {
        heading: "Dashboard header",
        body: [
          "Inside the app shell, `src/components/site-header.tsx` greets the user, fetches their plan via `/api/user/subscription`, and shows contextual actions.",
        ],
        references: [
          { title: "Dashboard header", path: "src/components/site-header.tsx" },
        ],
      },
    ],
  },
  hero: {
    title: "Hero",
    description:
      "The home hero mixes gradient blobs, stat pills, and CTA buttons. Reuse it on a new route or split the layout into smaller pieces.",
    sections: [
      {
        heading: "Structure",
        body: [
          "See `src/components/marketing/home/hero-section.tsx` for the final markup. It leans on CSS variables from `globals.css` so color changes propagate automatically.",
        ],
        references: [
          { title: "Hero component", path: "src/components/marketing/home/hero-section.tsx" },
        ],
      },
    ],
  },
  problem: {
    title: "Problem",
    description:
      "Explain the pain before pitching the solution using the 'Why us' section and supporting cards.",
    sections: [
      {
        heading: "Narrative layout",
        body: [
          "`src/components/marketing/home/why-us-section.tsx` combines a lead paragraph, highlighted stats, and bullet cards — perfect for a problem/solution treatment.",
        ],
        references: [
          { title: "Why us section", path: "src/components/marketing/home/why-us-section.tsx" },
        ],
      },
    ],
  },
  "with-without": {
    title: "With/Without",
    description:
      "Use the card primitives to compare life with StartupKit versus the old way.",
    sections: [
      {
        heading: "Two-column comparison",
        body: [
          "Start from `SectionCards` (`src/components/section-cards.tsx`) and repurpose the four cards into a 'With / Without' layout by swapping icons and text.",
        ],
        references: [
          { title: "Section cards", path: "src/components/section-cards.tsx" },
        ],
      },
    ],
  },
  "features-listicle": {
    title: "Features listicle",
    description:
      "Tile-style feature blurbs leverage the shared Card + Badge primitives so the page stays cohesive.",
    sections: [
      {
        heading: "Card grid",
        body: [
          "Reuse the list component in `src/components/marketing/home/about-section.tsx` or `SectionCards` to showcase 3–4 punchy benefits.",
        ],
        references: [
          { title: "About section", path: "src/components/marketing/home/about-section.tsx" },
        ],
      },
    ],
  },
  "features-accordion": {
    title: "Features accordion",
    description:
      "Radix UI's accordion is already wrapped for you under `src/components/ui/accordion.tsx`.",
    sections: [
      {
        heading: "Usage",
        body: [
          "Import `{ Accordion, AccordionItem, AccordionTrigger, AccordionContent }` and feed it data from your pricing or feature arrays.",
        ],
        references: [
          { title: "Accordion primitive", path: "src/components/ui/accordion.tsx" },
        ],
      },
    ],
  },
  "features-grid": {
    title: "Features grid",
    description:
      "The About section demonstrates a responsive grid of icon + text pairs that you can drop anywhere.",
    sections: [
      {
        heading: "Responsive behaviour",
        body: [
          "`src/components/marketing/home/about-section.tsx` uses CSS grid with `md:grid-cols-2` to stay readable on phones and desktops.",
        ],
        references: [
          { title: "About section", path: "src/components/marketing/home/about-section.tsx" },
        ],
      },
    ],
  },
  cta: {
    title: "CTA",
    description:
      "The CTA section already ships with gradient background, badges, and dual buttons.",
    sections: [
      {
        heading: "Component",
        body: [
          "See `src/components/marketing/home/cta-section.tsx`. Swap the button `href`s or copy block to create pricing, docs, or newsletter CTAs.",
        ],
        references: [
          { title: "CTA component", path: "src/components/marketing/home/cta-section.tsx" },
        ],
      },
    ],
  },
  pricing: {
    title: "Pricing",
    description:
      "Plan cards mirror your Stripe configuration so marketing always matches the app.",
    sections: [
      {
        heading: "Component",
        body: [
          "`src/components/marketing/home/pricing-section.tsx` maps over `STRIPE_PLANS`, so any change to plan copy or price automatically refreshes the landing page.",
        ],
        references: [
          { title: "Pricing section", path: "src/components/marketing/home/pricing-section.tsx" },
          { title: "Stripe plans", path: "src/lib/stripe.ts" },
        ],
      },
    ],
  },
  blog: {
    title: "Blog",
    description:
      "Static markdown posts are rendered via the content layer inside `src/content/blog`.",
    sections: [
      {
        heading: "Content pipeline",
        body: [
          "Each `.md` file is parsed and displayed through the blog route. Drop new posts into `src/content/blog` and they appear automatically.",
        ],
        references: [
          { title: "Blog route", path: "src/app/blog/page.tsx" },
          { title: "Blog content", path: "src/content/blog" },
        ],
      },
    ],
  },
  faq: {
    title: "FAQ",
    description:
      "The FAQ page demonstrates how to lay out common questions with semantic headings and open graph metadata.",
    sections: [
      {
        heading: "Modify Q&A",
        body: [
          "Edit `src/app/faq/page.tsx` to add or remove questions. It already uses the documentation typography classes, so everything stays legible.",
        ],
        references: [
          { title: "FAQ route", path: "src/app/faq/page.tsx" },
        ],
      },
    ],
  },
  "testimonial-small": {
    title: "Testimonial (Small)",
    description:
      "Use the compact testimonial cards from the marketing page for logos or quotes.",
    sections: [
      {
        heading: "Component",
        body: [
          "`src/components/marketing/home/testimonials-section.tsx` includes both carousel-style quotes and smaller cards—pick the pieces you need.",
        ],
        references: [
          { title: "Testimonials section", path: "src/components/marketing/home/testimonials-section.tsx" },
        ],
      },
    ],
  },
  "testimonial-single": {
    title: "Testimonial (Single)",
    description:
      "Lift a single quote block with author avatar from the same testimonial section for case-study style layouts.",
    sections: [
      {
        heading: "Usage",
        body: [
          "Copy one item from the testimonials array and render it on its own for a hero-proof moment.",
        ],
        references: [
          { title: "Testimonials data", path: "src/components/marketing/home/testimonials-section.tsx" },
        ],
      },
    ],
  },
  "testimonial-triple": {
    title: "Testimonial (Triple)",
    description:
      "The grid layout supports three-up testimonials to showcase breadth across industries.",
    sections: [
      {
        heading: "Layout",
        body: [
          "Reuse the `grid gap-6 md:grid-cols-3` markup inside the testimonial section to render three cards per row.",
        ],
        references: [
          { title: "Testimonials grid", path: "src/components/marketing/home/testimonials-section.tsx" },
        ],
      },
    ],
  },
  "testimonial-grid": {
    title: "Testimonial (Grid)",
    description:
      "For longer testimonials, duplicate the responsive grid and feed it more entries from your CMS.",
    sections: [
      {
        heading: "Scaling up",
        body: [
          "Because the component maps over an array, you can add as many entries as you like and the grid will flow naturally.",
        ],
        references: [
          { title: "Testimonials section", path: "src/components/marketing/home/testimonials-section.tsx" },
        ],
      },
    ],
  },
  footer: {
    title: "Footer",
    description:
      "A gradient-heavy footer with columns for Product, Company, and Legal is ready to drop into any marketing page.",
    sections: [
      {
        heading: "Component",
        body: [
          "Edit the `footerLinks` object in `src/components/common/footer.tsx` to expose new docs, support, or legal pages.",
        ],
        references: [
          { title: "Footer component", path: "src/components/common/footer.tsx" },
        ],
      },
    ],
  },
  "button-lead": {
    title: "Button – Lead",
    description:
      "Primary CTAs share the same gradient and hover states thanks to the `buttonVariants` helper.",
    sections: [
      {
        heading: "Usage",
        body: [
          "Import `{ Button }` from `src/components/ui/button.tsx` and use the default variant for hero and CTA buttons.",
        ],
        references: [
          { title: "Button primitive", path: "src/components/ui/button.tsx" },
        ],
      },
    ],
  },
  "button-checkout": {
    title: "Button – Checkout",
    description:
      "Billing buttons rely on the `Button` component plus inline icons to communicate plan upgrades.",
    sections: [
      {
        heading: "Example",
        body: [
          "`src/app/dashboard/billing/page.tsx` shows how to pair the button with Stripe checkout routes and loading states.",
        ],
        references: [
          { title: "Billing buttons", path: "src/app/dashboard/billing/page.tsx" },
        ],
      },
    ],
  },
  "button-sign-in": {
    title: "Button – Sign-in",
    description:
      "Auth forms demonstrate secondary button styles with provider icons.",
    sections: [
      {
        heading: "Implementation",
        body: [
          "See the Google button inside `src/components/auth/login-form.tsx` which combines the outline variant with Tabler icons.",
        ],
        references: [
          { title: "Login form", path: "src/components/auth/login-form.tsx" },
        ],
      },
    ],
  },
  "button-account": {
    title: "Button – Account",
    description:
      "The user avatar menu in the dashboard uses ghost buttons plus dropdowns for settings and sign out.",
    sections: [
      {
        heading: "Component",
        body: [
          "`src/components/nav-user.tsx` renders the account button and dropdown items; swap icons or routes to match your product.",
        ],
        references: [
          { title: "User nav", path: "src/components/nav-user.tsx" },
        ],
      },
    ],
  },
  "button-gradient": {
    title: "Button – Gradient",
    description:
      "Gradient buttons appear in the hero CTA by layering utility classes on top of the base component.",
    sections: [
      {
        heading: "Styling",
        body: [
          "Use `buttonVariants({ variant: \"default\" })` and apply `bg-gradient-to-r` classes, as shown in the hero component.",
        ],
        references: [
          { title: "Hero CTA", path: "src/components/marketing/home/hero-section.tsx" },
        ],
      },
    ],
  },
  "button-popover": {
    title: "Button – Popover",
    description:
      "Combine buttons with the dropdown menu or dialog primitives to create popovers.",
    sections: [
      {
        heading: "Dropdown example",
        body: [
          "`src/components/ui/dropdown-menu.tsx` wraps the Radix dropdown; pair it with a button trigger to replicate ShipFast's popover CTAs.",
        ],
        references: [
          { title: "Dropdown primitive", path: "src/components/ui/dropdown-menu.tsx" },
        ],
      },
    ],
  },
  "better-icon": {
    title: "Better Icon",
    description:
      "Tabler and Lucide icons are both available. Swap them globally by adjusting imports.",
    sections: [
      {
        heading: "Icon strategy",
        body: [
          "Most marketing components import from `@tabler/icons-react`, while dashboard UI grabs from `lucide-react`. Keep things consistent by defining your preferred set in each component.",
        ],
        references: [
          { title: "Hero icons", path: "src/components/marketing/home/hero-section.tsx" },
          { title: "Dashboard icons", path: "src/components/nav-main.tsx" },
        ],
      },
    ],
  },
  tabs: {
    title: "Tabs",
    description:
      "Radix Tabs are wrapped in `src/components/ui/tabs.tsx`, giving you a fully styled tablist.",
    sections: [
      {
        heading: "Usage",
        body: [
          "Import `{ Tabs, TabsList, TabsTrigger, TabsContent }` and feed them plan or feature data, similar to how the billing page swaps detail panels.",
        ],
        references: [
          { title: "Tabs primitive", path: "src/components/ui/tabs.tsx" },
        ],
      },
    ],
  },
  rating: {
    title: "Rating",
    description:
      "A formal rating component isn't required, but you can build one quickly with badges and Tabler icons.",
    sections: [
      {
        heading: "Suggested approach",
        body: [
          "Compose a badge + icon row inside `SectionCards` or testimonials to display review scores. The design tokens already provide the subtle background you need.",
        ],
        references: [
          { title: "Section cards", path: "src/components/section-cards.tsx" },
        ],
      },
    ],
  },
  modal: {
    title: "Modal",
    description:
      "Dialogs run on Radix primitives wrapped inside `src/components/ui/dialog.tsx`.",
    sections: [
      {
        heading: "Usage",
        body: [
          "Import the dialog components and nest your own forms or call-to-action content. The password-update dialog in the dashboard is a working example.",
        ],
        references: [
          { title: "Dialog primitive", path: "src/components/ui/dialog.tsx" },
          { title: "Password modal", path: "src/components/dashboard/password-update-dialog.tsx" },
        ],
      },
    ],
  },
};
