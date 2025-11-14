import { DocPageContent } from "@/components/documentation/doc-page";
import type { DocPage } from "@/content/documentation/types";

const extrasDoc: DocPage = {
  title: "Extras",
  description:
    "Little touches that make StartupKit feel like a polished product once you unzip it—dev tools, helper scripts, and marketing polish.",
  sections: [
    {
      heading: "Dev tools",
      body: [
        "The `/dev-tools` route lets you verify emails, inspect environment variables, and remind yourself which services still need API keys.",
      ],
      references: [{ title: "Dev tools page", path: "src/app/dev-tools/page.tsx" }],
    },
    {
      heading: "Reference guides",
      body: [
        "Keep `AUTH_SETUP.md`, `STRIPE_SETUP.md`, and `DEVELOPMENT.md` alongside the docs so your customers can follow along offline.",
      ],
      references: [
        { title: "Auth setup", path: "AUTH_SETUP.md" },
        { title: "Stripe setup", path: "STRIPE_SETUP.md" },
        { title: "Development overview", path: "DEVELOPMENT.md" },
      ],
    },
    {
      heading: "Marketing collateral",
      body: [
        "Open `src/public/og.png` or drop your own assets in the `public` folder. Because the metadata helper references `siteConfig.ogImage`, every page inherits the updated preview image.",
      ],
      references: [
        { title: "OG image", path: "public/og.png" },
        { title: "Site config", path: "src/config/site.ts" },
      ],
    },
  ],
};

export default function ExtrasPage() {
  return <DocPageContent page={extrasDoc} />;
}
