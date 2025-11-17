import { randomUUID } from "crypto";

interface SentryConfig {
  endpoint: string;
  authHeader: string;
}

let sentryConfig: SentryConfig | null | undefined;

const buildSentryConfig = (): SentryConfig | null => {
  if (sentryConfig !== undefined) {
    return sentryConfig;
  }

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    sentryConfig = null;
    return null;
  }

  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace("/", "");
    const endpoint = `${url.protocol}//${url.host}/api/${projectId}/store/`;
    const authHeader = [
      "Sentry sentry_version=7",
      "sentry_client=idea-analyzer/1.0",
      `sentry_key=${url.username}`,
    ].join(", ");

    sentryConfig = { endpoint, authHeader };
    return sentryConfig;
  } catch (error) {
    console.error("Invalid Sentry DSN:", error);
    sentryConfig = null;
    return null;
  }
};

type ExtraContext = Record<string, unknown>;

const formatStack = (stack?: string) => {
  if (!stack) return undefined;

  return {
    frames: stack.split("\n").map((line, index) => ({
      filename: "stack",
      lineno: index + 1,
      function: line.trim(),
    })),
  };
};

export async function captureLLMException(
  error: unknown,
  extra: ExtraContext = {}
): Promise<void> {
  const config = buildSentryConfig();
  if (!config) {
    return;
  }

  const parsedError = error instanceof Error ? error : new Error(String(error));

  const payload = {
    event_id: randomUUID(),
    timestamp: new Date().toISOString(),
    level: "error",
    platform: "node",
    logger: "llm",
    message: {
      formatted: parsedError.message,
    },
    exception: {
      values: [
        {
          type: parsedError.name || "Error",
          value: parsedError.message,
          stacktrace: formatStack(parsedError.stack),
        },
      ],
    },
    extra,
  };

  try {
    await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sentry-Auth": config.authHeader,
      },
      body: JSON.stringify(payload),
    });
  } catch (sendError) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to send Sentry error:", sendError);
    }
  }
}
