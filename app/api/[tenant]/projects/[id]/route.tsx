import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAccessToken } from "@/lib/auth/getAccessToken";
import { authenticateUser } from "@/lib/auth/authenticate";
import { requireTenant } from "@/lib/auth/requireTenant";
import { requireRole } from "@/lib/auth/roles";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  try {
    const resolvedParams = await params;
    const tenantSlug = resolvedParams.tenant;
    const projectId = resolvedParams.id;

    if (!tenantSlug || !projectId) {
      return NextResponse.json(
        { error: "Missing tenant or project ID" },
        { status: 400 }
      );
    }

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

    // Find tenant
    const tenant = await requireTenant(tenantSlug);
    if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

    // Fetch project, ensure belongs to tenant
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId: tenant.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project }, { status: 200 });
  } catch (err) {
    console.error("Get single project error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ===========================================
   PUT — UPDATE Project (ROLES: OWNER, ADMIN)
=========================================== */

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  try {
    const resolvedParams = await params;
    const tenantSlug = resolvedParams.tenant;
    const projectId = resolvedParams.id;

    // 1. Validate tenant
    const tenant = await requireTenant(tenantSlug);
    if (!tenant) {
      return NextResponse.json(
        { error: "Invalid tenant" },
        { status: 404 }
      );
    }

    // 2. Extract access token
    const token = getAccessToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Missing access token" },
        { status: 401 }
      );
    }

    // 3. Verify user
    const user = await authenticateUser(token);

    // 4. Require role (OWNER or ADMIN)
    requireRole(user.role, ["OWNER", "ADMIN"]);

    // 5. Validate project belongs to tenant
    const existing = await prisma.project.findUnique({
      where: { id: projectId, tenantId: tenant.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // 6. Parse request body
    const body = await req.json();
    const { name, description } = body;

    // 7. Update project
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update project" },
      { status: 400 }
    );
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  try {
    const resolvedParams = await params;
    const tenantSlug = resolvedParams.tenant;
    const projectId = resolvedParams.id;

    // 1. Validate tenant
    const tenant = await requireTenant(tenantSlug);
    if (!tenant) {
      return NextResponse.json(
        { error: "Invalid tenant" },
        { status: 404 }
      );
    }

    // 2. Extract access token
    const token = getAccessToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Missing access token" },
        { status: 401 }
      );
    }

    // 3. Verify user identity
    const user = await authenticateUser(token);

    // 4. Require role (OWNER or ADMIN)
    requireRole(user.role, ["OWNER", "ADMIN"]);

    // 5. Validate project belongs to tenant
    const existing = await prisma.project.findUnique({
      where: { id: projectId, tenantId: tenant.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // 6. Delete project
    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json(
      { message: "Project deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete project" },
      { status: 400 }
    );
  }
}