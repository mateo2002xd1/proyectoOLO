// Infrastructure - Redis
// Stub: Implementar conexión ioredis aquí

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
