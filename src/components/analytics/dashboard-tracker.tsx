"use client";

import { useEffect } from "react";
import { trackClientEvent } from "@/lib/analytics/client";

type Props = {
  userId?: string;
};

export function DashboardTracker({ userId }: Props) {
  useEffect(() => {
    trackClientEvent({
      event: "dashboard_visited",
      distinctId: userId,
      properties: {
        path: window.location.pathname,
      },
    });

    trackClientEvent({
      event: "page_load",
      distinctId: userId,
      properties: {
        path: window.location.pathname,
        duration_ms: Math.round(performance.now()),
      },
    });
  }, [userId]);

  return null;
}
