export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  author: string;
  tags: string[];
  readingTime: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "launch-faster-with-a-saas-boilerplate",
    title: "Lorem Ipsum Dolor",
    description:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.",
    publishedAt: "2024-10-01",
    author: "Lorem Ipsum",
    tags: ["Lorem", "Ipsum"],
    readingTime: "6 min read",
  },
  {
    slug: "connecting-stripe-and-resend-in-minutes",
    title: "Consectetur Adipiscing",
    description:
      "Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    publishedAt: "2024-09-19",
    author: "Dolor Sit",
    tags: ["Dolor", "Sit"],
    readingTime: "5 min read",
  },
  {
    slug: "seo-checklist-for-your-next-launch",
    title: "Elit Sed Do",
    description:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    publishedAt: "2024-08-25",
    author: "Amet Consectetur",
    tags: ["Elit", "Sed"],
    readingTime: "7 min read",
  },
];

export function getPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
