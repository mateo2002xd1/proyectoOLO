import { getRedis } from '../infrastructure/redis';

/**
 * Invalidates keys matching a pattern.
 * Uses SCAN instead of KEYS for production safety.
 * @param pattern The pattern to invalidate, e.g. "cache:/api/paginas/publica/*"
 */
export const invalidateCache = async (pattern: string): Promise<void> => {
  const redis = getRedis();
  let cursor = '0';
  do {
    const res = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', '100');
    cursor = res[0];
    const keys = res[1];
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } while (cursor !== '0');
};
