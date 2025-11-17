/**
 * Utility for managing idea text in session storage with expiration
 */

const STORAGE_KEY = "pendingIdeaAnalysis";
const EXPIRY_HOURS = 24;

interface StoredIdea {
  text: string;
  timestamp: number;
  isPrivate: boolean;
}

/**
 * Save idea to session storage with timestamp
 */
export function saveIdeaToStorage(text: string, isPrivate: boolean): void {
  if (typeof window === "undefined") return;

  const data: StoredIdea = {
    text,
    isPrivate,
    timestamp: Date.now(),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save idea to session storage:", error);
  }
}

/**
 * Retrieve idea from session storage if not expired
 * Returns null if expired or not found
 */
export function getIdeaFromStorage(): StoredIdea | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: StoredIdea = JSON.parse(stored);
    const expiryTime = data.timestamp + EXPIRY_HOURS * 60 * 60 * 1000;

    // Check if expired
    if (Date.now() > expiryTime) {
      clearIdeaFromStorage();
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to retrieve idea from session storage:", error);
    return null;
  }
}

/**
 * Clear idea from session storage
 */
export function clearIdeaFromStorage(): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear idea from session storage:", error);
  }
}

/**
 * Check if there's a pending idea in storage
 */
export function hasPendingIdea(): boolean {
  return getIdeaFromStorage() !== null;
}
