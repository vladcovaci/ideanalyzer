"use client";

import { useState } from "react";
import { pricingPlans } from "@/constants/pricing";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const STEPS = [
  { id: 1, label: "Profile" },
  { id: 2, label: "Choose plan" },
];

export default function OnboardingPage() {
  const { update } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    bio: "",
    company: "",
    role: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleProfileNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setStep(2);
  };

  const handlePlanSubmit = async () => {
    if (!selectedPlan) {
      setError("Please select a plan to continue.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan,
          profile: {
            bio: profileData.bio.trim(),
            company: profileData.company.trim(),
            role: profileData.role,
          },
        }),
      });

      if (!response.ok) {
        const { error: message } = await response.json();
        throw new Error(message || "Failed to complete onboarding");
      }

      await update({ onboarded: true });

      // Create Stripe checkout session
      const checkoutResponse = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan }),
      });

      if (!checkoutResponse.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await checkoutResponse.json();

      if (url) {
        window.location.href = url;
      } else {
        // If no checkout URL (e.g., free plan), just redirect to dashboard
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to complete onboarding";
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-4 pb-4">
              {STEPS.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex min-w-[140px] flex-col items-center gap-1 rounded-2xl border border-[color:var(--glass-border)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]",
                    step === item.id
                      ? "bg-[hsl(var(--primary))/0.1] text-[hsl(var(--primary))] border-[hsl(var(--primary))/0.4]"
                      : "text-muted-foreground"
                  )}
                >
                  <span className="text-lg font-semibold">{item.id}</span>
                  {item.label}
                </div>
              ))}
            </div>
            <CardTitle className="text-2xl">Welcome to StartupKit</CardTitle>
            <CardDescription>
              Finish the guided setup to unlock your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleProfileNext}>
                <FieldGroup className="space-y-6">
                  <div className="rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                      Tell us about yourself
                    </h3>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="bio">Bio (Optional)</FieldLabel>
                        <Input
                          id="bio"
                          name="bio"
                          type="text"
                          placeholder="A brief description about yourself"
                          value={profileData.bio}
                          onChange={(event) =>
                            setProfileData((prev) => ({
                              ...prev,
                              bio: event.target.value,
                            }))
                          }
                          disabled={isLoading}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="company">
                          Company (Optional)
                        </FieldLabel>
                        <Input
                          id="company"
                          name="company"
                          type="text"
                          placeholder="Your company name"
                          value={profileData.company}
                          onChange={(event) =>
                            setProfileData((prev) => ({
                              ...prev,
                              company: event.target.value,
                            }))
                          }
                          disabled={isLoading}
                        />
                      </Field>
                    </FieldGroup>
                  </div>

                  <div className="rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] p-6">
                    <h3 className="mb-4 text-lg font-semibold">Preferences</h3>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="role">
                          What best describes you?
                        </FieldLabel>
                        <select
                          id="role"
                          name="role"
                          className="flex h-11 w-full rounded-xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-4 py-2 text-sm text-foreground shadow-sm transition-colors  disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur"
                          disabled={isLoading}
                          value={profileData.role}
                          onChange={(event) =>
                            setProfileData((prev) => ({
                              ...prev,
                              role: event.target.value,
                            }))
                          }
                        >
                          <option value="">Select an option</option>
                          <option value="developer">Developer</option>
                          <option value="designer">Designer</option>
                          <option value="manager">Manager</option>
                          <option value="founder">Founder</option>
                          <option value="other">Other</option>
                        </select>
                      </Field>
                    </FieldGroup>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isLoading}>
                      Continue to plans
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            ) : (
              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-xl font-semibold">Select your plan</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Every plan starts with a 7-day free trial. This is a demo
                    checkout—no charges will be made.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  {pricingPlans.map((plan) => {
                    const isSelected = selectedPlan === plan.id;
                    return (
                      <label
                        key={plan.id}
                        className={cn(
                          "group flex h-full cursor-pointer flex-col rounded-3xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] p-6 text-left transition-all hover:-translate-y-1 hover:shadow-xl focus-within:ring-2 focus-within:ring-primary/60",
                          isSelected &&
                            "border-primary/60 bg-[hsl(var(--primary))/0.08] shadow-xl"
                        )}
                      >
                        <input
                          type="radio"
                          name="plan"
                          value={plan.id}
                          checked={isSelected}
                          onChange={() => setSelectedPlan(plan.id)}
                          disabled={isLoading}
                          className="sr-only"
                        />
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground uppercase tracking-[0.2em]">
                                {plan.name}
                              </p>
                              <p className="mt-2 text-3xl font-semibold text-foreground">
                                {plan.price}
                                <span className="text-base font-normal text-muted-foreground">
                                  {plan.period}
                                </span>
                              </p>
                            </div>
                            {isSelected ? (
                              <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                                Selected
                              </span>
                            ) : null}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {plan.description}
                          </p>
                          <p className="text-sm font-medium text-[hsl(var(--primary))]">
                            {plan.trialDays ?? 7}-day free trial included
                          </p>
                        </div>
                        <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(119,140,255,0.15)] text-sm text-[hsl(var(--primary))]">
                                ●
                              </span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-auto pt-6">
                          <Button
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            className="w-full"
                            onClick={(event) => {
                              event.preventDefault();
                              if (!isLoading) {
                                setSelectedPlan(plan.id);
                              }
                            }}
                            disabled={isLoading}
                          >
                            {isSelected ? "Selected" : `Choose ${plan.name}`}
                          </Button>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedPlan(null);
                      setStep(1);
                    }}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handlePlanSubmit}
                    disabled={!selectedPlan || isLoading}
                    className="min-w-[220px]"
                  >
                    {isLoading ? "Starting trial..." : "Start 7-day free trial"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
