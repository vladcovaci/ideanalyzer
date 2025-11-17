const SUMMARY_KEY = "pendingIdeaSummary";

const isBrowser = () => typeof window !== "undefined";

export const savePendingSummary = (summary: string) => {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(SUMMARY_KEY, summary);
  } catch (error) {
    console.error("Failed to save summary:", error);
  }
};

export const getPendingSummary = () => {
  if (!isBrowser()) return "";
  try {
    return window.sessionStorage.getItem(SUMMARY_KEY) ?? "";
  } catch (error) {
    console.error("Failed to read summary:", error);
    return "";
  }
};

export const clearPendingSummary = () => {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.removeItem(SUMMARY_KEY);
  } catch (error) {
    console.error("Failed to clear summary:", error);
  }
};
