import { prisma } from "@/lib/db/prisma";

interface MandateConstraints {
  agentId: string;
  serviceType: string;
  maxPrice?: number;
  minQuality?: number;
  minReliability?: number;
  maxLatency?: number;
}

export async function decideProvider(constraints: MandateConstraints) {
  const providers = await prisma.provider.findMany({
    where: { status: "ACTIVE" },
    include: { metrics: true },
  });

  const evaluations = providers.map((provider) => {
    const m = provider.metrics;
    if (!m) {
      return { provider, eligible: false, reason: "No metrics available" };
    }

    if (constraints.maxPrice && m.price > constraints.maxPrice) {
      return { provider, eligible: false, reason: `Price ${m.price} > ${constraints.maxPrice}` };
    }
    if (constraints.minQuality && m.quality < constraints.minQuality) {
      return { provider, eligible: false, reason: `Quality ${m.quality} < ${constraints.minQuality}` };
    }
    if (constraints.minReliability && m.reliability < constraints.minReliability) {
      return { provider, eligible: false, reason: `Reliability ${m.reliability} < ${constraints.minReliability}` };
    }
    if (constraints.maxLatency && m.latencyMs > constraints.maxLatency) {
      return { provider, eligible: false, reason: `Latency ${m.latencyMs} > ${constraints.maxLatency}` };
    }

    // Risk-adjusted cost: Price / (Reliability / 100) -> Simplified expected cost.
    const expectedCost = m.price / (m.reliability / 100);

    return { provider, eligible: true, expectedCost, reason: "Eligible" };
  });

  const eligible = evaluations.filter((e) => e.eligible);
  if (eligible.length === 0) {
    return {
      selectedProvider: null,
      explanation: "No providers matched the mandate constraints.",
      evaluations,
    };
  }

  // Sort by expected cost
  eligible.sort((a, b) => (a.expectedCost || 0) - (b.expectedCost || 0));
  const best = eligible[0];

  const explanation = `${best.provider.name} was selected because it satisfies the required constraints and has the lowest risk-adjusted expected cost (${best.expectedCost?.toFixed(3)}) among eligible providers.`;

  return {
    selectedProvider: best.provider,
    explanation,
    evaluations,
  };
}
