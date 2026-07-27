/**
 * Postgres-backed rate limiter using fixed-window counters.
 *
 * Replaces the in-memory Map with a persistent `rate_limits` table so
 * counters survive server restarts and work correctly across multiple
 * Vercel instances.
 *
 * Each row covers one (identifier, route) pair within a single time
 * window.  Windows are aligned to the nearest window boundary
 * (e.g. on the minute for a 60-second window) so concurrent requests
 * from different instances safely contend on the same row via
 * upsert semantics.
 */

import { prisma } from '@/lib/prisma';

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  maxRequests: number;
  /** Window size in milliseconds */
  windowMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 60,
  windowMs: 60_000, // 1 minute
};

export const ROUTE_LIMITS: Record<string, RateLimitConfig> = {
  // Mutation endpoints — strict limits
  '/api/posts':            { maxRequests: 10, windowMs: 60_000 },
  '/api/comments':         { maxRequests: 20, windowMs: 60_000 },
  '/api/likes':            { maxRequests: 30, windowMs: 60_000 },
  '/api/auth/signout':     { maxRequests: 10, windowMs: 60_000 },
  '/api/bookmarks':        { maxRequests: 20, windowMs: 60_000 },
  '/api/profile':          { maxRequests: 20, windowMs: 60_000 },
  '/api/users/[id]/follow': { maxRequests: 15, windowMs: 60_000 },

  // AI endpoints — expensive, tight limits
  '/api/ai/chat':          { maxRequests: 20, windowMs: 60_000 },
  '/api/ai/summarize':     { maxRequests:  5, windowMs: 60_000 },

  // Auth / security
  '/api/auth/signup':      { maxRequests:  5, windowMs: 60_000 },
  '/api/csrf':             { maxRequests: 10, windowMs: 60_000 },

  // Search — generous but still limited
  '/api/search':           { maxRequests: 60, windowMs: 60_000 },

  // Read-heavy endpoints
  '/api/trending':         { maxRequests: 30, windowMs: 60_000 },
  '/api/stocks':           { maxRequests: 60, windowMs: 60_000 },
  '/api/notifications':    { maxRequests: 30, windowMs: 60_000 },
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

/**
 * Round a Unix-epoch timestamp down to the nearest window boundary.
 *
 * Example:  ts=12_345_678, windowMs=60_000  →  12_300_000
 */
function windowStart(ts: number, windowMs: number): number {
  return Math.floor(ts / windowMs) * windowMs;
}

// ── Cleanup ────────────────────────────────────────────────────────────────
// GC runs in the background every 5 minutes to delete rows whose window ended
// more than 2 minutes ago (keeps a buffer for straggling requests).

let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function startCleanup(): void {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(async () => {
    try {
      const cutoff = new Date(Date.now() - 2 * 60 * 1000);
      await prisma.rateLimit.deleteMany({
        where: { windowStart: { lt: cutoff } },
      });
    } catch {
      // Logged downstream; don't crash the process over GC
    }
  }, 5 * 60_000);

  // Allow the Node.js event loop to exit even if the interval is pending
  if (cleanupInterval && typeof cleanupInterval === 'object') {
    cleanupInterval.unref();
  }
}

// ── Core check ─────────────────────────────────────────────────────────────

/**
 * Check & record a rate-limited request.
 *
 * Uses a single upsert query to atomically increment the counter for the
 * current (identifier, route, windowStart) tuple.  Because every instance
 * computes the same `windowStart` from the current time, concurrent
 * requests from different VMs safely share the same database row.
 */
export async function checkRateLimit(
  identifier: string,
  route: string,
): Promise<RateLimitResult> {
  startCleanup();

  const config = ROUTE_LIMITS[route] ?? DEFAULT_CONFIG;
  const now = Date.now();
  const ws = windowStart(now, config.windowMs);
  const key = `${identifier}:${route}`;

  const windowEnd = ws + config.windowMs;
  const resetMs = Math.max(windowEnd - now, 0);

  try {
    // Upsert: create the row if it doesn't exist, otherwise increment.
    // Prisma 7 with @prisma/adapter-pg supports `upsert` with `increment`.
    const record = await prisma.rateLimit.upsert({
      where: {
        key_windowStart: { key, windowStart: new Date(ws) },
      },
      update: {
        count: { increment: 1 },
      },
      create: {
        key,
        windowStart: new Date(ws),
        count: 1,
        maxRequests: config.maxRequests,
      },
    });

    const allowed = record.count <= config.maxRequests;
    const remaining = Math.max(config.maxRequests - record.count, 0);

    return { allowed, remaining, resetMs };
  } catch (error) {
    // If the DB is unavailable, degrade open (allow) rather than
    // blocking all traffic.
    console.error('[RateLimiter] DB error — degrading open:', error);
    return { allowed: true, remaining: 999, resetMs: 0 };
  }
}

/**
 * Get the client IP from a NextRequest object.
 * Respects common proxy headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return '127.0.0.1';
}
