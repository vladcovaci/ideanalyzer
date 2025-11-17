/**
 * Rate Limiting Utility
 * Implements a sliding window algorithm to limit requests per user
 */

interface RateLimitEntry {
  timestamps: number[];
}

// In-memory store for rate limiting
// In production, consider using Redis for distributed systems
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 10 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes
setInterval(() => {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  for (const [key, entry] of rateLimitStore.entries()) {
    // Remove entries older than 1 hour
    entry.timestamps = entry.timestamps.filter(ts => ts > oneHourAgo);

    // Remove the entry completely if no timestamps remain
    if (entry.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Check if a request is within rate limits
 * @param identifier - Unique identifier for the user (e.g., email or session ID)
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60000ms = 1 minute)
 * @returns RateLimitResult indicating if request is allowed
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000 // 1 minute default
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get or create entry for this identifier
  let entry = rateLimitStore.get(identifier);

  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(identifier, entry);
  }

  // Filter out timestamps outside the current window (sliding window)
  entry.timestamps = entry.timestamps.filter(ts => ts > windowStart);

  // Check if limit is exceeded
  if (entry.timestamps.length >= limit) {
    // Calculate when the oldest request will expire
    const oldestTimestamp = entry.timestamps[0];
    const resetAt = new Date(oldestTimestamp + windowMs);

    return {
      success: false,
      remaining: 0,
      resetAt,
    };
  }

  // Add current timestamp
  entry.timestamps.push(now);

  // Calculate remaining requests
  const remaining = limit - entry.timestamps.length;

  // Calculate reset time (when the oldest timestamp expires)
  const oldestTimestamp = entry.timestamps[0];
  const resetAt = new Date(oldestTimestamp + windowMs);

  return {
    success: true,
    remaining,
    resetAt,
  };
}

/**
 * Reset rate limit for a specific identifier
 * Useful for testing or manual overrides
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get current rate limit status without incrementing
 * Useful for checking limits before expensive operations
 */
export function getRateLimitStatus(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): Omit<RateLimitResult, 'success'> {
  const now = Date.now();
  const windowStart = now - windowMs;

  const entry = rateLimitStore.get(identifier);

  if (!entry) {
    return {
      remaining: limit,
      resetAt: new Date(now + windowMs),
    };
  }

  // Filter timestamps in current window
  const validTimestamps = entry.timestamps.filter(ts => ts > windowStart);
  const remaining = Math.max(0, limit - validTimestamps.length);

  const oldestTimestamp = validTimestamps[0] || now;
  const resetAt = new Date(oldestTimestamp + windowMs);

  return {
    remaining,
    resetAt,
  };
}
