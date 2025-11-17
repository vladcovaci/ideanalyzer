/**
 * Context Extractor - Parse conversation to build ClarifyingContext
 *
 * Extracts:
 * 1. Questions asked by the assistant
 * 2. User answers
 * 3. AI assumptions (when user doesn't provide answers)
 */

import type { ClarifyingContext } from "./types";

type Message = {
  role: "user" | "assistant";
  content: string;
};

/**
 * Extract questions from assistant's message
 * Looks for numbered lists or question marks
 */
function extractQuestionsFromMessage(content: string): string[] {
  const questions: string[] = [];

  // Look for "Essential Questions" section
  const essentialQuestionsMatch = content.match(
    /\*\*Essential Questions\*\*\s*\n([\s\S]*?)(?:\n\n|\n\*\*|$)/i
  );

  if (essentialQuestionsMatch) {
    const section = essentialQuestionsMatch[1];
    // Extract numbered items
    const numberedItems = section.match(/^\d+\.\s*(.+?)(?=\n\d+\.|\n\n|$)/gm);
    if (numberedItems) {
      numberedItems.forEach((item) => {
        const cleaned = item.replace(/^\d+\.\s*/, "").trim();
        if (cleaned) {
          questions.push(cleaned);
        }
      });
    }
  }

  // Fallback: find any numbered list with questions
  if (questions.length === 0) {
    const lines = content.split("\n");
    lines.forEach((line) => {
      const numberedMatch = line.match(/^\d+\.\s*(.+\?)$/);
      if (numberedMatch) {
        questions.push(numberedMatch[1].trim());
      }
    });
  }

  return questions;
}

/**
 * Extract assumptions from assistant's message
 * Looks for "Assumptions" section
 */
function extractAssumptions(content: string): Record<string, string> {
  const assumptions: Record<string, string> = {};

  // Look for "Assumptions" section
  const assumptionsMatch = content.match(
    /\*\*Assumptions.*?\*\*\s*\n([\s\S]*?)(?:\n\n\*\*|$)/i
  );

  if (assumptionsMatch) {
    const section = assumptionsMatch[1];
    // Extract bullet points or numbered items
    const items = section.match(/^[-\d]+\.\s*(.+?):\s*(.+?)(?=\n[-\d]|\n\n|$)/gm);
    if (items) {
      items.forEach((item) => {
        const match = item.match(/^[-\d]+\.\s*(.+?):\s*(.+)$/);
        if (match) {
          const question = match[1].trim();
          const assumption = match[2].trim();
          assumptions[question] = assumption;
        }
      });
    }
  }

  return assumptions;
}

/**
 * Extract confirmed context from assistant's message
 * Looks for "Confirmed" section
 */
function extractConfirmedContext(content: string): Record<string, string> {
  const confirmed: Record<string, string> = {};

  // Look for "Confirmed" section
  const confirmedMatch = content.match(
    /\*\*Confirmed.*?\*\*\s*\n([\s\S]*?)(?:\n\n\*\*|$)/i
  );

  if (confirmedMatch) {
    const section = confirmedMatch[1];
    // Extract bullet points or numbered items
    const items = section.match(/^[-\d]+\.\s*(.+?):\s*(.+?)(?=\n[-\d]|\n\n|$)/gm);
    if (items) {
      items.forEach((item) => {
        const match = item.match(/^[-\d]+\.\s*(.+?):\s*(.+)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          confirmed[key] = value;
        }
      });
    }
  }

  return confirmed;
}

/**
 * Build a narrative summary from the conversation
 */
function buildContextSummary(
  userAnswers: Record<string, string>,
  aiAssumptions: Record<string, string>
): string {
  const parts: string[] = [];

  if (Object.keys(userAnswers).length > 0) {
    parts.push("User confirmed:");
    Object.entries(userAnswers).forEach(([key, value]) => {
      parts.push(`- ${key}: ${value}`);
    });
  }

  if (Object.keys(aiAssumptions).length > 0) {
    parts.push("\nAI assumptions (to be validated):");
    Object.entries(aiAssumptions).forEach(([key, value]) => {
      parts.push(`- ${key}: ${value}`);
    });
  }

  return parts.join("\n");
}

/**
 * Extract clarifying context from conversation messages
 *
 * @param messages - Array of conversation messages
 * @returns ClarifyingContext object with user answers and AI assumptions
 */
export function extractClarifyingContext(
  messages: Message[]
): ClarifyingContext | undefined {
  if (messages.length < 2) {
    return undefined;
  }

  const userAnswers: Record<string, string> = {};
  const aiAssumptions: Record<string, string> = {};
  let questions: string[] = [];

  // Iterate through messages to build context
  messages.forEach((message, index) => {
    if (message.role === "assistant") {
      // Extract questions from assistant messages
      const extractedQuestions = extractQuestionsFromMessage(message.content);
      if (extractedQuestions.length > 0) {
        questions = extractedQuestions;
      }

      // Extract confirmed context (user answers)
      const confirmed = extractConfirmedContext(message.content);
      Object.assign(userAnswers, confirmed);

      // Extract assumptions
      const assumptions = extractAssumptions(message.content);
      Object.assign(aiAssumptions, assumptions);
    } else if (message.role === "user" && questions.length > 0) {
      // Try to match user answers to questions
      // Simple heuristic: if user message follows questions, treat it as answers
      if (index > 0 && messages[index - 1].role === "assistant") {
        // For simplicity, we'll store the user's full message
        // In a more sophisticated version, you could parse individual answers
        const userContent = message.content;

        // Try to extract answers from a numbered/bulleted list
        const answeredItems = userContent.match(/^\d+\.\s*(.+?)$/gm);
        if (answeredItems && answeredItems.length > 0) {
          answeredItems.forEach((item, idx) => {
            if (idx < questions.length) {
              const answer = item.replace(/^\d+\.\s*/, "").trim();
              userAnswers[questions[idx]] = answer;
            }
          });
        } else {
          // If no structured format, store as general context
          userAnswers["User response"] = userContent;
        }
      }
    }
  });

  // Only return context if we have something meaningful
  if (Object.keys(userAnswers).length === 0 && Object.keys(aiAssumptions).length === 0) {
    return undefined;
  }

  const contextSummary = buildContextSummary(userAnswers, aiAssumptions);

  return {
    userAnswers,
    aiAssumptions,
    contextSummary,
  };
}

/**
 * Extract "Research Input" summary from assistant's last message
 * This is the cleaned summary that should be sent to deep research
 */
export function extractResearchInput(messages: Message[]): string | null {
  // Look backwards for the "Research Input" section
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role === "assistant") {
      const match = message.content.match(
        /Research Input:\s*(.+?)(?=\n\n|Perfect!|$)/is
      );
      if (match) {
        return match[1].trim();
      }
    }
  }

  // Fallback: return the last user message
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      return messages[i].content;
    }
  }

  return null;
}
