export type PricingPlan = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  stripeLink: string;
  stripePriceId: string;
  isPopular?: boolean;
  trialDays?: number;
  secondaryCta?: {
    label: string;
    href: string;
  };
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Lorem ipsum dolor sit amet consectetur adipiscing elit.",
    features: [
      "Lorem ipsum dolor sit amet",
      "Consectetur adipiscing elit",
      "Sed do eiusmod tempor",
      "Incididunt ut labore",
    ],
    stripeLink: "https://buy.stripe.com/test_fakesample",
    stripePriceId: "price_starter_placeholder",
    trialDays: 7,
  },
  {
    id: "growth",
    name: "Growth",
    price: "$79",
    period: "/month",
    description: "Ut enim ad minim veniam quis nostrud exercitation ullamco.",
    features: [
      "Everything in Starter",
      "Duis aute irure dolor",
      "In reprehenderit in voluptate",
      "Velit esse cillum dolore",
    ],
    stripeLink: "https://buy.stripe.com/test_fakesample",
    stripePriceId: "price_growth_placeholder",
    trialDays: 7,
    isPopular: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: "$149",
    period: "/month",
    description: "Excepteur sint occaecat cupidatat non proident sunt in culpa.",
    features: [
      "Everything in Growth",
      "Sed ut perspiciatis unde",
      "Omnis iste natus error",
      "Sit voluptatem accusantium",
    ],
    stripeLink: "https://buy.stripe.com/test_fakesample",
    stripePriceId: "price_scale_placeholder",
    trialDays: 7,
  },
];
