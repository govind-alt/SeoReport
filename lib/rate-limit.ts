/**
 * Simple in-memory rate limiter for login attempts.
 * Limits each IP + email combination to MAX_ATTEMPTS within WINDOW_MS.
 *
 * For production, swap this with Redis / Upstash.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

// Module-level map persists across requests within the same server process.
const attempts = new Map<string, AttemptRecord>();

function getKey(identifier: string): string {
  return identifier.toLowerCase().trim();
}

/**
 * Record a failed attempt.
 * @returns true if the identifier is now rate-limited (too many failures).
 */
export function recordFailedAttempt(identifier: string): boolean {
  const key = getKey(identifier);
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    // First attempt (or window expired)
    attempts.set(key, { count: 1, firstAttempt: now });
    return false;
  }

  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + WINDOW_MS;
    attempts.set(key, record);
    return true; // rate-limited
  }

  attempts.set(key, record);
  return false;
}

/**
 * Check if identifier is currently rate-limited.
 * @returns { limited: boolean, remaining?: number } — seconds until unlock.
 */
export function isRateLimited(identifier: string): { limited: boolean; remainingSeconds?: number } {
  const key = getKey(identifier);
  const now = Date.now();
  const record = attempts.get(key);

  if (!record) return { limited: false };

  // Window expired — clean up
  if (now - record.firstAttempt > WINDOW_MS) {
    attempts.delete(key);
    return { limited: false };
  }

  if (record.lockedUntil && now < record.lockedUntil) {
    return {
      limited: true,
      remainingSeconds: Math.ceil((record.lockedUntil - now) / 1000),
    };
  }

  return { limited: false };
}

/**
 * Clear the rate-limit record on successful login.
 */
export function clearAttempts(identifier: string): void {
  attempts.delete(getKey(identifier));
}
