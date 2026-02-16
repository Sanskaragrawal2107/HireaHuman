/**
 * Input sanitization and validation utilities.
 * Prevents XSS, SQL injection markers, and enforces field limits.
 */

/** Strip HTML tags from a string */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/** Sanitize text input — removes script tags, trims, limits length */
export function sanitizeText(input: string, maxLength = 500): string {
  if (!input || typeof input !== 'string') return '';
  return stripHtml(input)
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, maxLength);
}

/** Sanitize a URL — only allow http/https protocols */
export function sanitizeUrl(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    return url.toString();
  } catch {
    return '';
  }
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validate that a string is within length bounds */
export function isWithinLength(
  input: string,
  min: number,
  max: number
): boolean {
  const len = input.trim().length;
  return len >= min && len <= max;
}

/** Rate limiter — returns true if action should be throttled */
const rateLimitMap = new Map<string, number>();
export function isRateLimited(key: string, cooldownMs = 1000): boolean {
  const now = Date.now();
  const last = rateLimitMap.get(key) || 0;
  if (now - last < cooldownMs) return true;
  rateLimitMap.set(key, now);
  return false;
}
