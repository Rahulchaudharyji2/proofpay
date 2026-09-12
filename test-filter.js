const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tasks = await prisma.task.findMany({
    where: { agent: { ownerAddress: "0xBc5C048B2B469682c7554D0B4566e5F8a3f4F32a" } }
  });
  console.log("Tasks found:", tasks.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
