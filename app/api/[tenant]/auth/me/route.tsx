import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyAccessToken } from "@/lib/jwt";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const resolvedParams = await params;
    const tenantSlug = resolvedParams.tenant;

    // 1. Validate tenant slug
    if (!tenantSlug) {
      return NextResponse.json({ error: "Missing tenant slug" }, { status: 400 });
    }

    // 2. Read the access token from cookies
    const accessToken = req.cookies.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "No access token" }, { status: 401 });
    }

    // 3. Verify the token using your existing function
    let decoded: any;
    try {
      decoded = verifyAccessToken(accessToken);
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // 4. Token is valid — now check if the user still exists under this tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email: decoded.email } },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 5. Success → return user info
    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("ME endpoint error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
