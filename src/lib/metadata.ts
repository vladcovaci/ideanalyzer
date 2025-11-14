import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export function absoluteUrl(path = ""): string {
  try {
    return new URL(path, siteConfig.url).toString();
  } catch {
    return siteConfig.url;
  }
}

export function ogImageUrl(): string {
  return absoluteUrl(siteConfig.ogImage);
}

type BuildPageMetadataArgs = {
  title: string;
  description: string;
  path: string;
};

export function buildPageMetadata({
  title,
  description,
  path,
}: BuildPageMetadataArgs): Metadata {
  const url = absoluteUrl(path);
  const image = ogImageUrl();

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  };
}
