// Infrastructure - Redis

import Redis from 'ioredis';

let redis: Redis | null = null;

// Evita inundar la consola con el mismo error de conexión en cada reintento
// (p. ej. cuando Redis no está levantado en desarrollo local).
export const crearLoggerDeErrorConThrottle = (etiqueta: string, intervaloMs = 30000) => {
  let ultimoLog = 0;
  return (err: Error) => {
    const ahora = Date.now();
    if (ahora - ultimoLog > intervaloMs) {
      console.error(`[${etiqueta}] (Posible fallo de Redis):`, err.message);
      ultimoLog = ahora;
    }
  };
};

export const getRedis = () => {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null, // Required by BullMQ
      retryStrategy: (times) => Math.min(times * 500, 10000),
    });
    redis.on('error', crearLoggerDeErrorConThrottle('Redis Error'));
  }
  return redis;
};

/**
 * ¿Se puede hablar con Redis ahora mismo?
 *
 * Hay que preguntarlo antes de cada comando, y no solo al arrancar: con
 * `maxRetriesPerRequest: null` —que BullMQ exige— un comando enviado con Redis caído
 * no falla, se queda esperando para siempre. Esta comprobación es lo que evita que una
 * petición HTTP se cuelgue por culpa de una caché que ni siquiera es obligatoria.
 */
export const redisEstaListo = (): boolean => {
  try {
    return getRedis().status === 'ready';
  } catch {
    return false;
  }
};

/**
 * Borra todas las claves que casen con un patrón. Devuelve cuántas borró.
 *
 * Va con SCAN y no con KEYS porque KEYS recorre el keyspace entero bloqueando a Redis
 * mientras lo hace, y esto se llama desde dentro de una petición que alguien está
 * esperando: aprobar una página no puede congelar al resto de la aplicación.
 *
 * Con Redis caído devuelve 0 sin lanzar. No tener caché que invalidar no es un fallo
 * de quien publica — es exactamente lo que pasa en desarrollo local, donde
 * `cacheInterceptor` ya responde `X-Cache: BYPASS`.
 */
export const borrarClavesPorPatron = async (patron: string): Promise<number> => {
  if (!redisEstaListo()) return 0;

  const cliente = getRedis();
  let cursor = '0';
  let borradas = 0;

  do {
    const [siguiente, lote] = await cliente.scan(cursor, 'MATCH', patron, 'COUNT', 200);
    cursor = siguiente;
    // SCAN puede devolver lotes vacíos aunque queden claves por recorrer: es normal y
    // no significa que se haya terminado. Lo que marca el final es el cursor en '0'.
    if (lote.length > 0) borradas += await cliente.del(...lote);
  } while (cursor !== '0');

  return borradas;
};
