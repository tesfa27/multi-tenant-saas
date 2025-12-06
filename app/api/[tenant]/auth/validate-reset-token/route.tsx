import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ tenant: string }> }
) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ valid: false }, { status: 400 });
        }

        const prisma = new PrismaClient();

        // 1. Find token
        // @ts-ignore
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken) {
            return NextResponse.json({ valid: false }, { status: 200 });
        }

        // 2. Check expiration
        if (new Date() > resetToken.expiresAt) {
            return NextResponse.json({ valid: false }, { status: 200 });
        }

        return NextResponse.json({ valid: true }, { status: 200 });

    } catch (err) {
        console.error("Validate token error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
