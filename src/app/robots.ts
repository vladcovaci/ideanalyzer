import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://demo.startupkit.today";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: [
          "GPTBot", // ChatGPT
          "ChatGPT-User", // ChatGPT
          "CCBot", // Common Crawl (used by various AI)
          "anthropic-ai", // Claude
          "Claude-Web", // Claude
          "PerplexityBot", // Perplexity
          "Google-Extended", // Google Bard/Gemini
        ],
        allow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
