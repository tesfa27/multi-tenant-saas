import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { createSessionResponse } from "@/lib/auth/session";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ tenant: string }> }
) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        const key = `magic_link:${token}`;

        // 1. Get Token from Redis
        const data = await redis.get(key);

        if (!data) {
            return NextResponse.json({ error: "Invalid or expired magic link" }, { status: 401 });
        }

        // 2. Parse Data
        const { userId } = JSON.parse(data);

        // 3. Delete Token (Single Use Security)
        await redis.del(key);

        // 4. Find User
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 5. Generate Session and Return
        return await createSessionResponse(user, false);

    } catch (error) {
        console.error("Magic Link Verification Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
