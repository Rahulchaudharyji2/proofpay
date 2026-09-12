import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const agents = await prisma.agent.findMany();
  console.log("Agents in DB:", agents);
}
main().catch(console.error).finally(() => prisma.$disconnect());
