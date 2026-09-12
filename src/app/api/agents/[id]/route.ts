import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAgentMandateContract } from "@/lib/blockchain";
import { ethers } from "ethers";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: agentId } = await params;
    const body = await req.json();
    const { totalBudget, dailyLimit, perTransactionLimit, ownerAddress } = body;

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { mandates: true },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (agent.ownerAddress?.toLowerCase() !== ownerAddress.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const mandate = agent.mandates[0];
    if (!mandate) {
      return NextResponse.json({ error: "No active mandate found" }, { status: 404 });
    }

    const totalBudgetWei = ethers.parseEther(totalBudget.toString());
    const dailyLimitWei = ethers.parseEther(dailyLimit.toString());
    const perTxLimitWei = ethers.parseEther(perTransactionLimit.toString());
    const expiresAt = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; 

    const mandateContract = getAgentMandateContract();
    
    // We need to manage nonce carefully
    const wallet = mandateContract.runner as ethers.Wallet;
    let currentNonce = await wallet.getNonce();

    console.log(`Freezing existing mandate for ${agent.address}...`);
    try {
      const freezeTx = await mandateContract.freezeMandate(agent.address, { nonce: currentNonce++ });
      await freezeTx.wait();
    } catch (e) {
      console.log("Freeze failed, maybe already inactive or error:", e);
    }

    console.log(`Creating updated mandate for ${agent.address}...`);
    const createTx = await mandateContract.createMandate(
      agent.address,
      totalBudgetWei,
      dailyLimitWei,
      perTxLimitWei,
      expiresAt,
      mandate.allowedServices,
      [], // restrictProviders is usually false or we just pass empty array
      false,
      { nonce: currentNonce }
    );
    
    await createTx.wait();
    console.log(`Mandate updated successfully: ${createTx.hash}`);

    // Update DB
    const updatedMandate = await prisma.mandate.update({
      where: { id: mandate.id },
      data: {
        totalBudget: parseFloat(totalBudget),
        dailyLimit: parseFloat(dailyLimit),
        perTransactionLimit: parseFloat(perTransactionLimit),
      },
    });

    return NextResponse.json({ success: true, mandate: updatedMandate });
  } catch (error: any) {
    console.error("Error updating mandate:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
