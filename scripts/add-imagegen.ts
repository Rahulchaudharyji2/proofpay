import { PrismaClient } from "@prisma/client";
import { ethers } from "ethers";
import AgentMandateArtifact from "../artifacts/contracts/AgentMandate.sol/AgentMandate.json";

const prisma = new PrismaClient();

async function main() {
  console.log("Adding Image Generation service...");

  const imageGenService = await prisma.service.upsert({
    where: { slug: "image-generation" },
    update: {},
    create: {
      name: "Image Generation",
      slug: "image-generation",
      category: "CREATIVE",
      description: "Generates high quality images from text prompts.",
      unit: "per image",
      basePrice: 0.20,
    }
  });

  const providersData = [
    {
      name: "PixelForge",
      address: ethers.Wallet.createRandom().address, 
      description: "Ultra-realistic 4K image generation.",
      metrics: { price: 0.25, quality: 98, reliability: 97, latencyMs: 4000 }
    },
    {
      name: "ImageAI",
      address: ethers.Wallet.createRandom().address, 
      description: "Fast, versatile AI art generator.",
      metrics: { price: 0.15, quality: 90, reliability: 99, latencyMs: 1500 }
    },
    {
      name: "RenderPro",
      address: ethers.Wallet.createRandom().address, 
      description: "Professional grade product renders.",
      metrics: { price: 0.40, quality: 99, reliability: 98, latencyMs: 5000 }
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
      where: { providerId_serviceId: { providerId: provider.id, serviceId: imageGenService.id } },
      update: {},
      create: { providerId: provider.id, serviceId: imageGenService.id }
    });
  }
  console.log("Added Image Generation providers to DB.");

  // Update Agent Mandates in DB
  const dbAgents = await prisma.agent.findMany();
  for (const dbAgent of dbAgents) {
    const mandates = await prisma.mandate.findMany({ where: { agentId: dbAgent.id } });
    for (const m of mandates) {
      if (!m.allowedServices.includes("image-generation")) {
        await prisma.mandate.update({
          where: { id: m.id },
          data: { allowedServices: { push: "image-generation" } }
        });
      }
    }
  }

  // Update default Agent Mandate on-chain
  const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
  const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const providerEth = new ethers.JsonRpcProvider(RPC_URL, 31337, { staticNetwork: true });
  const wallet = new ethers.Wallet(PRIVATE_KEY, providerEth);
  
  const agentAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; 
  const mandateAddress = process.env.NEXT_PUBLIC_AGENT_MANDATE_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  const mandateContract = new ethers.Contract(mandateAddress, AgentMandateArtifact.abi, wallet) as any;
  let currentNonce = await wallet.getNonce();

  try {
    const freezeTx = await mandateContract.freezeMandate(agentAddress, { nonce: currentNonce++ });
    await freezeTx.wait();
  } catch (e) {
  }

  const allowedServices = ["translation", "compute", "storage", "ai-inference", "summarization", "ocr", "image-generation"];
  const allowedProviders: string[] = []; 

  console.log("Creating new mandate...");
  try {
    const createTx = await mandateContract.createMandate(
        agentAddress,
        ethers.parseEther("100.0"),
        ethers.parseEther("20.0"),
        ethers.parseEther("5.0"),
        Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
        allowedServices,
        allowedProviders,
        false, 
        { nonce: currentNonce }
    );
    await createTx.wait();
    console.log("Mandate updated successfully on-chain!");
  } catch(e) {
      console.log("Failed to create onchain mandate. Assuming OK for custom agents.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
