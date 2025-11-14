import Link from "next/link";
import type { ReactElement } from "react";
import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/ui/section";
import { CtaSection } from "@/components/marketing/home/cta-section";
import { services } from "@/constants/services";
import { buildPageMetadata, absoluteUrl } from "@/lib/metadata";
import { siteConfig } from "@/config/site";

const description =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.";

export const metadata = buildPageMetadata({
  title: "Services",
  description,
  path: "/services",
});

export default function ServicesPage() {
  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: siteConfig.name,
    url: absoluteUrl("/services"),
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    serviceType: "Lorem Services",
    areaServed: "Lorem Ipsum",
  };

  const getIconSvg = (icon: string) => {
    const icons: Record<string, ReactElement> = {
      palette: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      ),
      database: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
      ),
      cloud: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
          />
        </svg>
      ),
      code: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
      search: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      wrench: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    };
    return icons[icon] || icons.code;
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />
      <PageHero
        eyebrow="Lorem"
        title="Lorem ipsum dolor sit amet."
        description="Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      />
      <Section className="!mt-0 !pb-0">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group flex flex-col rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {getIconSvg(service.icon)}
              </div>
              <span className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {service.category}
              </span>
              <h2 className="mb-3 text-xl font-semibold group-hover:text-primary transition-colors">
                {service.title}
              </h2>
              <p className="mb-4 flex-1 text-sm text-muted-foreground">
                {service.description}
              </p>
              <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
                <div>
                  <span className="font-semibold text-foreground">
                    {service.pricing.starting}
                  </span>
                  <span className="text-muted-foreground"> starting</span>
                </div>
                <span className="text-muted-foreground">
                  {service.deliveryTime}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Section>
      <div className="mb-12 md:mb-20">
        <CtaSection
          title="Lorem ipsum dolor sit amet?"
          description="Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip."
          primaryCta={{ href: "/contact", label: "Lorem call" }}
          secondaryCta={{ href: "/pricing", label: "Ipsum pricing" }}
        />
      </div>
    </>
  );
}
