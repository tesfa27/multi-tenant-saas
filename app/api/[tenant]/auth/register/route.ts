import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";


export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log("params:", resolvedParams); // Debug log
    const tenantSlug = resolvedParams.tenant;
    const body = await req.json();
    const { email, password, name } = body ?? {};

    // basic validation
    if (!tenantSlug) {
      return NextResponse.json({ error: "Missing tenant slug in URL" }, { status: 400 });
    }
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // find tenant by slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // check if user email exists already in same tenant
    const existing = await prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already exists for this tenant" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create the user
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email,
        passwordHash,
        name,
        role: "USER",
      },
      select: { id: true, email: true, name: true, tenantId: true, createdAt: true },
    });

    // Create M2M membership entry in tenantUser
    await prisma.tenantUser.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        role: "USER", // membership role
      },
    });

    return NextResponse.json(
      { message: "User created", user },
      { status: 201 }
    );

  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
