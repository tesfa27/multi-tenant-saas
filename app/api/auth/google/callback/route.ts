import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionResponse } from "@/lib/auth/session";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
        return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
    }

    // Decode state to get tenant
    let tenantSlug = "";
    try {
        const decoded = JSON.parse(atob(state));
        tenantSlug = decoded.tenant;
    } catch (e) {
        return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }

    // 1. Exchange code for tokens
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: `${appUrl}/api/auth/google/callback`,
            grant_type: "authorization_code",
        }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
        console.error("Google Auth Error:", tokenData);
        return NextResponse.redirect(new URL(`/${tenantSlug}/auth/login?error=google_auth_failed`, req.url));
    }

    // 2. Get User Info
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userRes.json();

    // 3. Find Tenant
    const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
    });

    if (!tenant) {
        return NextResponse.redirect(new URL("/error?msg=InvalidTenant", req.url));
    }

    // 4. Find or Create User
    let user = await prisma.user.findUnique({
        where: {
            tenantId_email: {
                tenantId: tenant.id,
                email: googleUser.email,
            },
        },
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                tenantId: tenant.id,
                email: googleUser.email,
                name: googleUser.name,
                provider: "GOOGLE",
                // Create the membership record as well
                tenantUsers: {
                    create: {
                        tenantId: tenant.id,
                        role: "USER",
                    }
                }
            },
        });
    }

    // 5. Generate Session using helper
    const sessionRes = await createSessionResponse({
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role, // Casting if needed, but Prisma Role enum usually matches string
        name: user.name,
    }, true); // Enable remember me for OAuth

    // 6. Redirect to dashboard with cookies
    const response = NextResponse.redirect(new URL(`/${tenantSlug}`, req.url));

    // Copy cookies from session response to redirect response
    sessionRes.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie);
    });

    return response;
}
