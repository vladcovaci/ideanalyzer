import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocPageContent } from "@/components/documentation/doc-page";
import { componentDocs } from "@/content/documentation/components";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(componentDocs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = componentDocs[slug];
  if (!page) return {};
  return {
    title: `${page.title} | Components`,
    description: page.description,
  };
}

export default async function ComponentDocPage({ params }: Props) {
  const { slug } = await params;
  const page = componentDocs[slug];
  if (!page) {
    notFound();
  }

  return <DocPageContent page={page} />;
}
