import { Request, Response, NextFunction } from 'express';
import { getRedis } from '../infrastructure/redis';

/**
 * Returns true when the Redis instance is connected and ready to accept commands.
 * When Redis is down and maxRetriesPerRequest is null (BullMQ requirement),
 * awaiting any command would hang forever, so we must check status first.
 */
function isRedisReady(): boolean {
  try {
    const redis = getRedis();
    return redis.status === 'ready';
  } catch {
    return false;
  }
}

interface CacheOptions {
  /**
   * Cabeceras que cambian la respuesta para una misma URL y por tanto deben entrar
   * en la clave. Sin esto, dos apps que piden la misma ruta con distinto `X-Ambito`
   * se leerían la respuesta la una a la otra.
   */
  varyBy?: string[];
}

export const cacheInterceptor = (ttlSeconds: number = 60, options: CacheOptions = {}) => {
  const varyBy = options.varyBy ?? [];

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // La respuesta depende de estas cabeceras aunque hoy no se cachee: quien esté
    // por delante (navegador, proxy) necesita saberlo igual.
    if (varyBy.length > 0) {
      res.setHeader('Vary', varyBy.join(', '));
    }

    // If Redis is not connected, skip caching entirely to avoid hanging
    if (!isRedisReady()) {
      res.setHeader('X-Cache', 'BYPASS');
      return next();
    }

    const redis = getRedis();
    const variantes = varyBy.map((header) => `${header}=${req.header(header) ?? ''}`).join('|');
    const cacheKey = `cache:${req.originalUrl || req.url}${variantes ? `|${variantes}` : ''}`;

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
        if (res.statusCode >= 200 && res.statusCode < 300 && isRedisReady()) {
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
