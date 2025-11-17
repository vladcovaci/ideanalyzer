"use client";

import { useEffect } from "react";
import { trackClientEvent } from "@/lib/analytics/client";

type Props = {
  briefId: string;
  userId?: string;
};

export function BriefViewTracker({ briefId, userId }: Props) {
  useEffect(() => {
    const start = performance.now();
    trackClientEvent({
      event: "brief_viewed",
      distinctId: userId,
      properties: {
        brief_id: briefId,
        load_time_ms: Math.round(performance.now()),
      },
    });

    return () => {
      const duration = Math.round(performance.now() - start);
      trackClientEvent({
        event: "brief_view_duration",
        distinctId: userId,
        properties: {
          brief_id: briefId,
          duration_ms: duration,
        },
      });
    };
  }, [briefId, userId]);

  return null;
}
