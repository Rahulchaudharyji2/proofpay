import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { decideProvider } from "@/lib/agent/engine";
import { evaluatePayment, FirewallResult } from "@/lib/security/firewall";

export async function POST() {
  try {
    // 1. Fetch Agent & Mandate
    const agent = await prisma.agent.findFirst({ include: { mandates: { where: { status: "ACTIVE" } } } });
    if (!agent || agent.mandates.length === 0) {
      return NextResponse.json({ error: "No active agent or mandate found. Please run seed script." }, { status: 400 });
    }
    const mandate = agent.mandates[0];

    // 2. Create Task Intent
    const task = await prisma.task.create({
      data: {
        agentId: agent.id,
        description: "Translate document to Spanish",
        serviceType: "translation",
        status: "CREATED",
      },
    });

    // 3. Provider Selection
    const decision = await decideProvider({
      agentId: agent.id,
      serviceType: task.serviceType,
      minQuality: mandate.minimumQuality || undefined,
      minReliability: mandate.minimumReliability || undefined,
    });

    if (!decision.selectedProvider) {
      await prisma.task.update({ where: { id: task.id }, data: { status: "FAILED" } });
      return NextResponse.json({ error: "No eligible provider found", evaluations: decision.evaluations });
    }

    const provider = decision.selectedProvider;

    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: "PROVIDER_SELECTED",
        selectedProviderId: provider.id,
      },
    });

    // 4. Simulate HTTP 402 Request
    const amount = provider.metrics?.price || 0.1;
    await prisma.task.update({
      where: { id: task.id },
      data: { status: "PAYMENT_REQUIRED" },
    });
    
    // 5. Firewall Evaluation
    const firewallCheck = await evaluatePayment({
      agentId: agent.id,
      providerId: provider.id,
      amount,
      serviceType: task.serviceType,
      taskId: task.id,
    });

    if (firewallCheck.status !== FirewallResult.APPROVED) {
      await prisma.securityEvent.create({
        data: {
          taskId: task.id,
          eventType: "PAYMENT_BLOCKED",
          severity: "HIGH",
          description: firewallCheck.reason,
        },
      });
      return NextResponse.json({ error: "Blocked by Firewall", reason: firewallCheck.reason });
    }

    // 6. Payment Authorized & Escrowed
    const paymentId = `PAY-${task.id}-${Date.now()}`;
    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: "AUTHORIZED",
      },
    });

    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: "ESCROWED",
        paymentAmount: amount,
        paymentId,
      },
    });

    // 7. Execute Service (mocking the API call we created)
    // Normally this would be a real fetch to the provider API.
    const serviceResult = { success: true, result: "Hola (Hello)", metadata: { qualityScore: provider.metrics?.quality || 95 } };
    
    await prisma.task.update({
      where: { id: task.id },
      data: { status: "DELIVERED" },
    });

    // 8. Outcome Verification (mocking the verify API call)
    // In a real app we fetch /api/outcomes/verify. Here we simulate the successful verification inline for the demo summary
    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: "VERIFIED",
        resultCid: "bafybeih...mockcid",
        resultHash: "0xmockhash...",
      },
    });

    // 9. Settlement
    await prisma.task.update({
      where: { id: task.id },
      data: { status: "SETTLED" },
    });

    await prisma.auditEvent.create({
      data: {
        taskId: task.id,
        eventType: "PAYMENT_SETTLED",
        description: "Payment successfully settled on-chain (simulated for demo summary)",
      },
    });

    return NextResponse.json({
      success: true,
      task,
      decision,
      firewallCheck,
      serviceResult,
      finalStatus: "SETTLED",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
