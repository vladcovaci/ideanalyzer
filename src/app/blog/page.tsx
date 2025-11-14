import Link from "next/link";
import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/ui/section";
import { blogPosts } from "@/constants/blog";
import { buildPageMetadata, absoluteUrl, ogImageUrl } from "@/lib/metadata";
import { siteConfig } from "@/config/site";

const description =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt.";

export const metadata = buildPageMetadata({
  title: "Blog",
  description,
  path: "/blog",
});

export default function BlogPage() {
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Lorem Ipsum Blog",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt.",
    url: absoluteUrl("/blog"),
    image: ogImageUrl(),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <PageHero
        eyebrow="Lorem"
        title="Lorem ipsum dolor sit amet."
        description="Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      />
      <Section className="!mt-0">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="flex flex-1 flex-col p-8">
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
                <h2 className="mb-3 text-xl font-semibold group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="mb-4 flex-1 text-sm text-muted-foreground">
                  {post.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{post.author}</span>
                  <span>{post.readingTime}</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
