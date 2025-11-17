"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CONSENT_STORAGE_KEY = "startupkit-cookie-consent";

type ConsentStatus = "accepted" | "dismissed";

type CookieBannerProps = {
  variant?: "live" | "preview";
};

export function CookieBanner({ variant = "live" }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleStorage() {
      if (variant === "preview") {
        setIsVisible(true);
        return;
      }

      const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      setIsVisible(!value);
    }

    if (typeof window === "undefined") return;

    handleStorage();
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [variant]);

  const persist = useCallback(
    (status: ConsentStatus) => {
      if (typeof window === "undefined") return;

      const payload = JSON.stringify({
        status,
        timestamp: new Date().toISOString(),
      });

      window.localStorage.setItem(CONSENT_STORAGE_KEY, payload);
      window.dispatchEvent(
        new CustomEvent("startupkit:cookie-consent", {
          detail: { status },
        }),
      );

      if (variant !== "preview") {
        setIsVisible(false);
      }
    },
    [variant],
  );

  const handleAccept = useCallback(() => persist("accepted"), [persist]);
  const handleDismiss = useCallback(() => persist("dismissed"), [persist]);

  if (!isVisible) {
    return null;
  }

  const containerClass =
    variant === "preview"
      ? "relative z-10 mx-auto w-full max-w-3xl"
      : "fixed inset-x-3 bottom-3 z-50 sm:inset-x-8 sm:bottom-8";

  return (
    <div className={cn(containerClass)}>
      <div className="w-full max-w-xl rounded-[32px] border border-[color:var(--glass-border)] bg-[color:var(--glass-surface-strong)] p-6 shadow-[0_24px_60px_-40px_var(--shadow-elevated)] backdrop-blur sm:max-w-2xl sm:p-8">
        <div className="space-y-4">
          <div className="space-y-2 pb-3">
            <h2 className="text-lg font-semibold text-foreground">
              We use cookies to improve your experience
            </h2>
            <p className="text-sm text-muted-foreground">
              Essential cookies keep Idea Analyzer secure and working. Optional analytics help us improve
              product quality. You can change your choice anytime.
            </p>
            <p className="text-xs text-muted-foreground">
              Read more in our{" "}
              <a href="/cookies" className="underline">
                Cookie Policy
              </a>
              .
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start mt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleDismiss}
              className="sm:w-auto"
            >
              Essential only
            </Button>
            <Button size="lg" variant="default" onClick={handleAccept} className="sm:w-auto">
              Accept all cookies
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
