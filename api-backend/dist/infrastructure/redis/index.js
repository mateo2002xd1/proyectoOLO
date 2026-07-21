"use strict";
// Infrastructure - Redis
// Stub: Implementar conexión ioredis aquí
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
let redis = null;
const getRedis = () => {
    if (!redis) {
        redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
            maxRetriesPerRequest: null, // Required by BullMQ
        });
        redis.on('error', (err) => {
            console.error(`[Redis Error]:`, err.message);
        });
    }
    return redis;
};
exports.getRedis = getRedis;
//# sourceMappingURL=index.js.map