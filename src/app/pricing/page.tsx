import { PageHero } from "@/components/common/page-hero";
import { PricingSection } from "@/components/marketing/home/pricing-section";
import { CtaSection } from "@/components/marketing/home/cta-section";
import { pricingPlans } from "@/constants/pricing";
import { buildPageMetadata, absoluteUrl, ogImageUrl } from "@/lib/metadata";
import { siteConfig } from "@/config/site";

const description =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt.";

export const metadata = buildPageMetadata({
  title: "Pricing",
  description,
  path: "/pricing",
});

export default function PricingPage() {
  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: siteConfig.name,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    url: absoluteUrl("/pricing"),
    image: ogImageUrl(),
    offers: pricingPlans.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      price: plan.price.replace("$", ""),
      priceCurrency: "USD",
      description: plan.description,
      url: plan.stripeLink,
      availability: "https://schema.org/InStock",
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />
      <PageHero
        eyebrow="Lorem"
        title="Lorem ipsum dolor sit amet."
        description="Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      />
      <PricingSection showHeader={false} />
      <CtaSection
        title="Lorem ipsum dolor sit amet."
        description="Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        primaryCta={{ href: "/register", label: "Lorem ipsum" }}
        secondaryCta={{ href: "/pricing", label: "Dolor sit" }}
      />
      <div className="mb-12 md:mb-20">
        <CtaSection
          variant="accent"
          title="Consectetur adipiscing elit."
          description="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore."
          primaryCta={{ href: "/contact", label: "Lorem call" }}
          secondaryCta={{ href: "/about", label: "Ipsum team" }}
        />
      </div>
    </>
  );
}
