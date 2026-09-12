import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { uploadJSONToPinata } from "@/lib/storage/pinata";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId, providerResult } = body;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { agent: { include: { mandates: true } } },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // 1. Upload the result to Pinata (IPFS)
    const { cid, hash } = await uploadJSONToPinata({ taskId, result: providerResult });

    // 2. Deterministic Verification
    // E.g., Translation needs quality >= minimumQuality in the mandate.
    let isVerified = false;
    let reason = "";

    const mandate = task.agent.mandates[0]; // simplistic assumption
    
    // Using simulated metadata attached by the mock provider
    if (providerResult.success === true && providerResult.metadata) {
      if (mandate.minimumQuality && providerResult.metadata.qualityScore < mandate.minimumQuality) {
        isVerified = false;
        reason = `Quality score ${providerResult.metadata.qualityScore} is less than required ${mandate.minimumQuality}`;
      } else {
        isVerified = true;
        reason = "Result meets all requirements";
      }
    } else {
      isVerified = false;
      reason = "Provider result indicated failure or lacked required structure.";
    }

    // 3. Store outcome and evidence CID in Postgres
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: isVerified ? "VERIFIED" : "FAILED",
        resultCid: cid,
        resultHash: hash,
      },
    });

    // We also log an audit event
    await prisma.auditEvent.create({
      data: {
        taskId,
        eventType: isVerified ? "OUTCOME_VERIFIED" : "OUTCOME_FAILED",
        description: reason,
        metadata: { cid, hash, providerResult },
      },
    });

    return NextResponse.json({
      verified: isVerified,
      reason,
      cid,
      hash,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
