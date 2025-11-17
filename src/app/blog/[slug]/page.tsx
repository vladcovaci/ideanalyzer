import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { blogPosts, getPostBySlug } from "@/constants/blog";
import { getBlogPostContent } from "@/lib/blog";
import { MarkdownRenderer } from "@/components/common/markdown";
import { buildPageMetadata, absoluteUrl, ogImageUrl } from "@/lib/metadata";
import { siteConfig } from "@/config/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const pageUrl = absoluteUrl(`/blog/${post.slug}`);
  const imageUrl = ogImageUrl();
  const baseMetadata = buildPageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
  });

  return {
    ...baseMetadata,
    openGraph: {
      ...(baseMetadata.openGraph ?? {}),
      type: "article",
      url: pageUrl,
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      ...(baseMetadata.twitter ?? {}),
      images: [imageUrl],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const contentTokens = await getBlogPostContent(slug);
  const pageUrl = absoluteUrl(`/blog/${post.slug}`);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    image: ogImageUrl(),
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    keywords: post.tags.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Section className="!mt-0 mx-auto max-w-3xl">
        <Link
          href="/blog"
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
          Back to blog
        </Link>

        <article>
          <header className="mb-8">
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              {post.title}
            </h1>
            <p className="mb-6 text-lg text-muted-foreground">
              {post.description}
            </p>
            <div className="flex items-center justify-between border-y border-border py-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="font-medium text-foreground">
                  {post.author}
                </span>
                <span>•</span>
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
              <span>{post.readingTime}</span>
            </div>
          </header>

          <div className="markdown">
            <MarkdownRenderer tokens={contentTokens} />
          </div>
        </article>

        <div className="mt-12 flex flex-col items-center gap-6 rounded-3xl border border-border bg-card p-8 text-center">
          <h3 className="text-2xl font-semibold">
            Lorem ipsum dolor sit amet?
          </h3>
          <p className="text-muted-foreground">
            Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/pricing">View pricing</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/faq">Contact us</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
