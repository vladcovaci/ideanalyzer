import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { ensureStripe, getPlanByPriceId } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import {
  sendSubscriptionConfirmationEmail,
  sendSubscriptionCanceledEmail,
  sendAdminSubscriptionNotification,
} from "@/lib/email";

type SubscriptionWithMeta = Stripe.Subscription & {
  current_period_start?: number;
  current_period_end?: number;
  trial_start?: number | null;
  trial_end?: number | null;
  billing_cycle_anchor?: number | null;
  canceled_at?: number | null;
};

type SubscriptionItemWithPeriod = Stripe.SubscriptionItem & {
  current_period_start?: number;
  current_period_end?: number;
};

function extractPeriodData(subscription: Stripe.Subscription) {
  const extendedSubscription = subscription as SubscriptionWithMeta;
  const subscriptionItem = subscription.items.data[0] as
    | SubscriptionItemWithPeriod
    | undefined;

  const currentPeriodStart =
    subscriptionItem?.current_period_start ??
    extendedSubscription.current_period_start ??
    extendedSubscription.trial_start ??
    extendedSubscription.created;

  const currentPeriodEnd =
    subscriptionItem?.current_period_end ??
    extendedSubscription.current_period_end ??
    extendedSubscription.trial_end ??
    extendedSubscription.billing_cycle_anchor ??
    extendedSubscription.created;

  return {
    currentPeriodStart,
    currentPeriodEnd,
    trialStart: extendedSubscription.trial_start ?? null,
    trialEnd: extendedSubscription.trial_end ?? null,
    canceledAt: extendedSubscription.canceled_at ?? null,
  };
}

export async function POST(req: Request) {
  try {
    const stripeClient = ensureStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripeClient.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutSessionCompleted(session);
          break;
        }

        case "customer.subscription.created": {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionCreated(subscription);
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionUpdated(subscription);
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionDeleted(subscription);
          break;
        }

        case "invoice.payment_succeeded": {
          const invoice = event.data.object as Stripe.Invoice;
          await handleInvoicePaymentSucceeded(invoice, stripeClient);
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          await handleInvoicePaymentFailed(invoice);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error("Webhook handler error:", error);
      return NextResponse.json(
        { error: "Webhook handler failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error("No userId in checkout session metadata");
    return;
  }

  // Update user with customer ID if not already set
  if (session.customer) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: session.customer as string,
      },
    });
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error("User not found for customer:", customerId);
    return;
  }

  // Get plan configuration
  const plan = getPlanByPriceId(priceId);
  const planId = plan?.id || "unknown";

  const { currentPeriodStart, currentPeriodEnd, trialStart, trialEnd } = extractPeriodData(subscription);

  // Update user subscription info
  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
    },
  });

  // Create subscription record
  await prisma.subscription.create({
    data: {
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeProductId: subscription.items.data[0]?.price.product as string,
      status: subscription.status,
      plan: planId,
      currentPeriodStart: new Date(currentPeriodStart * 1000),
      currentPeriodEnd: new Date(currentPeriodEnd * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialStart: trialStart ? new Date(trialStart * 1000) : null,
      trialEnd: trialEnd ? new Date(trialEnd * 1000) : null,
    },
  });

  // Send confirmation email
  if (user.email) {
    await sendSubscriptionConfirmationEmail(
      user.email,
      user.name || "there",
      plan?.name || "Unknown Plan",
      new Date(currentPeriodEnd * 1000)
    );

    // Send admin notification
    const action = subscription.status === "trialing" ? "trial" : "created";
    const amount = subscription.items.data[0]?.price.unit_amount || 0;
    await sendAdminSubscriptionNotification(
      user.email,
      user.name || "Unknown User",
      plan?.name || "Unknown Plan",
      amount,
      action
    );
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error("User not found for customer:", customerId);
    return;
  }

  // Get old subscription record to detect plan changes
  const oldSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  // Get plan configuration
  const plan = getPlanByPriceId(priceId);
  const planId = plan?.id || "unknown";

  const { currentPeriodStart, currentPeriodEnd, trialStart, trialEnd, canceledAt } = extractPeriodData(subscription);

  // Update user subscription info
  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
    },
  });

  // Update subscription record
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      stripePriceId: priceId,
      stripeProductId: subscription.items.data[0]?.price.product as string,
      status: subscription.status,
      plan: planId,
      currentPeriodStart: new Date(currentPeriodStart * 1000),
      currentPeriodEnd: new Date(currentPeriodEnd * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: canceledAt ? new Date(canceledAt * 1000) : null,
      trialStart: trialStart ? new Date(trialStart * 1000) : null,
      trialEnd: trialEnd ? new Date(trialEnd * 1000) : null,
    },
  });

  // Send admin notification if plan changed
  if (oldSubscription && oldSubscription.stripePriceId !== priceId && user.email) {
    const planHierarchy: Record<string, number> = {
      free: 0,
      starter: 1,
      growth: 2,
      scale: 3,
    };

    const oldPlanLevel = planHierarchy[oldSubscription.plan.toLowerCase()] || 0;
    const newPlanLevel = planHierarchy[planId.toLowerCase()] || 0;

    let action: "upgraded" | "downgraded" = "upgraded";
    if (newPlanLevel < oldPlanLevel) {
      action = "downgraded";
    }

    const amount = subscription.items.data[0]?.price.unit_amount || 0;
    await sendAdminSubscriptionNotification(
      user.email,
      user.name || "Unknown User",
      plan?.name || "Unknown Plan",
      amount,
      action
    );
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error("User not found for customer:", customerId);
    return;
  }

  const { currentPeriodEnd } = extractPeriodData(subscription);

  // Update user - remove subscription info
  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
    },
  });

  // Update subscription record
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: "canceled",
      canceledAt: new Date(),
    },
  });

  // Send cancellation email
  if (user.email) {
    await sendSubscriptionCanceledEmail(
      user.email,
      user.name || "there",
      new Date(currentPeriodEnd * 1000)
    );
  }
}

async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
  stripe: Stripe
) {
  // Type assertion for invoice subscription property
  const invoiceSub = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
  };
  const subscriptionId =
    typeof invoiceSub.subscription === "string"
      ? invoiceSub.subscription
      : invoiceSub.subscription?.id || null;

  if (!subscriptionId) {
    return;
  }

  // Get subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const { currentPeriodStart, currentPeriodEnd } = extractPeriodData(subscription);

  // Update subscription record with new period
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      currentPeriodStart: new Date(currentPeriodStart * 1000),
      currentPeriodEnd: new Date(currentPeriodEnd * 1000),
      status: subscription.status,
    },
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user || !user.email) {
    return;
  }

  // TODO: Send payment failed email notification
  console.log("Payment failed for user:", user.email);
}
