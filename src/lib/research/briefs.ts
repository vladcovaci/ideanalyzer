import type { Brief, Idea } from "@prisma/client";
import { cache } from "react";
import { prisma } from "@/lib/db";
import type { ResearchBriefResult } from "./types";

export type BriefWithContent = Brief & {
  idea: Idea | null;
  content: ResearchBriefResult;
};

export const extractProofSources = (content: ResearchBriefResult | undefined) => {
  if (!content?.proofSignals) return [];
  const set = new Set<string>();
  content.proofSignals.forEach((signal) => {
    signal.sources?.forEach((source) => {
      if (typeof source === "string" && source.trim()) {
        set.add(source.trim());
      }
    });
  });
  return Array.from(set);
};

export const getBriefById = cache(async (id: string): Promise<BriefWithContent | null> => {
  const brief = await prisma.brief.findUnique({
    where: { id },
    include: { idea: true },
  });

  if (!brief) return null;

  const content = (brief.content ?? {}) as ResearchBriefResult;

  return {
    ...brief,
    idea: brief.idea,
    content,
  };
});
