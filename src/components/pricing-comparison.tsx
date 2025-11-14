"use client";

import { Check, X } from "lucide-react";
import { STRIPE_PLANS } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PricingComparisonProps = {
  onSelectPlan?: (planId: string) => void;
  currentPlan?: string;
};

const featureLabels: Record<
  keyof (typeof STRIPE_PLANS)["FREE"]["enabledFeatures"],
  string
> = {
  dashboard: "Basic Dashboard",
  analytics: "Analytics Dashboard",
  projects: "Projects Management",
  team: "Team Collaboration",
  advancedAnalytics: "Advanced Analytics & Reports",
  prioritySupport: "Priority Support",
  customBranding: "Custom Branding",
  apiAccess: "API Access",
  webhooks: "Webhook Integration",
  sso: "SSO & Advanced Security",
};

export function PricingComparison({
  onSelectPlan,
  currentPlan,
}: PricingComparisonProps) {
  const plans = Object.values(STRIPE_PLANS).filter((plan) => plan.id !== "free");

  return (
    <div className="space-y-8">
      {/* Plan Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isPopular = plan.id === "growth";

          return (
            <Card
              key={plan.id}
              className={`relative ${isPopular ? "border-primary shadow-lg" : ""}`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="rounded-full px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                {plan.trialDays > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {plan.trialDays}-day free trial
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Usage Limits:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>
                      {plan.features.apiCalls === -1
                        ? "Unlimited"
                        : plan.features.apiCalls.toLocaleString()}{" "}
                      API calls/month
                    </li>
                    <li>
                      {plan.features.storage === -1
                        ? "Unlimited"
                        : plan.features.storage}{" "}
                      GB storage
                    </li>
                    <li>
                      {plan.features.projects === -1
                        ? "Unlimited"
                        : plan.features.projects}{" "}
                      projects
                    </li>
                    <li>
                      {plan.features.teamMembers === -1
                        ? "Unlimited"
                        : plan.features.teamMembers}{" "}
                      team members
                    </li>
                  </ul>
                </div>
              </CardContent>

              <CardFooter>
                {isCurrent ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : onSelectPlan ? (
                  <Button
                    className="w-full"
                    onClick={() => onSelectPlan(plan.id)}
                  >
                    Select {plan.name}
                  </Button>
                ) : (
                  <Button className="w-full">Get Started</Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="mt-12">
        <h3 className="mb-6 text-2xl font-semibold">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left font-semibold">Feature</th>
                {plans.map((plan) => (
                  <th
                    key={plan.id}
                    className="p-4 text-center font-semibold"
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(featureLabels).map(([feature, label]) => (
                <tr key={feature} className="border-b">
                  <td className="p-4">{label}</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="p-4 text-center">
                      {plan.enabledFeatures[
                        feature as keyof typeof plan.enabledFeatures
                      ] ? (
                        <Check className="mx-auto h-5 w-5 text-green-600" />
                      ) : (
                        <X className="mx-auto h-5 w-5 text-gray-300" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
