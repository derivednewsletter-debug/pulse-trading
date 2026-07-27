/**
 * Rate limiter — public API.
 *
 * Re-exports the Postgres-backed implementation so every import site
 * (`import { checkRateLimit } from '@/lib/rate-limiter'`) works without
 * changes.  The underlying store was switched from an in-memory Map to
 * a persistent `rate_limits` table so counters survive restarts and
 * work across multiple Vercel instances.
 */

export {
  checkRateLimit,
  getClientIp,
  ROUTE_LIMITS,
} from '@/lib/rate-limiter-pg';

export type {
  RateLimitResult,
  RateLimitConfig,
} from '@/lib/rate-limiter-pg';
