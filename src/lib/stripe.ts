import Stripe from "stripe";

// Initialize Stripe only if API key is available
// This allows the app to build/run without Stripe configured (useful for development)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
      typescript: true,
    })
  : null;

// Helper to ensure Stripe is configured
export function ensureStripe(): Stripe {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables."
    );
  }
  return stripe;
}

// Stripe subscription plans configuration
// Replace these with your actual Stripe Price IDs from your Stripe Dashboard
export const STRIPE_PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    description: "Perfect for trying out our platform",
    price: 0,
    priceId: null, // Free plan doesn't have a Stripe Price ID
    trialDays: 0,
    features: {
      apiCalls: 100,
      storage: 1, // GB
      projects: 1,
      teamMembers: 1,
    },
    enabledFeatures: {
      dashboard: true,
      analytics: false,
      projects: false,
      team: false,
      advancedAnalytics: false,
      prioritySupport: false,
      customBranding: false,
      apiAccess: false,
      webhooks: false,
      sso: false,
    },
  },
  STARTER: {
    id: "starter",
    name: "Starter",
    description: "For side projects and early validations",
    price: 29,
    priceId: process.env.STRIPE_STARTER_PRICE_ID || "price_starter_placeholder",
    productId: process.env.STRIPE_STARTER_PRODUCT_ID,
    trialDays: parseInt(process.env.STRIPE_TRIAL_PERIOD_DAYS || "14"),
    features: {
      apiCalls: 10000,
      storage: 10, // GB
      projects: 5,
      teamMembers: 3,
    },
    enabledFeatures: {
      dashboard: true,
      analytics: true,
      projects: true,
      team: false,
      advancedAnalytics: false,
      prioritySupport: false,
      customBranding: false,
      apiAccess: true,
      webhooks: false,
      sso: false,
    },
  },
  GROWTH: {
    id: "growth",
    name: "Growth",
    description: "For growing teams shipping new features",
    price: 79,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID || "price_growth_placeholder",
    productId: process.env.STRIPE_GROWTH_PRODUCT_ID,
    trialDays: parseInt(process.env.STRIPE_TRIAL_PERIOD_DAYS || "14"),
    features: {
      apiCalls: 100000,
      storage: 100, // GB
      projects: 20,
      teamMembers: 10,
    },
    enabledFeatures: {
      dashboard: true,
      analytics: true,
      projects: true,
      team: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: false,
      apiAccess: true,
      webhooks: true,
      sso: false,
    },
  },
  SCALE: {
    id: "scale",
    name: "Scale",
    description: "For enterprises with custom needs",
    price: 149,
    priceId: process.env.STRIPE_SCALE_PRICE_ID || "price_scale_placeholder",
    productId: process.env.STRIPE_SCALE_PRODUCT_ID,
    trialDays: parseInt(process.env.STRIPE_TRIAL_PERIOD_DAYS || "14"),
    features: {
      apiCalls: -1, // unlimited
      storage: -1, // unlimited
      projects: -1, // unlimited
      teamMembers: -1, // unlimited
    },
    enabledFeatures: {
      dashboard: true,
      analytics: true,
      projects: true,
      team: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true,
      webhooks: true,
      sso: true,
    },
  },
} as const;

// Helper to get plan by price ID
export function getPlanByPriceId(priceId: string) {
  return Object.values(STRIPE_PLANS).find((plan) => plan.priceId === priceId);
}

// Helper to get plan by ID
export function getPlanById(planId: string) {
  return Object.values(STRIPE_PLANS).find(
    (plan) => plan.id.toLowerCase() === planId.toLowerCase()
  );
}

// Helper to check if user has access to a feature (usage-based)
export function hasFeatureAccess(
  plan: keyof typeof STRIPE_PLANS,
  feature: keyof (typeof STRIPE_PLANS)["FREE"]["features"],
  currentUsage: number
): boolean {
  const planConfig = STRIPE_PLANS[plan];
  const limit = planConfig.features[feature];

  // -1 means unlimited
  if (limit === -1) return true;

  // Check if usage is within limit
  return currentUsage < limit;
}

// Helper to check if a feature is enabled for a plan
export function isPlanFeatureEnabled(
  plan: keyof typeof STRIPE_PLANS,
  feature: keyof (typeof STRIPE_PLANS)["FREE"]["enabledFeatures"]
): boolean {
  const planConfig = STRIPE_PLANS[plan];
  return planConfig.enabledFeatures[feature];
}

// Get the user's current plan based on subscription
export function getUserPlan(
  stripeSubscriptionId: string | null,
  stripePriceId: string | null
): keyof typeof STRIPE_PLANS {
  if (!stripeSubscriptionId || !stripePriceId) {
    return "FREE";
  }

  // Find plan by price ID
  const plan = getPlanByPriceId(stripePriceId);
  if (!plan) return "FREE";

  // Map plan ID to plan key
  const planKey = plan.id.toUpperCase() as keyof typeof STRIPE_PLANS;
  return STRIPE_PLANS[planKey] ? planKey : "FREE";
}

// Helper to get subscription status display
export function getSubscriptionStatusDisplay(
  status: Stripe.Subscription.Status
): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  description: string;
} {
  switch (status) {
    case "active":
      return {
        label: "Active",
        variant: "default",
        description: "Your subscription is active and all features are available.",
      };
    case "trialing":
      return {
        label: "Trial",
        variant: "secondary",
        description: "You're currently in your trial period.",
      };
    case "past_due":
      return {
        label: "Past Due",
        variant: "destructive",
        description:
          "Payment failed. Please update your payment method to continue service.",
      };
    case "canceled":
      return {
        label: "Canceled",
        variant: "outline",
        description: "Your subscription has been canceled.",
      };
    case "unpaid":
      return {
        label: "Unpaid",
        variant: "destructive",
        description:
          "Payment failed multiple times. Your subscription will be canceled soon.",
      };
    case "incomplete":
      return {
        label: "Incomplete",
        variant: "outline",
        description: "Payment is being processed.",
      };
    case "incomplete_expired":
      return {
        label: "Expired",
        variant: "destructive",
        description: "Payment was not completed in time.",
      };
    case "paused":
      return {
        label: "Paused",
        variant: "outline",
        description: "Your subscription is temporarily paused.",
      };
    default:
      return {
        label: "Unknown",
        variant: "outline",
        description: "Unknown subscription status.",
      };
  }
}

// Helper to check if subscription is active
export function isSubscriptionActive(
  status: Stripe.Subscription.Status
): boolean {
  return status === "active" || status === "trialing";
}

// Helper to format price
export function formatPrice(amount: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount);
}
