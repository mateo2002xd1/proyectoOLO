"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateCache = void 0;
const redis_1 = require("../infrastructure/redis");
/**
 * Invalidates keys matching a pattern.
 * Uses SCAN instead of KEYS for production safety.
 * @param pattern The pattern to invalidate, e.g. "cache:/api/paginas/publica/*"
 */
const invalidateCache = async (pattern) => {
    const redis = (0, redis_1.getRedis)();
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
exports.invalidateCache = invalidateCache;
//# sourceMappingURL=cache.utils.js.map