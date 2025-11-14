"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { STRIPE_PLANS } from "@/lib/stripe";

type BillingContentProps = {
  user: {
    email: string;
    name: string;
    stripeCustomerId: string | null;
  };
  subscription: {
    status: string;
    statusDisplay: {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
      description: string;
    };
    plan: string;
    planId: string;
    price: number;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    trialEnd: Date | null;
  } | null;
  currentPlan: string;
  invoices: Array<{
    id: string;
    amount: string;
    status: string;
    date: string;
    invoiceUrl: string | null;
    pdfUrl: string | null;
  }>;
  paymentMethod: {
    brand: string | undefined;
    last4: string | undefined;
    expMonth: number | undefined;
    expYear: number | undefined;
  } | null;
};

export function BillingContent({
  user,
  subscription,
  currentPlan,
  invoices,
  paymentMethod,
}: BillingContentProps) {
  const [loading, setLoading] = useState(false);
  const [managingPlan, setManagingPlan] = useState<string | null>(null);

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to open billing portal");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to open billing portal");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradePlan = async (planId: string) => {
    setManagingPlan(planId);
    const action = getPlanAction(planId);

    try {
      if (subscription) {
        // User has existing subscription - update it
        const response = await fetch("/api/stripe/update-subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ planId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update subscription");
        }

        toast.success(`Successfully ${action.toLowerCase()}d your plan!`);

        // Reload the page after a short delay to show updated subscription
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // No existing subscription - create new checkout session
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ planId }),
        });

        const data = await response.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error("Failed to create checkout session");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process request");
      setManagingPlan(null);
    }
  };

  const availablePlans = Object.values(STRIPE_PLANS).filter(
    (plan) => plan.id !== "free"
  );

  // Plan hierarchy for upgrade/downgrade detection
  const planHierarchy: Record<string, number> = {
    free: 0,
    starter: 1,
    growth: 2,
    scale: 3,
  };

  const getPlanAction = (planId: string) => {
    const currentLevel = planHierarchy[currentPlan.toLowerCase()] || 0;
    const targetLevel = planHierarchy[planId.toLowerCase()] || 0;

    if (targetLevel > currentLevel) return "Upgrade";
    if (targetLevel < currentLevel) return "Downgrade";
    return "Select";
  };

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Billing
        </p>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Manage subscription
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Review your current plan, manage your subscription, and keep your
            billing details up to date.
          </p>
        </div>
      </header>

      {/* Current Subscription */}
      <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>
                {subscription ? subscription.plan : "Free Plan"}
              </CardTitle>
              <CardDescription>
                {subscription
                  ? `Renews on ${subscription.currentPeriodEnd}`
                  : "No active subscription"}
                {subscription?.trialEnd && (
                  <span className="ml-2 text-xs text-blue-600">
                    • Trial ends {new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }).format(subscription.trialEnd)}
                  </span>
                )}
              </CardDescription>
            </div>
            {subscription && (
              <Badge
                variant={subscription.statusDisplay.variant}
                className="rounded-full px-4 py-1.5 text-xs font-medium"
              >
                {subscription.statusDisplay.label}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    {subscription ? "Current plan" : "Get started"}
                  </p>
                  <p className="text-2xl font-semibold">
                    {subscription
                      ? `$${subscription.price}/month`
                      : "Choose a plan"}
                  </p>
                  {subscription?.cancelAtPeriodEnd && (
                    <p className="mt-2 text-sm text-amber-600">
                      Cancels on {subscription.currentPeriodEnd}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.stripeCustomerId && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleManageSubscription}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Manage Subscription"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {paymentMethod && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Payment methods
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-4 py-3">
                    <div>
                      <p className="font-medium capitalize text-foreground">
                        {paymentMethod.brand} ending • {paymentMethod.last4}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Default • expires {paymentMethod.expMonth}/
                        {paymentMethod.expYear}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleManageSubscription}
                      disabled={loading}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Plans */}
        <Card>
          <CardHeader>
            <CardTitle>
              {subscription ? "Change Plan" : "Choose a Plan"}
            </CardTitle>
            <CardDescription>
              {subscription
                ? "Upgrade or downgrade your plan. Changes are prorated automatically."
                : "Select a plan that fits your needs. You can change or cancel anytime."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {availablePlans.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              const isLoading = managingPlan === plan.id;
              const action = getPlanAction(plan.id);

              return (
                <div
                  key={plan.id}
                  className="flex items-center justify-between rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ${plan.price}/month
                    </p>
                  </div>
                  {isCurrent ? (
                    <Badge
                      variant="outline"
                      className="rounded-full text-xs font-medium"
                    >
                      Current
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleUpgradePlan(plan.id)}
                      disabled={isLoading || loading}
                      variant={action === "Downgrade" ? "outline" : "default"}
                    >
                      {isLoading ? "Loading..." : action}
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Invoices */}
      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              {invoices.length > 0
                ? "Download your previous invoices."
                : "No invoices yet. They'll appear here once you subscribe."}
            </CardDescription>
          </div>
        </CardHeader>
        {invoices.length > 0 && (
          <CardContent className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-4 py-3 text-sm md:flex md:items-center md:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-foreground">{invoice.id}</p>
                  <p className="text-xs text-muted-foreground">
                    Issued {invoice.date}
                  </p>
                </div>
                <Separator className="my-3 bg-[color:var(--glass-border)] md:hidden" />
                <div className="flex items-center justify-between gap-4 md:w-auto">
                  <span className="text-sm font-semibold">
                    ${invoice.amount}
                  </span>
                  <Badge
                    variant={
                      invoice.status === "Paid"
                        ? "default"
                        : invoice.status === "Pending"
                          ? "secondary"
                          : "destructive"
                    }
                    className="rounded-full text-xs font-medium"
                  >
                    {invoice.status}
                  </Badge>
                  {invoice.pdfUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
