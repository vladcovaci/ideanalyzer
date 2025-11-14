import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe, STRIPE_PLANS, getPlanByPriceId } from "@/lib/stripe";
import { sendAdminSubscriptionNotification } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.stripeSubscriptionId || !stripe) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    // Get the plan details
    const plan = Object.values(STRIPE_PLANS).find((p) => p.id === planId);

    if (!plan || !plan.priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Get current subscription
    const currentSubscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );

    // Get old plan details
    const oldPriceId = currentSubscription.items.data[0]?.price.id;
    const oldPlan = getPlanByPriceId(oldPriceId);

    // Update the subscription with the new price
    const updatedSubscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      {
        items: [
          {
            id: currentSubscription.items.data[0].id,
            price: plan.priceId,
          },
        ],
        proration_behavior: "always_invoice", // Create invoice immediately for prorated amount
      }
    );

    // Update user in database
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        stripePriceId: plan.priceId,
      },
    });

    // Determine if upgrade or downgrade
    const planHierarchy: Record<string, number> = {
      free: 0,
      starter: 1,
      growth: 2,
      scale: 3,
    };

    const oldPlanLevel = planHierarchy[oldPlan?.id.toLowerCase() || "free"] || 0;
    const newPlanLevel = planHierarchy[plan.id.toLowerCase()] || 0;

    const action: "upgraded" | "downgraded" = newPlanLevel > oldPlanLevel ? "upgraded" : "downgraded";

    // Send admin notification
    await sendAdminSubscriptionNotification(
      session.user.email,
      user.name || "Unknown User",
      plan.name,
      plan.price * 100, // Convert to cents
      action
    );

    return NextResponse.json({
      success: true,
      message: "Subscription updated successfully",
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
      },
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
