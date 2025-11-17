const STORAGE_KEY = "activeResearchJob";

export type ResearchJobStatus = "pending" | "in_progress" | "completed" | "failed";

export type StoredResearchJob = {
  conversationId: string;
  ideaId?: string | null;
  summary: string;
  status: ResearchJobStatus;
  startedAt: string;
  updatedAt: string;
  briefId?: string;
  error?: string;
  attemptCount: number;
  result?: import("./types").ResearchBriefResult | null;
  storageWarning?: string | null;
};

const isBrowser = () => typeof window !== "undefined";

const readStorage = (): StoredResearchJob | null => {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredResearchJob;
  } catch (error) {
    console.error("Failed to read research job from storage:", error);
    return null;
  }
};

const writeStorage = (job: StoredResearchJob | null) => {
  if (!isBrowser()) return;
  try {
    if (!job) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(job));
  } catch (error) {
    console.error("Failed to write research job to storage:", error);
  }
};

export const getStoredResearchJob = () => readStorage();

export const saveResearchJob = (job: StoredResearchJob | null) => {
  writeStorage(job);
};

export const initializeResearchJob = (params: {
  conversationId: string;
  ideaId?: string | null;
  summary: string;
}) => {
  if (!params.summary?.trim()) {
    throw new Error("Research summary is required.");
  }

  const now = new Date().toISOString();
  const job: StoredResearchJob = {
    conversationId: params.conversationId,
    ideaId: params.ideaId,
    summary: params.summary,
    status: "pending",
    startedAt: now,
    updatedAt: now,
    attemptCount: 0,
  };

  writeStorage(job);
  return job;
};

export const updateResearchJob = (updater: (job: StoredResearchJob | null) => StoredResearchJob | null) => {
  const next = updater(readStorage());
  writeStorage(next);
  return next;
};

export const clearResearchJob = () => {
  writeStorage(null);
};
