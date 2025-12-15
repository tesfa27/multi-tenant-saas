import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ tenant: string }> }
) {
    try {
        const resolvedParams = await params;
        const tenantSlug = resolvedParams.tenant;
        const { token, password } = await req.json();

        if (!tenantSlug || !token || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const { hash } = require("bcryptjs");

        // 1. Find the token
        // @ts-ignore - ignoring potential type error if client isn't generated
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        // 2. Check if expired
        if (new Date() > resetToken.expiresAt) {
            return NextResponse.json({ error: "Token has expired" }, { status: 400 });
        }

        // 3. Find tenant
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
        }

        // 4. Update user password
        const hashedPassword = await hash(password, 10);

        await prisma.user.update({
            where: {
                tenantId_email: {
                    tenantId: tenant.id,
                    email: resetToken.email
                }
            },
            data: { passwordHash: hashedPassword },
        });

        // 5. Delete the token
        // @ts-ignore
        await prisma.passwordResetToken.delete({
            where: { id: resetToken.id },
        });

        return NextResponse.json(
            { message: "Password has been reset successfully." },
            { status: 200 }
        );

    } catch (err) {
        console.error("Reset password error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
