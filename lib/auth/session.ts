
import { NextResponse } from "next/server";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export interface UserSessionData {
    id: string;
    email: string;
    tenantId: string;
    role: string;
    name: string | null;
}

/**
 * Generates tokens, saves refresh token to DB, and returns a response with cookies.
 */
export async function createSessionResponse(
    user: UserSessionData,
    rememberMe: boolean = false
): Promise<NextResponse> {

    // JWT Payload (keep it minimal)
    const payload = {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
    };

    // Calculate expiration
    // 30 days if remembered, 7 days if not
    const refreshMaxAge = rememberMe
        ? 60 * 60 * 24 * 30
        : 60 * 60 * 24 * 7;

    // Generate tokens
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Store in DB (Revoke old tokens for this user to prevent accumulation/reuse security issues)
    // Note: In some multi-device scenarios you might not want to delete *all*, 
    // but for now strict security is better.
    await prisma.refreshToken.deleteMany({
        where: { userId: user.id }
    });

    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + refreshMaxAge * 1000),
        }
    });

    // Create JSON response
    const res = NextResponse.json(
        {
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            }
        },
        { status: 200 }
    );

    // Set Cookies
    res.cookies.set("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 15, // 15 min
    });

    res.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: refreshMaxAge,
    });

    return res;
}
