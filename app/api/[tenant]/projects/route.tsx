import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAccessToken } from "@/lib/auth/getAccessToken";
import { authenticateUser } from "@/lib/auth/authenticate";
import { requireTenant } from "@/lib/auth/requireTenant";
import { requireRole } from "@/lib/auth/roles";
import { getTenantUserRole } from "@/lib/auth/getTenantUserRole";

const prisma = new PrismaClient();

/* ===========================================
   POST — Create Project (ROLES: OWNER, ADMIN)
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
        return NextResponse.json({ error: "Missing access token" }, { status: 401 });
       }

    // Authenticate user
    const user = authenticateUser(accessToken);
     if (!user) {
     return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Validate tenant
    const tenantRecord = await requireTenant(tenant);
    if (!tenantRecord) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Verify membership & Get Role in this Tenant
    const tenantRole = await getTenantUserRole(user.id, tenantRecord.id);
    if (!tenantRole) {
      return NextResponse.json({ error: "Unauthorized Access to Tenant" }, { status: 403 });
    }

    // Check role
    try {
      requireRole(tenantRole, ["OWNER", "ADMIN"]);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }

    // Validate body
    const body = await req.json();
    const { name, description } = body ?? {};

    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }


    // Create new project
    const project = await prisma.project.create({
      data: {
        tenantId: tenantRecord.id,
        name,
        description,
      },
    });

    return NextResponse.json({ message: "Project created", project }, { status: 201 });
  } catch (err) {
    console.error("Create project error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ===========================================
   GET — List Projects (ROLES: ALL AUTH USERS)
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
        return NextResponse.json({ error: "Missing access token" }, { status: 401 });
       }

    // Verify JWT
    const user = authenticateUser(accessToken);
     if (!user) {
     return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    
    // Validate tenant
    const tenantRecord = await requireTenant(tenant);
    if (!tenantRecord) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Verify membership
    const tenantRole = await getTenantUserRole(user.id, tenantRecord.id);
    if (!tenantRole) {
      return NextResponse.json({ error: "Unauthorized Access to Tenant" }, { status: 403 });
    }


    // Pagination
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    // Query projects
    const projects = await prisma.project.findMany({
      where: { tenantId: tenantRecord.id },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.project.count({
      where: { tenantId: tenantRecord.id },
    });

    return NextResponse.json(
      {
        projects,
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
    console.error("List projects error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
