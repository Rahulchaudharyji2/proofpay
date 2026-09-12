const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const task = await prisma.task.findUnique({
    where: { id: 'ae76e5ac-95b9-45f8-b8be-b728664720b7' },
    include: { agent: true }
  });
  console.log(JSON.stringify(task, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
