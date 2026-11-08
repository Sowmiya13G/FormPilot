interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory token bucket / window store
const ipStore = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically
const CLEANUP_INTERVAL_MS = 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleRecords() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [ip, record] of ipStore.entries()) {
    if (record.resetAt <= now) {
      ipStore.delete(ip);
    }
  }
}

export interface RateLimitOptions {
  limit?: number; // max requests
  windowMs?: number; // window size in ms
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Check and increment rate limit for a client IP.
 * Default: 30 requests per 60 seconds.
 */
export function checkRateLimit(
  ip: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const limit = options.limit ?? 30;
  const windowMs = options.windowMs ?? 60 * 1000;
  const now = Date.now();

  cleanupStaleRecords();

  const record = ipStore.get(ip);

  if (!record || record.resetAt <= now) {
    ipStore.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetAt: now + windowMs,
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    limit,
    remaining: limit - record.count,
    resetAt: record.resetAt,
  };
}

