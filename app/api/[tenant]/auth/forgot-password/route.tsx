import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

export async function POST(
    req: Request,
    { params }: { params: Promise<{ tenant: string }> }
) {
    try {
        const resolvedParams = await params;
        const tenantSlug = resolvedParams.tenant;
        const { email } = await req.json();

        if (!tenantSlug || !email) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Find tenant
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });

        if (!tenant) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { tenantId_email: { tenantId: tenant.id, email } },
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json(
                { message: "If an account exists, a reset link has been sent." },
                { status: 200 }
            );
        }

        // Generate reset token
        const token = randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

        // Store token in DB
        // @ts-ignore
        await prisma.passwordResetToken.create({
            data: {
                email,
                token,
                expiresAt,
            },
        });

        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/${tenantSlug}/reset-password?token=${token}`;
        console.log(`[MOCK EMAIL] Reset link for ${email}: ${resetLink}`);

        return NextResponse.json(
            { message: "If an account exists, a reset link has been sent." },
            { status: 200 }
        );

    } catch (err) {
        console.error("Forgot password error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
