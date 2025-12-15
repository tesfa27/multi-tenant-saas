import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { tenant: tenantSlug } = await params;

    if (!tenantSlug) {
      return NextResponse.json(
        { error: "Missing tenant slug" },
        { status: 400 }
      );
    }

    // Extract refresh token from cookie
    const cookieHeader = req.headers.get("cookie") || "";
    const refreshToken =
      cookieHeader
        .split("; ")
        .find((c) => c.startsWith("refreshToken="))
        ?.split("=")[1] || null;

    if (refreshToken) {
      // Delete token from DB (invalidate)
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    const res = NextResponse.json({ message: "Logged out" });

    // Clear cookies
    res.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    res.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
