import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  const toUpdate = users.filter((u) => !u.name || u.name === "");
  if (toUpdate.length === 0) {
    console.log("No users need backfilling.");
    return;
  }

  for (const u of toUpdate) {
    const fallback = u.email ? u.email.split("@")[0] : "";
    await prisma.user.update({ where: { id: u.id }, data: { name: fallback } });
  }

  console.log(`Backfilled ${toUpdate.length} user(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
