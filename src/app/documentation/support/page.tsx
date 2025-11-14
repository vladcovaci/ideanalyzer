import { DocPageContent } from "@/components/documentation/doc-page";
import type { DocPage } from "@/content/documentation/types";

const supportDoc: DocPage = {
  title: "Support",
  description:
    "Guide your own customers through the same support flows baked into StartupKit—contact forms, dashboards, and notification hooks.",
  sections: [
    {
      heading: "Dashboard intake",
      body: [
        "Users open `/dashboard/support` to file tickets via `SupportForm`. The component handles optimistic UI, validation, and toast feedback so you only have to wire the backend.",
      ],
      references: [
        { title: "Support form", path: "src/components/dashboard/support-form.tsx" },
      ],
    },
    {
      heading: "Server handling",
      body: [
        "`src/app/api/support/route.ts` currently logs payloads—swap in your favourite help desk API or send Resend emails to `ADMIN_EMAIL`.",
      ],
      references: [{ title: "Support API", path: "src/app/api/support/route.ts" }],
    },
    {
      heading: "Contact page",
      body: [
        "The marketing contact page mirrors the same fields (`src/app/contact/page.tsx`), so cold leads and paying customers both land in the same workflow.",
      ],
      references: [{ title: "Contact route", path: "src/app/contact/page.tsx" }],
    },
  ],
};

export default function SupportPage() {
  return <DocPageContent page={supportDoc} />;
}
