import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function requireTenant(slug: string) {
  if (!slug) return null;
  return prisma.tenant.findUnique({ where: { slug } });
}