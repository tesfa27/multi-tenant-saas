import Redis from 'ioredis';

const getRedisUrl = () => {
    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }
    return 'redis://localhost:6379';
};

const globalForRedis = global as unknown as { redis: Redis };

export const redis =
    globalForRedis.redis ||
    new Redis(getRedisUrl());

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

/**
 * Helper to store keys with an expiration
 * @param key The key to store
 * @param ttl Time to live in seconds
 * @param value The value to store
 */
export const setex = async (key: string, ttl: number, value: string | number) => {
    return await redis.setex(key, ttl, value);
};
