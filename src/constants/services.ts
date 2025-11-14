export type Service = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  pricing: {
    starting: string;
    model: string;
  };
  deliveryTime: string;
  category: string;
};

export const services: Service[] = [
  {
    slug: "custom-design-integration",
    title: "Lorem Design Integration",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    icon: "palette",
    features: [
      "Lorem ipsum dolor sit amet",
      "Consectetur adipiscing elit",
      "Sed do eiusmod tempor",
      "Incididunt ut labore",
      "Dolore magna aliqua",
      "Ut enim ad minim veniam",
    ],
    pricing: {
      starting: "$2,500",
      model: "Lorem per project",
    },
    deliveryTime: "2-3 weeks",
    category: "Design & Development",
  },
  {
    slug: "cms-integration",
    title: "Dolor CMS Integration",
    description:
      "Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    icon: "database",
    features: [
      "Duis aute irure dolor",
      "In reprehenderit in voluptate",
      "Velit esse cillum dolore",
      "Eu fugiat nulla pariatur",
      "Excepteur sint occaecat",
      "Cupidatat non proident",
    ],
    pricing: {
      starting: "$3,000",
      model: "Dolor per CMS",
    },
    deliveryTime: "2-4 weeks",
    category: "Integrations",
  },
  {
    slug: "enterprise-deployment",
    title: "Consectetur Deployment",
    description:
      "Sunt in culpa qui officia deserunt mollit anim id est laborum sed ut perspiciatis unde omnis iste natus.",
    icon: "cloud",
    features: [
      "Totam rem aperiam",
      "Eaque ipsa quae ab illo",
      "Inventore veritatis quasi",
      "Architecto beatae vitae",
      "Dicta sunt explicabo",
      "Nemo enim ipsam voluptatem",
    ],
    pricing: {
      starting: "$5,000",
      model: "Lorem + retainer",
    },
    deliveryTime: "3-6 weeks",
    category: "Infrastructure",
  },
  {
    slug: "saas-feature-development",
    title: "Dolor Feature Development",
    description:
      "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet consectetur adipisci velit.",
    icon: "code",
    features: [
      "Quis autem vel eum iure",
      "Reprehenderit qui in ea",
      "Voluptate velit esse quam",
      "Molestiae consequatur vel",
      "Illum qui dolorem eum",
      "Fugiat quo voluptas nulla",
    ],
    pricing: {
      starting: "$4,000",
      model: "Lorem per feature",
    },
    deliveryTime: "3-5 weeks",
    category: "Development",
  },
  {
    slug: "seo-optimization",
    title: "Ipsum Optimization",
    description:
      "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum.",
    icon: "search",
    features: [
      "Et harum quidem rerum",
      "Facilis est et expedita",
      "Distinctio nam libero",
      "Tempore cum soluta",
      "Nobis est eligendi optio",
      "Cumque nihil impedit quo",
    ],
    pricing: {
      starting: "$1,500",
      model: "Lorem price",
    },
    deliveryTime: "1-2 weeks",
    category: "Marketing",
  },
  {
    slug: "ongoing-maintenance",
    title: "Lorem Maintenance",
    description:
      "Quis nostrum exercitationem ullam corporis suscipit laboriosam nisi ut aliquid ex ea commodi consequatur.",
    icon: "wrench",
    features: [
      "Quis autem vel eum iure",
      "Reprehenderit qui in ea",
      "Voluptate velit esse quam",
      "Molestiae consequatur vel",
      "Illum qui dolorem eum",
      "Fugiat quo voluptas nulla",
    ],
    pricing: {
      starting: "$500",
      model: "Monthly lorem",
    },
    deliveryTime: "Ongoing",
    category: "Support",
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}

export const serviceCategories = [
  "Design & Development",
  "Integrations",
  "Infrastructure",
  "Development",
  "Marketing",
  "Support",
];
