"use client";

const ANALYTICS_ENABLED =
  process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "false";
const isDev = process.env.NODE_ENV !== "production";

const logDebug = (...args: unknown[]) => {
  if (isDev) {
    console.log("[analytics-client]", ...args);
  }
};

type ClientPayload = {
  event: string;
  distinctId?: string;
  properties?: Record<string, unknown>;
};

export const trackClientEvent = async (payload: ClientPayload) => {
  if (!ANALYTICS_ENABLED) {
    logDebug("analytics disabled", payload);
    return;
  }

  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/track", blob);
      return;
    }

    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch (error) {
    logDebug("failed to send analytics", error);
  }
};
