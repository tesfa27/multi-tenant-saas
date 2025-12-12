import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { getAccessToken } from "@/lib/auth/getAccessToken";
import { authenticateUser } from "@/lib/auth/authenticate";
import { requireTenant } from "@/lib/auth/requireTenant";
import { requireRole } from "@/lib/auth/roles";
import { getTenantUserRole } from "@/lib/auth/getTenantUserRole";



/* ===========================================
   POST — Add Member (ROLES: OWNER, ADMIN)
=========================================== */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { tenant } = await params;

    // Extract access token
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing access token" },
        { status: 401 }
      );
    }

    // Authenticate user
    const user = authenticateUser(accessToken);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Validate tenant
    const tenantRecord = await requireTenant(tenant);
    if (!tenantRecord) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    // Verify membership & Get Role in this Tenant
    const tenantRole = await getTenantUserRole(user.id, tenantRecord.id);
    if (!tenantRole) {
      return NextResponse.json(
        { error: "Unauthorized Access to Tenant" },
        { status: 403 }
      );
    }


    // Check role
    try {
      requireRole(tenantRole, ["OWNER", "ADMIN"]);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }

    // Validate request body
    const body = await req.json();
    const { email, role } = body ?? {};

    if (!email || !role) {
      return NextResponse.json(
        { error: "email and role are required" },
        { status: 400 }
      );
    }


    // Lookup user inside this tenant
    const targetUser = await prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: tenantRecord.id,
          email,
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User does not exist in this tenant" },
        { status: 404 }
      );
    }

    // Prevent duplicate membership
    const existing = await prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId: tenantRecord.id,
          userId: targetUser.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already a member of this tenant" },
        { status: 400 }
      );
    }

    // Create membership
    const membership = await prisma.tenantUser.create({
      data: {
        tenantId: tenantRecord.id,
        userId: targetUser.id,
        role,
      },
    });

    return NextResponse.json(
      { message: "Member added", membership },
      { status: 201 }
    );
  } catch (err) {
    console.error("Add member error:", err);
    return NextResponse.json(
        { error: "Server error" },
        { status: 500 }
    );
  }
}

/* ===========================================
   GET — List Members (ROLES: ALL AUTH USERS)
=========================================== */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { tenant } = await params;

    // Extract access token
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing access token" },
        { status: 401 }
      );
    }

    // Authenticate user
    const user = authenticateUser(accessToken);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Validate tenant
    const tenantRecord = await requireTenant(tenant);
    if (!tenantRecord) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    // Verify membership
    const membership = await prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId: tenantRecord.id,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this tenant" },
        { status: 403 }
      );
    }

    // Pagination
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    // Fetch members
    const members = await prisma.tenantUser.findMany({
      where: { tenantId: tenantRecord.id },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.tenantUser.count({
      where: { tenantId: tenantRecord.id },
    });

    return NextResponse.json(
       {
        members,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("List members error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
