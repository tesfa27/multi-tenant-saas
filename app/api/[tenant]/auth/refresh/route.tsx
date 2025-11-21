import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs"; // requested import
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/jwt";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { tenant } = await params;

    // read refresh token cookie
    const cookieHeader = req.headers.get("cookie") || "";
    const refreshToken =
      cookieHeader
        .split("; ")
        .find((c) => c.startsWith("refreshToken="))
        ?.split("=")[1] || null;

    if (!refreshToken) {
      return NextResponse.json({ error: "Missing refresh token" }, { status: 401 });
    }

    // verify JWT
    let payload: any;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    // check if token exists in DB
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || !stored.user) {
      return NextResponse.json({ error: "Refresh token not recognized" }, { status: 401 });
    }

    // check expiration
    if (stored.expiresAt < new Date()) {
      return NextResponse.json({ error: "Refresh token expired" }, { status: 401 });
    }

    // ROTATION: delete old refresh token
    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    // create new tokens
    const newAccessToken = signAccessToken({
      id: stored.user.id,
      email: stored.user.email,
      tenantId: stored.user.tenantId,
      role: stored.user.role,
    });

    const newRefreshToken = signRefreshToken({
      id: stored.user.id,
      email: stored.user.email,
      tenantId: stored.user.tenantId,
      role: stored.user.role,
    });

    // store new refresh token in DB
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: stored.user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });

    // Return new tokens as cookies
    const res = NextResponse.json({ message: "Token rotated" });

    res.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 15,
    });

    res.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
