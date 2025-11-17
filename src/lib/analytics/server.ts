const POSTHOG_HOST = process.env.POSTHOG_HOST || "https://app.posthog.com";
const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY || "";
const ANALYTICS_ENABLED =
  process.env.ANALYTICS_ENABLED !== "false" && Boolean(POSTHOG_API_KEY);
const isDev = process.env.NODE_ENV !== "production";

type EventPayload = {
  event: string;
  distinctId?: string | null;
  properties?: Record<string, unknown>;
  timestamp?: string;
};

const logDebug = (...args: unknown[]) => {
  if (isDev) {
    console.log("[analytics]", ...args);
  }
};

export const trackServerEvent = async ({
  event,
  distinctId,
  properties,
  timestamp,
}: EventPayload) => {
  if (!ANALYTICS_ENABLED) {
    logDebug("analytics disabled", event, properties);
    return;
  }

  try {
    await fetch(`${POSTHOG_HOST}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: POSTHOG_API_KEY,
        event,
        distinct_id: distinctId ?? undefined,
        properties: {
          ...properties,
          $lib: "ideanalyzer",
        },
        timestamp: timestamp ?? new Date().toISOString(),
      }),
      keepalive: true,
    });
  } catch (error) {
    logDebug("failed to track event", event, error);
  }
};

export const trackPerformanceMetric = async (
  name: string,
  duration: number,
  metadata?: Record<string, unknown>
) => {
  await trackServerEvent({
    event: "performance_metric",
    properties: {
      metric_name: name,
      duration_ms: duration,
      ...metadata,
    },
  });
};
