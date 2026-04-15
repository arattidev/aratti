import { HttpError } from "../errors";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function enforceRateLimit(key: string, config: RateLimitConfig): void {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt <= now) {
    memoryStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return;
  }

  if (entry.count >= config.maxRequests) {
    throw new HttpError(429, "rate_limited", "Too many requests");
  }

  entry.count += 1;
  memoryStore.set(key, entry);
}
