import { Request, Response, NextFunction } from 'express';
import { getRedis, redisEstaListo } from '../infrastructure/redis';

// `redisEstaListo` vive en `infrastructure/redis` y no aquí: la invalidación al
// publicar necesita la misma comprobación, y dos copias de un predicado como este se
// separan en cuanto alguien toca una..
const isRedisReady = redisEstaListo;

interface CacheOptions {
  /**
   * Cabeceras que cambian la respuesta para una misma URL y por tanto deben entrar
   * en la clave. Sin esto, dos apps que piden la misma ruta con distinto `X-Ambito`
   * se leerían la respuesta la una a la otra.
   */
  varyBy?: string[];
  /**
   * Parámetros de querystring que el controlador **de verdad lee**. Solo estos entran
   * en la clave; el resto se ignora.
   *
   * Es una lista blanca y no una lista negra por una razón concreta: la clave se
   * construía con `req.originalUrl` entera, querystring incluida, así que
   * `?cachebust=1`, `?cachebust=2`… generaban claves distintas hasta el infinito.
   * Cada una era un fallo de caché —consulta a la base— **y** una entrada nueva en
   * Redis con su TTL: un atacante no autenticado convertía la caché en un
   * amplificador contra la base y en un agotamiento de memoria a la vez.
   *
   * Ignorar lo desconocido cierra las dos cosas de golpe, porque `?cachebust=N` pasa a
   * resolver a la misma clave que la petición sin parámetros. A cambio, **toda**
   * variable que el handler consulte tiene que estar declarada aquí, o dos respuestas
   * distintas compartirían entrada.
   */
  paramsPermitidos?: string[];
}

export const cacheInterceptor = (ttlSeconds: number = 60, options: CacheOptions = {}) => {
  const varyBy = options.varyBy ?? [];
  const paramsPermitidos = options.paramsPermitidos ?? [];

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

    // Un parámetro permitido puede llegar como array u objeto si el cliente lo repite
    // (`?a=1&a=2`) o lo anida (`?a[b]=1`). El handler recibiría algo distinto de una
    // cadena, así que meterlo en la clave aplanado juntaría respuestas que no son la
    // misma. Es tan raro que no compensa modelarlo: se sirve sin caché.
    const parametros: string[] = [];
    for (const nombre of paramsPermitidos) {
      const valor = req.query[nombre];
      if (valor === undefined) continue;
      if (typeof valor !== 'string') {
        res.setHeader('X-Cache', 'BYPASS');
        return next();
      }
      parametros.push(`${nombre}=${valor}`);
    }

    const redis = getRedis();
    const variantes = varyBy.map((header) => `${header}=${req.header(header) ?? ''}`).join('|');
    // `baseUrl + path` en vez de `originalUrl`: es la misma ruta sin la querystring.
    const ruta = `${req.baseUrl}${req.path}`;
    const consulta = parametros.sort().join('&');
    const cacheKey =
      `cache:${ruta}` +
      `${consulta ? `?${consulta}` : ''}` +
      `${variantes ? `|${variantes}` : ''}`;

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
