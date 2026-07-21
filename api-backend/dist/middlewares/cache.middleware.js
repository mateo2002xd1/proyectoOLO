"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheInterceptor = void 0;
const redis_1 = require("../infrastructure/redis");
/**
 * Returns true when the Redis instance is connected and ready to accept commands.
 * When Redis is down and maxRetriesPerRequest is null (BullMQ requirement),
 * awaiting any command would hang forever, so we must check status first.
 */
function isRedisReady() {
    try {
        const redis = (0, redis_1.getRedis)();
        return redis.status === 'ready';
    }
    catch {
        return false;
    }
}
const cacheInterceptor = (ttlSeconds = 60) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }
        // If Redis is not connected, skip caching entirely to avoid hanging
        if (!isRedisReady()) {
            res.setHeader('X-Cache', 'BYPASS');
            return next();
        }
        const redis = (0, redis_1.getRedis)();
        const cacheKey = `cache:${req.originalUrl || req.url}`;
        try {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                // Send cached data
                res.setHeader('X-Cache', 'HIT');
                res.json(JSON.parse(cachedData));
                return;
            }
            // Intercept res.json to store the response before sending it
            const originalJson = res.json.bind(res);
            res.json = (body) => {
                // Only cache 2xx responses
                if (res.statusCode >= 200 && res.statusCode < 300 && isRedisReady()) {
                    redis.setex(cacheKey, ttlSeconds, JSON.stringify(body)).catch((err) => {
                        console.error('Error setting cache:', err);
                    });
                }
                return originalJson(body);
            };
            res.setHeader('X-Cache', 'MISS');
            next();
        }
        catch (err) {
            console.error('Redis cache error:', err);
            next();
        }
    };
};
exports.cacheInterceptor = cacheInterceptor;
//# sourceMappingURL=cache.middleware.js.map