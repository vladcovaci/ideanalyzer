import type {
  ResearchComponent,
  ResearchError,
  TokenUsage,
  ZodSchema,
} from "./types";

const JSON_BLOCK_REGEX = /```json([\s\S]*?)```/i;

export const createEmptyUsage = (): TokenUsage => ({
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
});

export const sumUsage = (
  usage: Array<TokenUsage | undefined>
): TokenUsage => {
  return usage.reduce<TokenUsage>((acc, current) => {
    if (!current) {
      return acc;
    }
    return {
      promptTokens: acc.promptTokens + (current.promptTokens ?? 0),
      completionTokens: acc.completionTokens + (current.completionTokens ?? 0),
      totalTokens: acc.totalTokens + (current.totalTokens ?? 0),
    };
  }, createEmptyUsage());
};

export const usageFromOpenAI = (usage?: {
  prompt_tokens?: number | null;
  completion_tokens?: number | null;
  total_tokens?: number | null;
}): TokenUsage | undefined => {
  if (!usage) return undefined;
  return {
    promptTokens: usage.prompt_tokens ?? 0,
    completionTokens: usage.completion_tokens ?? 0,
    totalTokens: usage.total_tokens ?? 0,
  };
};

export const normalizeJSONPayload = (raw: string): string => {
  if (!raw) return "{}";
  const trimmed = raw.trim();
  const fencedMatch = trimmed.match(JSON_BLOCK_REGEX);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return trimmed;
  }

  const firstBrace = trimmed.indexOf("{");
  if (firstBrace >= 0) {
    const lastBrace = trimmed.lastIndexOf("}");
    if (lastBrace > firstBrace) {
      return trimmed.slice(firstBrace, lastBrace + 1);
    }
  }

  return trimmed;
};

export const parseJSONWithSchema = <T>(
  raw: string,
  schema: ZodSchema<T>
): T => {
  const normalized = normalizeJSONPayload(raw);
  const parsed = JSON.parse(normalized);
  return schema.parse(parsed);
};

export const buildResearchError = (
  component: ResearchComponent,
  message: string,
  retryable = true
): ResearchError => ({
  component,
  message,
  retryable,
});
