import { PageHero } from "@/components/common/page-hero";
import { AboutSection } from "@/components/marketing/home/about-section";
import { CtaSection } from "@/components/marketing/home/cta-section";
import { Section, SectionHeader } from "@/components/ui/section";
import { buildPageMetadata, absoluteUrl } from "@/lib/metadata";
import { siteConfig } from "@/config/site";

const values = [
  {
    title: "Lorem ipsum",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.",
  },
  {
    title: "Dolor sit amet",
    description:
      "Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    title: "Consectetur elit",
    description:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
];

const description =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt.";

export const metadata = buildPageMetadata({
  title: "About us",
  description,
  path: "/about",
});

export default function AboutPage() {
  const teamSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "StartupKit",
    url: absoluteUrl("/about"),
    sameAs: [siteConfig.links.github],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(teamSchema) }}
      />
      <PageHero
        eyebrow="Lorem"
        title="Lorem ipsum dolor sit amet."
        description="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
      />
      <AboutSection />
      <Section className="bg-muted/30">
        <SectionHeader
          eyebrow="Lorem"
          title="Lorem ipsum dolor sit amet."
        />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-3xl border border-border bg-card p-8 shadow-sm"
            >
              <h3 className="text-xl font-semibold">{value.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </Section>
      <div className="mb-12 md:mb-20">
      <CtaSection
        title="Lorem ipsum dolor sit amet?"
        description="Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        primaryCta={{ href: "/contact", label: "Lorem team" }}
        secondaryCta={{ href: "/pricing", label: "Dolor pricing" }}
      />
      </div>
    </>
  );
}
