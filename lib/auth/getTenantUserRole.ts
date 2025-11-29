import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getTenantUserRole(userId: string, tenantId: string) {
  const membership = await prisma.tenantUser.findUnique({
    where: {
      tenantId_userId: {
        tenantId,
        userId,
      },
    },
  });

  return membership?.role || null;
}
