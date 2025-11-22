import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyAccessToken } from "@/lib/jwt";

const prisma = new PrismaClient();

// Role-based helper
function checkRole(userRole: string) {
  if (userRole !== "OWNER" && userRole !== "ADMIN") {
    throw new Error("Forbidden: insufficient role");
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const resolvedParams = await params;
    const tenantSlug =resolvedParams.tenant;
    const body = await req.json();
    const { name, description } = body ?? {};

    if (!tenantSlug) {
      return NextResponse.json({ error: "Missing tenant slug" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    // Get access token from cookies
    const cookieHeader = req.headers.get("cookie") || "";
    const accessToken = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("accessToken="))
      ?.split("=")[1];

    if (!accessToken) {
      return NextResponse.json({ error: "Missing access token" }, { status: 401 });
    }

    // Verify token
    let payload: any;
    try {
      payload = verifyAccessToken(accessToken);
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Check if user role is allowed
    try {
      checkRole(payload.role);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        tenantId: tenant.id,
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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const resolvedParams = await params;
    const tenantSlug = resolvedParams.tenant;
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    const skip = (page - 1) * limit;

    if (!tenantSlug) {
      return NextResponse.json({ error: "Missing tenant slug" }, { status: 400 });
    }

    // Get access token from cookies
    const cookieHeader = req.headers.get("cookie") || "";
    const accessToken = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("accessToken="))
      ?.split("=")[1];

    if (!accessToken) {
      return NextResponse.json({ error: "Missing access token" }, { status: 401 });
    }

    // Verify token
    let payload: any;
    try {
      payload = verifyAccessToken(accessToken);
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // List projects under this tenant
    const projects = await prisma.project.findMany({
      where: { tenantId: tenant.id },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // count total projects
    const total = await prisma.project.count({
      where: { tenantId: tenant.id },
    });

    return NextResponse.json({ projects,page,limit,total,totalPages: Math.ceil(total / limit), }, { status: 200 });
  } catch (err) {
    console.error("List projects error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
