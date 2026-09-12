import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

  // 1. Create Services
  const services = [
    {
      name: 'Translation',
      slug: 'translation',
      category: 'AI',
      description: 'Translate text and documents across languages.',
      unit: 'per word',
      basePrice: 0.05,
    },
    {
      name: 'AI Inference',
      slug: 'ai-inference',
      category: 'AI',
      description: 'General purpose LLM completion.',
      unit: 'per 1k tokens',
      basePrice: 0.10,
    },
    {
      name: 'OCR',
      slug: 'ocr',
      category: 'Documents',
      description: 'Extract text from images and PDFs.',
      unit: 'per page',
      basePrice: 0.02,
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
  }

  const translationService = await prisma.service.findUnique({ where: { slug: 'translation' } });
  
  if (!translationService) throw new Error("Service not found");

  // 2. Create Providers
  const providers = [
    {
      address: '0x1111111111111111111111111111111111111111',
      name: 'TranslateFlow',
      description: 'Premium translation API',
      metrics: {
        price: 0.70,
        quality: 94,
        reliability: 98,
        latencyMs: 1200,
        jobsCompleted: 1248,
        trustScore: 95
      }
    },
    {
      address: '0x2222222222222222222222222222222222222222',
      name: 'LexiNode',
      description: 'Balanced translation and OCR',
      metrics: {
        price: 0.50,
        quality: 91,
        reliability: 96,
        latencyMs: 2100,
        jobsCompleted: 850,
        trustScore: 90
      }
    },
    {
      address: '0x3333333333333333333333333333333333333333',
      name: 'PolyGlot API',
      description: 'Cheapest provider, high latency',
      metrics: {
        price: 0.30,
        quality: 72,
        reliability: 80,
        latencyMs: 5000,
        jobsCompleted: 430,
        trustScore: 65
      }
    }
  ];

  for (const p of providers) {
    const provider = await prisma.provider.upsert({
      where: { address: p.address },
      update: {},
      create: {
        address: p.address,
        name: p.name,
        description: p.description,
        status: 'ACTIVE',
      },
    });

    await prisma.providerMetric.upsert({
      where: { providerId: provider.id },
      update: p.metrics,
      create: {
        providerId: provider.id,
        ...p.metrics
      },
    });

    // Link Provider to Service
    await prisma.providerService.upsert({
      where: {
        providerId_serviceId: {
          providerId: provider.id,
          serviceId: translationService.id,
        }
      },
      update: {},
      create: {
        providerId: provider.id,
        serviceId: translationService.id,
      },
    });
  }

  console.log('Seeding Completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
