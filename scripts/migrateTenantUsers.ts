import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting tenant user migration...");

  // Get all existing users
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users.`);

  for (const user of users) {
    try {
      // Check if membership already exists
      const exists = await prisma.tenantUser.findUnique({
        where: {
          tenantId_userId: {
            tenantId: user.tenantId,
            userId: user.id,
          },
        },
      });

      if (exists) {
        console.log(`⏩ Skipped user ${user.email} (already migrated)`);
        continue;
      }

      // Create membership
      await prisma.tenantUser.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          role: user.role ?? "USER",
        },
      });

      console.log(`✅ Migrated ${user.email} → tenantUser`);
    } catch (err) {
      console.error(`❌ Failed to migrate user ${user.email}:`, err);
    }
  }

  console.log("🎉 Migration complete.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
