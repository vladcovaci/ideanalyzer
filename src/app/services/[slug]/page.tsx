import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { services, getServiceBySlug } from "@/constants/services";
import { buildPageMetadata, absoluteUrl, ogImageUrl } from "@/lib/metadata";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service Not Found",
    };
  }

  const pageUrl = absoluteUrl(`/services/${service.slug}`);
  const imageUrl = ogImageUrl();

  return {
    ...buildPageMetadata({
      title: service.title,
      description: service.description,
      path: `/services/${service.slug}`,
    }),
    openGraph: {
      title: service.title,
      description: service.description,
      type: "website",
      url: pageUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: service.title,
        },
      ],
    },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const pageUrl = absoluteUrl(`/services/${service.slug}`);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    url: pageUrl,
    description: service.description,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    serviceType: service.category,
    areaServed: "Worldwide",
    offers: {
      "@type": "Offer",
      price: service.pricing.starting.replace("$", "").replace(",", ""),
      priceCurrency: "USD",
      description: service.pricing.model,
    },
  };

  const getIconSvg = (icon: string) => {
    const icons: Record<string, ReactElement> = {
      palette: (
        <svg
          className="h-8 w-8"
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
          className="h-8 w-8"
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
          className="h-8 w-8"
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
          className="h-8 w-8"
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
          className="h-8 w-8"
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
          className="h-8 w-8"
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Section className="!mt-0 mx-auto max-w-4xl">
        <Link
          href="/services"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to services
        </Link>

        <div className="mb-8 flex items-start gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {getIconSvg(service.icon)}
          </div>
          <div className="flex-1">
            <span className="mb-2 inline-block text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {service.category}
            </span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              {service.title}
            </h1>
            <p className="text-lg text-muted-foreground">{service.description}</p>
          </div>
        </div>

        <div className="mb-12 grid gap-6 rounded-3xl border border-border bg-card p-8 md:grid-cols-3">
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              Starting Price
            </h3>
            <p className="text-2xl font-bold">{service.pricing.starting}</p>
            <p className="text-sm text-muted-foreground">{service.pricing.model}</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              Delivery Time
            </h3>
            <p className="text-2xl font-bold">{service.deliveryTime}</p>
            <p className="text-sm text-muted-foreground">Typical timeline</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              Category
            </h3>
            <p className="text-2xl font-bold">{service.category}</p>
            <p className="text-sm text-muted-foreground">Service type</p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">What&apos;s Included</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {service.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-6"
              >
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-card p-8 text-center md:p-12">
          <h3 className="text-2xl font-semibold">Ready to get started?</h3>
          <p className="max-w-2xl text-muted-foreground">
            Book a free consultation to discuss your project requirements and get a
            detailed proposal with timeline and pricing.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/contact">Book consultation</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/services">View all services</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
