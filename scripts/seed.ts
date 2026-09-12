import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Agent
  const agent = await prisma.agent.upsert({
    where: { address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" },
    update: {},
    create: {
      address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      name: "AutoBuyer-01",
    },
  });

  // 2. Create Mandate
  await prisma.mandate.create({
    data: {
      agentId: agent.id,
      totalBudget: 100.0,
      dailyLimit: 20.0,
      perTransactionLimit: 5.0,
      allowedServices: ["translation", "compute", "storage"],
      minimumQuality: 90,
      minimumReliability: 95,
      maxLatency: 5000,
    },
  });

  // 3. Create Services
  const translationService = await prisma.service.upsert({
    where: { slug: "translation" },
    update: {},
    create: {
      name: "AI Translation",
      slug: "translation",
      category: "CONTENT",
      description: "High-quality AI translation across multiple languages.",
      unit: "per 1000 words",
      basePrice: 0.5,
    }
  });

  // 4. Create Providers
  const providerA = await prisma.provider.upsert({
    where: { address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" },
    update: {
      services: {
        connectOrCreate: [{
          where: { providerId_serviceId: { providerId: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", serviceId: translationService.id } },
          create: { serviceId: translationService.id }
        }]
      }
    },
    create: {
      address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      name: "Provider A — LinguaFast",
      description: "Premium high-quality AI Translation service",
      metrics: {
        create: {
          price: 0.7,
          quality: 98,
          reliability: 99,
          latencyMs: 2100,
          jobsCompleted: 1500,
          verifiedOutcomes: 1480,
          trustScore: 95,
        },
      },
      services: {
        create: [{ serviceId: translationService.id }]
      }
    },
  });

  const providerB = await prisma.provider.upsert({
    where: { address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906" },
    update: {
      services: {
        connectOrCreate: [{
          where: { providerId_serviceId: { providerId: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", serviceId: translationService.id } },
          create: { serviceId: translationService.id }
        }]
      }
    },
    create: {
      address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      name: "Provider B — PolyglotAI",
      description: "Balanced AI translation provider",
      metrics: {
        create: {
          price: 0.5,
          quality: 94,
          reliability: 97,
          latencyMs: 1400,
          jobsCompleted: 3000,
          verifiedOutcomes: 2900,
          trustScore: 88,
        },
      },
      services: {
        create: [{ serviceId: translationService.id }]
      }
    },
  });

  const providerC = await prisma.provider.upsert({
    where: { address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65" },
    update: {
      services: {
        connectOrCreate: [{
          where: { providerId_serviceId: { providerId: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", serviceId: translationService.id } },
          create: { serviceId: translationService.id }
        }]
      }
    },
    create: {
      address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      name: "Provider C — TranslatePro",
      description: "Cheap but unreliable translation service",
      metrics: {
        create: {
          price: 0.1,
          quality: 72,
          reliability: 80,
          latencyMs: 1000,
          jobsCompleted: 800,
          verifiedOutcomes: 600,
          trustScore: 40,
        },
      },
      services: {
        create: [{ serviceId: translationService.id }]
      }
    },
  });

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
