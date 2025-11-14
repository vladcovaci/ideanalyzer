import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/ui/section";
import { CtaSection } from "@/components/marketing/home/cta-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems } from "@/constants/faq";
import { buildPageMetadata } from "@/lib/metadata";

const description =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt.";

export const metadata = buildPageMetadata({
  title: "FAQ",
  description,
  path: "/faq",
});

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PageHero
        eyebrow="Lorem"
        title="Lorem ipsum dolor sit amet?"
        description="Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      />
      <Section className="!mt-0 !pb-0">
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-base font-semibold">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>
      <div className="mb-12 md:mb-20">
        <CtaSection
          title="Still have questions?"
          description="Our team is here to help. Reach out and we'll get back to you within 24 hours."
          primaryCta={{ href: "/contact", label: "Contact support" }}
          secondaryCta={{ href: "/pricing", label: "View pricing" }}
        />
      </div>
    </>
  );
}
