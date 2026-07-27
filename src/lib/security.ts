/**
 * Security middleware for API routes.
 *
 * Provides:
 * 1. Rate limiting based on client IP (configurable per route)
 * 2. CSRF token validation for mutation methods (POST, PUT, DELETE, PATCH)
 *
 * Usage:
 *   import { withSecurity } from '@/lib/security';
 *   export const POST = withSecurity(async (req) => { ... });
 *
 * For GET routes, pass { csrf: false, requireAuth: false }.
 * For authenticated routes, pass { requireAuth: true }.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, ROUTE_LIMITS } from '@/lib/rate-limiter';
import { validateToken } from '@/lib/csrf';
import { auth } from '@/auth';

export interface SecurityOptions {
  /** Require authentication (session check). Default true for mutations, false for GET. */
  requireAuth?: boolean;
  /** Require CSRF token. Default true for mutations, false for GET. */
  csrf?: boolean;
  /** Custom rate-limit identifier instead of IP (e.g., user ID). */
  identifier?: string;
}

type RouteHandler = (
  request: NextRequest,
  context?: { params?: Promise<Record<string, string>> }
) => Promise<NextResponse>;

const MUTATION_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

/**
 * Wrap an API route handler with rate limiting and CSRF protection.
 */
export function withSecurity(
  handler: RouteHandler,
  options?: SecurityOptions
): RouteHandler {
  return async (
    request: NextRequest,
    context?: { params?: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    const method = request.method;
    const isMutation = MUTATION_METHODS.has(method);
    const pathname = new URL(request.url).pathname;

    const opts: SecurityOptions = {
      requireAuth: isMutation,
      csrf: isMutation,
      ...options,
    };

    // ── Rate limiting ──────────────────────────────────────────────
    const ip = getClientIp(request);
    const identifier = opts.identifier ?? ip;

    const { allowed, remaining, resetMs } = await checkRateLimit(identifier, pathname);
    if (!allowed) {
      const routeConfig = ROUTE_LIMITS[pathname];
      const limit = routeConfig?.maxRequests ?? 60;

      return NextResponse.json(
        {
          error: 'Too many requests. Please slow down.',
          remaining,
          retryAfterMs: resetMs,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(Math.ceil(resetMs / 1000)),
            'Retry-After': String(Math.ceil(resetMs / 1000)),
          },
        }
      );
    }

    // ── Authentication ─────────────────────────────────────────────
    if (opts.requireAuth) {
      const session = await auth();
      const user = session?.user;

      if (!user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Attach user to request for downstream handlers
      (request as any).user = user;

      // ── CSRF validation ──────────────────────────────────────────
      if (opts.csrf) {
        const csrfToken = request.headers.get('x-csrf-token');
        if (!csrfToken) {
          return NextResponse.json(
            { error: 'Missing CSRF token. Include x-csrf-token header.' },
            { status: 403 }
          );
        }

        if (!validateToken(user.id, csrfToken)) {
          return NextResponse.json(
            { error: 'Invalid or expired CSRF token. Fetch a new one from GET /api/csrf.' },
            { status: 403 }
          );
        }
      }
    }

    // ── Execute handler ────────────────────────────────────────────
    try {
      return await handler(request, context);
    } catch (error) {
      console.error(`[Security] Unhandled error in ${method} ${pathname}:`, error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
