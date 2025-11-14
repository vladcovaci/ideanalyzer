export type ContactMethod = {
  icon: string;
  label: string;
  value: string;
  href: string;
  description: string;
};

export const contactMethods: ContactMethod[] = [
  {
    icon: "mail",
    label: "Lorem",
    value: "hello@lorem.test",
    href: "mailto:hello@lorem.test",
    description: "Lorem ipsum dolor sit amet consectetur adipiscing elit.",
  },
  {
    icon: "twitter",
    label: "Ipsum",
    value: "@loremipsum",
    href: "https://twitter.com/loremipsum",
    description: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    icon: "github",
    label: "Dolor",
    value: "github.com/lorem/ipsum",
    href: "https://github.com/lorem/ipsum",
    description: "Ut enim ad minim veniam quis nostrud exercitation ullamco laboris.",
  },
];

export const supportInfo = {
  responseTime: "24 horas",
  availability: "Lorem - Ipsum",
  languages: ["Lorem"],
};
