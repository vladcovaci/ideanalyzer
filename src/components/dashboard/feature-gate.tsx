import Link from "next/link";
import { IconLock, IconSparkles } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { STRIPE_PLANS } from "@/lib/stripe";

type FeatureGateProps = {
  children: React.ReactNode;
  requiredPlan: "starter" | "growth" | "scale";
  currentPlan: string;
};

// Plan hierarchy: free < starter < growth < scale
const planHierarchy = {
  free: 0,
  starter: 1,
  growth: 2,
  scale: 3,
};

export function FeatureGate({ children, requiredPlan, currentPlan }: FeatureGateProps) {
  const currentPlanLevel = planHierarchy[currentPlan.toLowerCase() as keyof typeof planHierarchy] || 0;
  const requiredPlanLevel = planHierarchy[requiredPlan];

  // Check if user has access
  const hasAccess = currentPlanLevel >= requiredPlanLevel;

  if (hasAccess) {
    return <>{children}</>;
  }

  // Get plan details
  const requiredPlanDetails = Object.values(STRIPE_PLANS).find(
    (plan) => plan.id.toLowerCase() === requiredPlan.toLowerCase()
  );

  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <Card className="max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <IconLock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">
            Upgrade to {requiredPlanDetails?.name} Plan
          </CardTitle>
          <CardDescription className="text-base">
            This feature requires an active {requiredPlanDetails?.name} subscription or higher.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] p-6">
            <div className="mb-4 flex items-center gap-2">
              <IconSparkles className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">What you get with {requiredPlanDetails?.name}</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span>
                  {requiredPlanDetails?.features.apiCalls === -1
                    ? "Unlimited"
                    : requiredPlanDetails?.features.apiCalls.toLocaleString()}{" "}
                  API calls per month
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span>
                  {requiredPlanDetails?.features.storage === -1
                    ? "Unlimited"
                    : `${requiredPlanDetails?.features.storage}GB`}{" "}
                  storage
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span>
                  {requiredPlanDetails?.features.projects === -1
                    ? "Unlimited"
                    : requiredPlanDetails?.features.projects}{" "}
                  projects
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span>
                  {requiredPlanDetails?.features.teamMembers === -1
                    ? "Unlimited"
                    : requiredPlanDetails?.features.teamMembers}{" "}
                  team members
                </span>
              </li>
              {requiredPlanDetails?.enabledFeatures.prioritySupport && (
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Priority support</span>
                </li>
              )}
              {requiredPlanDetails?.enabledFeatures.customBranding && (
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Custom branding</span>
                </li>
              )}
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard/billing">
                Upgrade to {requiredPlanDetails?.name}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Your current plan: <span className="font-medium capitalize">{currentPlan}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
