import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccessToken } from "@/lib/auth/getAccessToken";
import { authenticateUser } from "@/lib/auth/authenticate";
import { requireTenant } from "@/lib/auth/requireTenant";
import { requireRole } from "@/lib/auth/roles";
import { getTenantUserRole } from "@/lib/auth/getTenantUserRole";



/* ===========================================
   PUT — Update Member Role (ROLES: OWNER, ADMIN)
=========================================== */
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ tenant: string; id: string }> }
) {
    try {
        const { tenant, id: membershipId } = await params;

        // 1. Authenticate
        const accessToken = getAccessToken(req);
        if (!accessToken) return NextResponse.json({ error: "Missing access token" }, { status: 401 });

        const user = authenticateUser(accessToken);
        if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        // 2. Validate Tenant
        const tenantRecord = await requireTenant(tenant);
        if (!tenantRecord) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

        // 3. Verify Requester's Permissions (Must be OWNER or ADMIN in this tenant)
        const requesterRole = await getTenantUserRole(user.id, tenantRecord.id);
        if (!requesterRole) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        try {
            requireRole(requesterRole, ["OWNER", "ADMIN"]);
        } catch (e: any) {
            return NextResponse.json({ error: e.message }, { status: 403 });
        }

        // 4. Parse Body
        const body = await req.json();
        const { role } = body;
        if (!role || !["OWNER", "ADMIN", "USER"].includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        // 5. Check if target membership exists and belongs to this tenant
        const targetMembership = await prisma.tenantUser.findUnique({
            where: { id: membershipId },
        });

        if (!targetMembership || targetMembership.tenantId !== tenantRecord.id) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        // 6. Prevent modifying own role (optional safety, but good practice)
        if (targetMembership.userId === user.id) {
            return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
        }

        // 7. Update Role
        const updatedMember = await prisma.tenantUser.update({
            where: { id: membershipId },
            data: { role },
        });

        return NextResponse.json({ message: "Role updated", member: updatedMember }, { status: 200 });
    } catch (err) {
        console.error("Update member error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

/* ===========================================
   DELETE — Remove Member (ROLES: OWNER, ADMIN)
=========================================== */
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ tenant: string; id: string }> }
) {
    try {
        const { tenant, id: membershipId } = await params;

        // 1. Authenticate
        const accessToken = getAccessToken(req);
        if (!accessToken) return NextResponse.json({ error: "Missing access token" }, { status: 401 });

        const user = authenticateUser(accessToken);
        if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        // 2. Validate Tenant
        const tenantRecord = await requireTenant(tenant);
        if (!tenantRecord) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

        // 3. Verify Requester's Permissions
        const requesterRole = await getTenantUserRole(user.id, tenantRecord.id);
        if (!requesterRole) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        try {
            requireRole(requesterRole, ["OWNER", "ADMIN"]);
        } catch (e: any) {
            return NextResponse.json({ error: e.message }, { status: 403 });
        }

        // 4. Check target membership
        const targetMembership = await prisma.tenantUser.findUnique({
            where: { id: membershipId },
        });

        if (!targetMembership || targetMembership.tenantId !== tenantRecord.id) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        // 5. Prevent deleting self (must leave instead)
        if (targetMembership.userId === user.id) {
            return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
        }

        // 6. Delete Membership
        await prisma.tenantUser.delete({
            where: { id: membershipId },
        });

        return NextResponse.json({ message: "Member removed" }, { status: 200 });
    } catch (err) {
        console.error("Remove member error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
