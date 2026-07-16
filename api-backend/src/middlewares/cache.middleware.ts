import { Request, Response, NextFunction } from 'express';
import { getRedis } from '../infrastructure/redis';

export const cacheInterceptor = (ttlSeconds: number = 60) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const redis = getRedis();
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
      res.json = (body: any) => {
        // Only cache 2xx responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis.setex(cacheKey, ttlSeconds, JSON.stringify(body)).catch((err) => {
            console.error('Error setting cache:', err);
          });
        }
        return originalJson(body);
      };

      res.setHeader('X-Cache', 'MISS');
      next();
    } catch (err) {
      console.error('Redis cache error:', err);
      next();
    }
  };
};
