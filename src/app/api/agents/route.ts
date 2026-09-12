import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAgentMandateContract } from "@/lib/blockchain";
import { ethers } from "ethers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerAddress = searchParams.get("ownerAddress");
    const whereClause = ownerAddress ? { ownerAddress } : {};

    const agents = await prisma.agent.findMany({
      where: whereClause,
      include: {
        mandates: true,
        tasks: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ agents });
  } catch (error: any) {
    console.error("Error fetching agents:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, purpose, totalBudget, dailyLimit, perTransactionLimit, allowedServices, providerPolicy, ownerAddress } = body;

    // 1. Generate a valid EVM address for the new Agent
    const agentWallet = ethers.Wallet.createRandom();
    const agentAddress = agentWallet.address;

    // We get allowedProviders from DB based on providerPolicy or all if "any"
    let allowedProviderAddresses: string[] = [];
    if (providerPolicy && providerPolicy !== "any") {
       // Just an example mapping, in reality you'd fetch from provider table
       // For W3A-1 demo, we'll allow all registered providers by passing empty restrict list, or pass actual addresses if needed.
    }
    
    // Convert to Wei
    const totalBudgetWei = ethers.parseEther(totalBudget.toString());
    const dailyLimitWei = ethers.parseEther(dailyLimit.toString());
    const perTxLimitWei = ethers.parseEther(perTransactionLimit.toString());
    const expiresAt = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year

    // 2. Call Smart Contract
    const mandateContract = getAgentMandateContract();
    
    console.log(`Creating mandate on-chain for ${agentAddress}...`);
    const tx = await mandateContract.createMandate(
      agentAddress,
      totalBudgetWei,
      dailyLimitWei,
      perTxLimitWei,
      expiresAt,
      allowedServices || [],
      allowedProviderAddresses,
      false // restrictProviders
    );
    
    // Wait for transaction receipt
    await tx.wait();
    console.log(`Mandate transaction confirmed: ${tx.hash}`);

    // 3. Create Agent in Database ONLY AFTER on-chain success
    const agent = await prisma.agent.create({
      data: {
        name,
        description,
        purpose,
        address: agentAddress,
        ownerAddress,
        status: "ACTIVE",
      },
    });

    // 4. Create Mandate in Database
    const mandate = await prisma.mandate.create({
      data: {
        agentId: agent.id,
        totalBudget: parseFloat(totalBudget),
        dailyLimit: parseFloat(dailyLimit),
        perTransactionLimit: parseFloat(perTransactionLimit),
        allowedServices: allowedServices || [],
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ agent, mandate });
  } catch (error: any) {
    console.error("Error creating agent and mandate:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
