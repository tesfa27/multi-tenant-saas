
import { NextResponse } from 'next/server';
import { redis, setex } from '@/lib/redis';

export async function GET() {
    try {
        const key = 'test-redis-key';
        const value = 'Redis is working securely!';
        const ttl = 60; // 60 seconds

        // 1. Test setex
        await setex(key, ttl, value);

        // 2. Test get
        const retrievedValue = await redis.get(key);

        // 3. Test TTL (approximate)
        const currentTtl = await redis.ttl(key);

        return NextResponse.json({
            success: true,
            message: 'Redis connection authenticated and authenticated',
            testResults: {
                key,
                originalValue: value,
                retrievedValue,
                match: value === retrievedValue,
                ttlRemaining: currentTtl
            }
        });
    } catch (error) {
        console.error('Redis Test Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to connect to Redis',
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
