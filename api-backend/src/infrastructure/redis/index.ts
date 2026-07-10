// Infrastructure - Redis
// Stub: Implementar conexión ioredis aquí

import Redis from 'ioredis';

let redis: Redis | null = null;

export const getRedis = () => {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }
  return redis;
};
