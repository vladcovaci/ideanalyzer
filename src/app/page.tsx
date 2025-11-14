import type { Metadata } from "next";
import { HeroSection } from "@/components/marketing/home/hero-section";
import { AboutSection } from "@/components/marketing/home/about-section";
import { HowItWorksSection } from "@/components/marketing/home/how-it-works-section";
import { WhyUsSection } from "@/components/marketing/home/why-us-section";
import { PricingSection } from "@/components/marketing/home/pricing-section";
import { CtaSection } from "@/components/marketing/home/cta-section";
import { TestimonialsSection } from "@/components/marketing/home/testimonials-section";

export const metadata: Metadata = {
  title: "Lorem ipsum dolor sit amet",
  description:
    "Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
};

export default function HomePage() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "StartupKit",
    url: "https://startupkit.today",
    logo: "https://startupkit.today/og.png",
    sameAs: [
      "https://github.com/yourname/startupkit",
      "https://twitter.com/startupkit",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <HeroSection />
      <AboutSection />
      <HowItWorksSection />
      <WhyUsSection />
      <TestimonialsSection />
      <PricingSection showHeader={false} />
      <CtaSection
        title="Lorem ipsum dolor sit amet."
        description="Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam."
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
