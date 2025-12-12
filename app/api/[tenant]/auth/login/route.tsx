import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { createSessionResponse } from "@/lib/auth/session";


export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const resolvedParams = await params;
    const tenantSlug = resolvedParams.tenant;

    const { email, password, rememberMe } = await req.json();

    if (!tenantSlug) {
      return NextResponse.json({ error: "Missing tenant slug" }, { status: 400 });
    }
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // find tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug }
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // find user
    const user = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email } }
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // compare password
    const valid = await compare(password, user.passwordHash!);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    return await createSessionResponse(user, rememberMe);
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
