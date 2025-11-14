import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe, STRIPE_PLANS } from "@/lib/stripe";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ plan: "Free" }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!user || !user.stripeSubscriptionId || !stripe) {
      return NextResponse.json({ plan: "Free" }, { status: 200 });
    }

    // Fetch subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );

    const priceId = subscription.items.data[0]?.price.id;
    const plan = Object.values(STRIPE_PLANS).find((p) => p.priceId === priceId);

    return NextResponse.json({
      plan: plan?.name || "Free"
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json({ plan: "Free" }, { status: 200 });
  }
}
