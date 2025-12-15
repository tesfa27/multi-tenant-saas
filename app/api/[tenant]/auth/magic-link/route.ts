
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setex } from "@/lib/redis";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";
import * as React from 'react';
import MagicLinkEmail from '@/components/emails/magic-link-email';


export async function POST(
    req: Request,
    { params }: { params: Promise<{ tenant: string }> }
) {
    try {
        const resolvedParams = await params;
        const tenantSlug = resolvedParams.tenant;
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // 1. Find Tenant
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
        }

        // 2. Find User
        const user = await prisma.user.findUnique({
            where: { tenantId_email: { tenantId: tenant.id, email } }
        });

        if (!user) {
            // Security: Always return success message in prod to prevent enumeration
            if (process.env.NODE_ENV === 'production') {
                return NextResponse.json({ message: "If an account exists, a login link has been sent." });
            }
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 3. Generate Crypto Token
        const token = crypto.randomBytes(32).toString('hex');
        const key = `magic_link:${token}`;
        const payload = JSON.stringify({ userId: user.id });

        // 4. Store in Redis (15 minutes = 900 seconds)
        await setex(key, 900, payload);

        // 5. Send Email
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.URL || "http://localhost:3000";
        const verificationUrl = `${baseUrl}/${tenantSlug}/auth/verify?token=${token}`;

        await sendEmail(email, {
            subject: "Sign in to SaaS",
            react: React.createElement(MagicLinkEmail, { url: verificationUrl })
        });

        return NextResponse.json({ message: "Magic link sent successfully" });

    } catch (error) {
        console.error("Magic Link Request Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
