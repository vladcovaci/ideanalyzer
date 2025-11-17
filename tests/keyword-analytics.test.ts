import test from "node:test";
import assert from "node:assert/strict";
import {
  buildLLMKeywordFallback,
  selectKeywordSeeds,
} from "../src/lib/research/keyword-analytics";
import type { KeywordSeed } from "../src/lib/research/types";

test("buildLLMKeywordFallback returns LLM-only keyword structure", () => {
  const seeds: KeywordSeed[] = [
    { term: "ai research brief", intent: "commercial", rationale: "Core keyword" },
    { term: "startup market research", intent: "informational" },
  ];

  const fallback = buildLLMKeywordFallback(
    "AI platform that generates research briefs instantly.",
    seeds
  );

  assert.equal(fallback.source, "llm_fallback");
  assert.equal(fallback.keywords.length, 2);
  assert.equal(fallback.keywords[0]?.volume, null);
  assert.equal(fallback.keywords[0]?.trend.length, 0);
  assert.ok(
    fallback.keywords[0]?.notes?.toLowerCase().includes("llm suggestion")
  );
});

test("selectKeywordSeeds extracts heuristic keywords", () => {
  const seeds = selectKeywordSeeds(
    "AI scheduling platform for independent dental clinics across Europe."
  );
  assert.ok(seeds.length > 0);
  assert.ok(seeds.some((term) => term.includes("dental")));
});
