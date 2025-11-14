import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocPageContent } from "@/components/documentation/doc-page";
import { featureDocs } from "@/content/documentation/features";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(featureDocs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = featureDocs[slug];
  if (!page) return {};
  return {
    title: `${page.title} | Features`,
    description: page.description,
  };
}

export default async function FeatureDocPage({ params }: Props) {
  const { slug } = await params;
  const page = featureDocs[slug];
  if (!page) {
    notFound();
  }

  return <DocPageContent page={page} />;
}
