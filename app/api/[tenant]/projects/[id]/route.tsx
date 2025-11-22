import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAccessToken } from "@/lib/auth/getAccessToken";
import { authenticateUser } from "@/lib/auth/authenticate";
import { requireTenant } from "@/lib/auth/requireTenant";

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
