import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { FeatureGate } from "@/components/dashboard/feature-gate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe, STRIPE_PLANS } from "@/lib/stripe";

export default async function StarterFeaturePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Get user subscription
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });

  let currentPlan = "free";

  if (user?.stripeSubscriptionId && stripe) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        user.stripeSubscriptionId
      );
      const priceId = subscription.items.data[0]?.price.id;
      const plan = Object.values(STRIPE_PLANS).find((p) => p.priceId === priceId);
      currentPlan = plan?.id || "free";
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  }

  return (
    <DashboardShell>
      <FeatureGate requiredPlan="starter" currentPlan={currentPlan}>
        <div className="space-y-6">
          <header className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Starter Feature
            </p>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Starter Plan Features</h1>
              <p className="text-muted-foreground max-w-2xl">
                Access exclusive features available with your Starter subscription.
              </p>
            </div>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Feature 1</CardTitle>
                <CardDescription>
                  This is a demo feature available for Starter plan subscribers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your Starter plan gives you access to basic features and functionality.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature 2</CardTitle>
                <CardDescription>
                  Another great feature included in the Starter plan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Enjoy enhanced capabilities with your subscription.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </FeatureGate>
    </DashboardShell>
  );
}
