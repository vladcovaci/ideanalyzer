import OpenAI from "openai";

let defaultClient: OpenAI | null = null;

/**
 * Standard OpenAI client for normal chat/lightweight calls
 */
export const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Please add it to your environment configuration."
    );
  }

  if (!defaultClient) {
    defaultClient = new OpenAI({
      apiKey,
      timeout: 30000, // 30s for normal calls
      maxRetries: 2,
    });
  }

  return defaultClient;
};

/**
 * Dedicated client for Deep Research with extended timeout
 * Always creates a fresh client to ensure timeout is current
 */
export const getDeepResearchClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Please add it to your environment configuration."
    );
  }

  // Always read fresh from env to avoid stale cached values
  const timeoutSeconds = Number(process.env.DEEP_RESEARCH_TIMEOUT_SECONDS) || 1200;

  // SDK timeout must be MUCH longer than job timeout to handle initial request overhead
  // Deep Research initial request can take 30-90s just to acknowledge
  // Use 1 hour minimum to ensure SDK doesn't kill the initial request
  const sdkTimeoutMs = Math.max(timeoutSeconds * 1000, 60 * 60 * 1000); // 1 hour minimum

  console.log(`[Deep Research Client] SDK timeout set to ${sdkTimeoutMs / 1000}s (${sdkTimeoutMs / 60000} minutes)`);
  console.log(`[Deep Research Client] Job timeout managed by polling: ${timeoutSeconds}s`);

  // Always create a new client for Deep Research to ensure correct timeout
  return new OpenAI({
    apiKey,
    timeout: sdkTimeoutMs, // Long SDK timeout for initial request
    maxRetries: 0, // Never retry deep research calls
  });
};
