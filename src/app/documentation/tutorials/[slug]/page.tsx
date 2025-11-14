import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocPageContent } from "@/components/documentation/doc-page";
import { tutorialDocs } from "@/content/documentation/tutorials";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(tutorialDocs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = tutorialDocs[slug];
  if (!page) return {};
  return {
    title: `${page.title} | Tutorials`,
    description: page.description,
  };
}

export default async function TutorialDocPage({ params }: Props) {
  const { slug } = await params;
  const page = tutorialDocs[slug];
  if (!page) {
    notFound();
  }

  return <DocPageContent page={page} />;
}
