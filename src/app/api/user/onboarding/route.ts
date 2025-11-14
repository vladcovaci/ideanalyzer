import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { pricingPlans } from "@/constants/pricing";
import { getPlanById } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const planId = body.planId as string | undefined;
    const profile = (body.profile ?? {}) as {
      bio?: unknown;
      company?: unknown;
      role?: unknown;
    };

    if (!planId) {
      return NextResponse.json(
        { error: "Plan selection is required to complete onboarding." },
        { status: 400 }
      );
    }

    const plan = pricingPlans.find((item) => item.id === planId);

    if (!plan) {
      return NextResponse.json(
        { error: "Selected plan is not available." },
        { status: 400 }
      );
    }

    // Update user onboarding status
    const planConfig = getPlanById(plan.id);

    const bio =
      typeof profile.bio === "string" && profile.bio.trim().length > 0
        ? profile.bio.trim()
        : null;
    const company =
      typeof profile.company === "string" && profile.company.trim().length > 0
        ? profile.company.trim()
        : null;
    const role =
      typeof profile.role === "string" && profile.role.trim().length > 0
        ? profile.role.trim()
        : null;

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        onboarded: true,
        stripePriceId: planConfig?.priceId ?? plan.stripePriceId,
        bio,
        company,
        role,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
