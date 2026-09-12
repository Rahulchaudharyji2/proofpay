import { PrismaClient } from "@prisma/client";
import { decideProvider } from "../src/lib/agent/engine";
import { evaluatePayment, FirewallResult } from "../src/lib/security/firewall";
import { uploadJSONToPinata } from "../src/lib/storage/pinata";

const prisma = new PrismaClient();

async function runVerification() {
  console.log("Starting Live Backend E2E Verification...");
  
  // 1. Fetch Seeded Data
  const agent = await prisma.agent.findFirst({ include: { mandates: true } });
  if (!agent) throw new Error("Seed data missing: No Agent");
  
  const mandate = agent.mandates[0];
  const providers = await prisma.provider.findMany({ include: { metrics: true } });
  if (providers.length < 3) throw new Error("Seed data missing: Providers");
  
  console.log(`✓ Database connected (Neon Postgres). Found Agent: ${agent.name}`);
  
  // 2. Decision Engine
  const decision = await decideProvider({
    agentId: agent.id,
    serviceType: "translation",
    minQuality: mandate.minimumQuality || undefined,
    minReliability: mandate.minimumReliability || undefined,
  });
  
  if (!decision.selectedProvider) {
    throw new Error("Decision Engine failed to select a provider.");
  }
  console.log(`✓ Decision Engine selected: ${decision.selectedProvider.name} (Risk-adjusted expected cost)`);

  const providerId = decision.selectedProvider.id;
  
  // 3. Firewall - Legitimate Flow
  console.log("\n--- Testing Legitimate Flow ---");
  const legitCheck = await evaluatePayment({
    agentId: agent.id,
    providerId: providerId,
    amount: 0.5,
    serviceType: "translation",
    taskId: "TEST-TASK-123",
  });
  console.log(`Legitimate Payment: ${legitCheck.status} (${legitCheck.reason})`);
  if (legitCheck.status !== FirewallResult.APPROVED) throw new Error("Legitimate payment failed");

  // Simulate task creation to avoid duplicates later
  const task = await prisma.task.create({
    data: { id: "TEST-TASK-123", agentId: agent.id, serviceType: "translation", status: "SETTLED", description: "Test Task" }
  });

  // 4. Pinata Integration
  console.log("\n--- Testing Pinata IPFS Upload ---");
  try {
    const pinataRes = await uploadJSONToPinata({
      test: "This is a live E2E test verification",
      taskId: "TEST-TASK-123",
      timestamp: Date.now()
    });
    console.log(`✓ Pinata Upload Success! CID: ${pinataRes.cid}`);
  } catch (e: any) {
    console.error(`✗ Pinata Upload Failed: ${e.message}`);
    console.log("Please ensure PINATA_JWT is correct.");
  }

  // 5. Attack Simulation
  console.log("\n--- Testing Attack Scenarios (Economic Firewall) ---");
  
  // Attack 1: Overspend
  const overspend = await evaluatePayment({
    agentId: agent.id,
    providerId: providerId,
    amount: mandate.perTransactionLimit + 10,
    serviceType: "translation",
    taskId: "ATTACK-1",
  });
  console.log(`Attack 1 (Overspend): ${overspend.status} - ${overspend.reason}`);
  
  // Attack 2: Duplicate
  const duplicate = await evaluatePayment({
    agentId: agent.id,
    providerId: providerId,
    amount: 0.5,
    serviceType: "translation",
    taskId: "TEST-TASK-123", // Already settled
  });
  console.log(`Attack 2 (Duplicate): ${duplicate.status} - ${duplicate.reason}`);
  
  // Attack 3: Unauthorized Service
  const unauthorizedService = await evaluatePayment({
    agentId: agent.id,
    providerId: providerId,
    amount: 0.5,
    serviceType: "unauthorized_service",
    taskId: "ATTACK-3",
  });
  console.log(`Attack 3 (Unauthorized Service): ${unauthorizedService.status} - ${unauthorizedService.reason}`);

  // Attack 6: Price Anomaly
  const priceAnomaly = await evaluatePayment({
    agentId: agent.id,
    providerId: providerId,
    amount: (decision.selectedProvider.metrics?.price || 0.5) * 6, // 6x price
    serviceType: "translation",
    taskId: "ATTACK-6",
  });
  console.log(`Attack 6 (Price Anomaly): ${priceAnomaly.status} - ${priceAnomaly.reason}`);

  console.log("\nLive Verification Script Completed!");
}

runVerification().catch(e => {
  console.error("Verification failed:", e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
