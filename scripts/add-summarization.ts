import { PrismaClient } from "@prisma/client";
import { ethers } from "ethers";
import AgentMandateArtifact from "../artifacts/contracts/AgentMandate.sol/AgentMandate.json";

const prisma = new PrismaClient();

async function main() {
  console.log("Adding summarization service...");

  const summarizationService = await prisma.service.upsert({
    where: { slug: "summarization" },
    update: {},
    create: {
      name: "Text Summarization",
      slug: "summarization",
      category: "CONTENT",
      description: "AI-powered text summarization services.",
      unit: "per document",
      basePrice: 0.5,
    }
  });

  const providersData = [
    {
      name: "SummaryAI",
      address: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955", // Account 6
      description: "Fast and reliable summarization.",
      metrics: { price: 0.3, quality: 95, reliability: 98, latencyMs: 1200 }
    },
    {
      name: "QuickSummarizer",
      address: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f", // Account 7
      description: "Ultra low latency summarization.",
      metrics: { price: 0.4, quality: 90, reliability: 99, latencyMs: 300 }
    },
    {
      name: "DeepSummary",
      address: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720", // Account 8
      description: "Deep and highly accurate analytical summaries.",
      metrics: { price: 0.8, quality: 99, reliability: 99, latencyMs: 3000 }
    }
  ];

  for (const p of providersData) {
    const provider = await prisma.provider.upsert({
      where: { address: p.address },
      update: {},
      create: {
        name: p.name,
        address: p.address,
        description: p.description,
        status: "ACTIVE",
      }
    });

    await prisma.providerMetric.upsert({
      where: { providerId: provider.id },
      update: p.metrics,
      create: { providerId: provider.id, ...p.metrics }
    });

    await prisma.providerService.upsert({
      where: { providerId_serviceId: { providerId: provider.id, serviceId: summarizationService.id } },
      update: {},
      create: { providerId: provider.id, serviceId: summarizationService.id }
    });
  }
  console.log("Added providers to DB.");

  // Now update on-chain mandate
  const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
  const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const providerEth = new ethers.JsonRpcProvider(RPC_URL, 31337, { staticNetwork: true });
  const wallet = new ethers.Wallet(PRIVATE_KEY, providerEth);
  
  const agent = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Agent address
  const mandateAddress = process.env.NEXT_PUBLIC_AGENT_MANDATE_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  const mandateContract = new ethers.Contract(mandateAddress, AgentMandateArtifact.abi, wallet) as any;

  let currentNonce = await wallet.getNonce();

  console.log("Freezing existing mandate...");
  try {
    const freezeTx = await mandateContract.freezeMandate(agent, { nonce: currentNonce++ });
    await freezeTx.wait();
  } catch (e) {
    console.log("Freeze failed, maybe already inactive");
  }

  const allowedServices = ["translation", "compute", "storage", "ai-inference", "summarization"];
  const allowedProviders = [
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Provider A
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Provider B
    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // Provider C
    "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955", // SummaryAI
    "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f", // QuickSummarizer
    "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720"  // DeepSummary
  ];

  console.log("Creating new mandate...");
  const createTx = await mandateContract.createMandate(
    agent,
    ethers.parseEther("100.0"),
    ethers.parseEther("20.0"),
    ethers.parseEther("5.0"),
    Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
    allowedServices,
    allowedProviders,
    true,
    { nonce: currentNonce }
  );
  await createTx.wait();
  
  // Update Agent Mandate in DB as well
  const dbAgent = await prisma.agent.findUnique({ where: { address: agent } });
  if (dbAgent) {
    await prisma.mandate.updateMany({
      where: { agentId: dbAgent.id },
      data: { allowedServices }
    });
  }

  console.log("Mandate updated successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
