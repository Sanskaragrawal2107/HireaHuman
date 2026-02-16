/**
 * Production-safe logger utility.
 * Suppresses debug/info logs in production builds.
 * Only error-level logs pass through in production.
 */

const isDev = import.meta.env.DEV;

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) console.debug('[DEBUG]', ...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info('[INFO]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    // Errors always log — but strip stack traces in production
    if (isDev) {
      console.error('[ERROR]', ...args);
    } else {
      // In production, log minimal info (no user data / tokens)
      const sanitized = args.map((a) =>
        a instanceof Error ? a.message : typeof a === 'string' ? a : '[object]'
      );
      console.error('[ERROR]', ...sanitized);
    }
  },
};
