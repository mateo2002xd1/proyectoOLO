/**
 * Invalidates keys matching a pattern.
 * Uses SCAN instead of KEYS for production safety.
 * @param pattern The pattern to invalidate, e.g. "cache:/api/paginas/publica/*"
 */
export declare const invalidateCache: (pattern: string) => Promise<void>;
//# sourceMappingURL=cache.utils.d.ts.map