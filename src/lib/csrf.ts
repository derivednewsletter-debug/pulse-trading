/**
 * CSRF protection using double-submit pattern.
 *
 * Tokens are generated server-side using the Web Crypto API
 * (Edge Runtime compatible), stored in an in-memory Map with
 * a 1-hour TTL, and sent to the client via a dedicated endpoint.
 * Mutation requests include the token in the `x-csrf-token` header.
 */

interface CSRFEntry {
  token: string;
  expiresAt: number;
}

const TOKEN_TTL_MS = 3_600_000; // 1 hour
const CLEANUP_INTERVAL_MS = 300_000; // 5 minutes

const tokens = new Map<string, CSRFEntry>();
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of tokens.entries()) {
      if (entry.expiresAt < now) {
        tokens.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
}

/**
 * Generate a random hex string using Web Crypto API (Edge-compatible).
 */
async function randomHex(length: number): Promise<string> {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a new CSRF token for a given session identifier (user ID or session ID).
 */
export async function generateToken(sessionId: string): Promise<string> {
  startCleanup();

  // Remove any existing token for this session
  tokens.delete(sessionId);

  const raw = await randomHex(32);
  const token = `pulse-csrf-${raw}`;

  tokens.set(sessionId, {
    token,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  });

  return token;
}

/**
 * Validate a CSRF token for a given session identifier.
 *
 * @param sessionId - The user's ID or session identifier
 * @param token - The token from the `x-csrf-token` header
 * @returns true if the token is valid and not expired
 */
export function validateToken(sessionId: string, token: string): boolean {
  const entry = tokens.get(sessionId);
  if (!entry) return false;
  if (entry.expiresAt < Date.now()) {
    tokens.delete(sessionId);
    return false;
  }
  return entry.token === token;
}

/**
 * Remove a CSRF token (e.g., on sign-out).
 */
export function revokeToken(sessionId: string): void {
  tokens.delete(sessionId);
}
