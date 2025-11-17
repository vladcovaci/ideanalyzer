import { z } from "zod";
import { getOpenAIClient } from "@/lib/openai";
import { parseJSONWithSchema } from "./utils";
import type { KeywordSeed } from "./types";
import { selectKeywordSeeds } from "./keyword-analytics";

const keywordSchema = z.object({
  term: z.string().min(2),
  intent: z
    .enum(["informational", "navigational", "transactional", "commercial", "other"])
    .optional(),
  rationale: z.string().optional(),
});

const keywordPromptSchema = z.object({
  keywords: z.array(keywordSchema).min(5).max(10),
});

const KEYWORD_SYSTEM_PROMPT = `
You are a growth strategist generating SEO keywords for startup ideas.
Return only JSON describing the highest-intent and most relevant keywords.
`.trim();

const buildUserPrompt = (summary: string) => `
Idea summary:
"""${summary}"""

Instructions:
- Generate 5-10 short keywords or keyphrases (2-4 words) founders should target.
- Include a mix of commercial + informational intents.
- Avoid repeating the company's name unless essential.
- Output JSON:
{
  "keywords": [
    { "term": "...", "intent": "commercial|informational|transactional|navigational|other", "rationale": "Why it's relevant" }
  ]
}
`.trim();

export const generateKeywordSeeds = async (summary: string): Promise<KeywordSeed[]> => {
  const openai = getOpenAIClient();

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: KEYWORD_SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(summary) },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const parsed = parseJSONWithSchema(content, keywordPromptSchema);
    return parsed.keywords.map((keyword) => ({
      term: keyword.term,
      intent: keyword.intent ?? "other",
      rationale: keyword.rationale,
    }));
  } catch (error) {
    const heuristicSeeds: KeywordSeed[] = selectKeywordSeeds(summary).map((term) => ({
      term,
      intent: "other",
      rationale: "Heuristic keyword derived from summary.",
    }));
    if (heuristicSeeds.length) {
      return heuristicSeeds;
    }
    throw error;
  }
};
