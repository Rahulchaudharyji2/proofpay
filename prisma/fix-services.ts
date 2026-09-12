import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const providers = await prisma.provider.findMany();
  const services = await prisma.service.findMany();

  for (const p of providers) {
    for (const s of services) {
      await prisma.providerService.upsert({
        where: {
          providerId_serviceId: {
            providerId: p.id,
            serviceId: s.id,
          }
        },
        update: {},
        create: {
          providerId: p.id,
          serviceId: s.id,
        },
      });
    }
  }
  console.log("All providers linked to all services successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
