/**
 * Prompt Rewriting for Deep Research
 *
 * Based on OpenAI Deep Research best practices:
 * https://platform.openai.com/docs/guides/deep-research
 *
 * ChatGPT Deep Research uses a 3-step process:
 * 1. Clarification (done in chat flow)
 * 2. Prompt rewriting (this file)
 * 3. Deep research (comprehensive-deep-research.ts)
 */

import { getOpenAIClient } from "@/lib/openai";
import type { ClarifyingContext } from "./types";

const COMPRESSION_SYSTEM_PROMPT = `
You are a compression engine.
Rewrite the user's summary into a shorter, clearer version WITHOUT adding new details.

RULES:
- Max length: 350 characters
- Keep only essential meaning
- Do NOT expand, infer, speculate, or add information
- Do NOT add examples, scenarios, extra context, or assumptions
- Reduce wording, remove fluff, keep it neutral
- Output ONLY the rewritten summary, nothing else.
`.trim();

const MAX_COMPRESSED_LENGTH = 350;
const PROMPT_REWRITER_MODEL =
  process.env.PROMPT_REWRITER_MODEL || "gpt-4.1-mini";

/**
 * Rewrite the founder summary into a short, neutral statement for deep research.
 * The goal is compression (≤350 chars) with zero hallucinated details.
 */
export async function rewritePromptForDeepResearch(
  ideaSummary: string,
  clarifyingContext?: ClarifyingContext
): Promise<string> {
  const openai = getOpenAIClient();
  const baseSummary = ideaSummary?.trim() || "";

  const contextPieces: string[] = [];
  if (clarifyingContext) {
    const { userAnswers, aiAssumptions } = clarifyingContext;
    Object.entries(userAnswers).forEach(([question, answer]) => {
      if (answer?.trim()) {
        contextPieces.push(`${question}: ${answer.trim()}`);
      }
    });
    Object.entries(aiAssumptions).forEach(([question, assumption]) => {
      if (assumption?.trim()) {
        contextPieces.push(`${question}: ${assumption.trim()}`);
      }
    });
  }

  const combinedSource = [baseSummary, contextPieces.join(" | ")]
    .filter(Boolean)
    .join(" | ");

  const userContent = `Original:\n${combinedSource}`.trim();

  try {
    const completion = await openai.chat.completions.create({
      model: PROMPT_REWRITER_MODEL,
      temperature: 0.2,
      max_tokens: 150,
      messages: [
        { role: "system", content: COMPRESSION_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    });

    const rewritten = completion.choices?.[0]?.message?.content?.trim();
    if (rewritten) {
      const trimmed =
        rewritten.length > MAX_COMPRESSED_LENGTH
          ? rewritten.slice(0, MAX_COMPRESSED_LENGTH).trim()
          : rewritten;
      console.log(
        `[Prompt Rewriter] ✅ Compressed summary (${trimmed.length} chars)`
      );
      return trimmed;
    }
  } catch (error) {
    console.warn("[Prompt Rewriter] ⚠️ Summary compression failed:", error);
  }

  return baseSummary.slice(0, MAX_COMPRESSED_LENGTH).trim();
}

/**
 * Optional: Ask clarifying questions before deep research
 * Uses gpt-4.1 to determine what additional context is needed
 */
export async function generateClarifyingQuestions(
  ideaSummary: string
): Promise<string[]> {
  const openai = getOpenAIClient();

  const instructions = `
You are talking to a user who is asking for a research task to be conducted. Your job is to gather more information from the user to successfully complete the task.

GUIDELINES:
- Be concise while gathering all necessary information
- Make sure to gather all the information needed to carry out the research task in a concise, well-structured manner.
- Use bullet points or numbered lists if appropriate for clarity.
- Don't ask for unnecessary information, or information that the user has already provided.
- Focus on the 5 key modules: Description, Problem, Why Now, Proof, Competition
- Ask no more than 5 questions total
- Return questions as a JSON array of strings

IMPORTANT: Do NOT conduct any research yourself, just gather information that will be given to a researcher to conduct the research task.

Return format: {"questions": ["question 1", "question 2", ...]}
`.trim();

  try {
    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "developer",
          content: [{ type: "input_text", text: instructions }],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Idea: ${ideaSummary}\n\nWhat clarifying questions should I ask?`,
            },
          ],
        },
      ],
      text: { format: { type: "json_object" } },
    });

    const outputText =
      (response as { output_text?: string }).output_text ??
      (response.output?.[0] as { content?: Array<{ text?: string }> })?.content?.[0]?.text ??
      "{}";

    const parsed = JSON.parse(outputText);
    const questions = parsed.questions || [];

    console.log(`[Clarifying Questions] Generated ${questions.length} questions`);
    return questions.slice(0, 5); // Max 5 questions
  } catch (error) {
    console.error("[Clarifying Questions] ❌ Failed to generate questions:", error);
    return [];
  }
}
