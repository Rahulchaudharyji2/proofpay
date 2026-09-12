import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Adding AI Inference service...");

  const inferenceService = await prisma.service.upsert({
    where: { slug: "ai-inference" },
    update: {},
    create: {
      name: "General AI Inference",
      slug: "ai-inference",
      category: "COMPUTE",
      description: "General purpose AI tasks like summarization, writing, coding.",
      unit: "per prompt",
      basePrice: 0.2,
    }
  });

  // Connect providers to inference service
  const providers = await prisma.provider.findMany();
  for (const provider of providers) {
    await prisma.providerService.upsert({
      where: { providerId_serviceId: { providerId: provider.id, serviceId: inferenceService.id } },
      update: {},
      create: { providerId: provider.id, serviceId: inferenceService.id }
    });
  }

  // Update Agent Mandate allowed services in DB
  const agents = await prisma.agent.findMany();
  for (const agent of agents) {
    await prisma.mandate.updateMany({
      where: { agentId: agent.id },
      data: { allowedServices: ["translation", "compute", "storage", "ai-inference"] }
    });
  }

  console.log("Added ai-inference to DB and providers.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
