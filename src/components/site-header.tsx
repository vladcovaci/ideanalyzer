"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export function SiteHeader() {
  const { data: session } = useSession();
  const user = session?.user;
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>("Free");

  const displayName =
    user?.name?.split(" ")[0] ??
    (user?.email ? user.email.split("@")[0] : "there");
  const greeting = getGreeting();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch("/api/user/subscription");
        const data = await response.json();
        setSubscriptionPlan(data.plan);
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };

    if (session?.user) {
      fetchSubscription();
    }
  }, [session]);

  return (
    <header className="py-4 flex shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-4 px-4 lg:px-6">
       
        <Separator orientation="vertical" className="hidden h-8 lg:block" />
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              {greeting}, {displayName}
            </h1>
            <Badge
              variant="outline"
              className="rounded-full border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-3 py-1 text-xs font-medium"
            >
              {subscriptionPlan} plan
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
