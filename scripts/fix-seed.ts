import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function run() {
  await prisma.providerService.deleteMany();
  await prisma.securityEvent.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.task.deleteMany();
  await prisma.providerMetric.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.mandate.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.service.deleteMany();
  console.log("Deleted all data");
}
run();
