import { prisma } from "@/lib/db/prisma";

export enum FirewallResult {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  REQUIRES_HUMAN_APPROVAL = "REQUIRES_HUMAN_APPROVAL",
  FROZEN = "FROZEN",
}

interface PaymentRequest {
  agentId: string;
  providerId: string;
  amount: number;
  serviceType: string;
  taskId: string;
}

export async function evaluatePayment(request: PaymentRequest): Promise<{ status: FirewallResult; reason: string }> {
  const agent = await prisma.agent.findUnique({
    where: { id: request.agentId },
    include: { mandates: { where: { status: "ACTIVE" } } },
  });

  if (!agent) return { status: FirewallResult.REJECTED, reason: "Agent not found" };
  if (agent.status === "FROZEN") return { status: FirewallResult.FROZEN, reason: "Agent is frozen" };

  const mandate = agent.mandates[0];
  if (!mandate) return { status: FirewallResult.REJECTED, reason: "No active mandate" };

  if (mandate.expiresAt && new Date() > mandate.expiresAt) {
    return { status: FirewallResult.REJECTED, reason: "Mandate expired" };
  }

  if (!mandate.allowedServices.includes(request.serviceType)) {
    return { status: FirewallResult.REJECTED, reason: "Service type not allowed" };
  }

  if (request.amount > mandate.perTransactionLimit) {
    return { status: FirewallResult.REJECTED, reason: "Exceeds per-transaction limit" };
  }

  const provider = await prisma.provider.findUnique({ where: { id: request.providerId }, include: { metrics: true } });
  if (!provider) return { status: FirewallResult.REJECTED, reason: "Provider not found" };
  
  if (provider.status !== "ACTIVE") {
    return { status: FirewallResult.REJECTED, reason: "Provider is not active" };
  }

  // Price Anomaly Check
  if (provider.metrics) {
    // Arbitrary heuristic: if requested amount is more than 5x the historical average price
    if (request.amount > provider.metrics.price * 5) {
      return { status: FirewallResult.REQUIRES_HUMAN_APPROVAL, reason: "Price anomaly detected" };
    }
  }

  // Duplicate Check
  const existingPayment = await prisma.task.findUnique({
    where: { id: request.taskId },
  });

  if (existingPayment && existingPayment.status === "SETTLED") {
    return { status: FirewallResult.REJECTED, reason: "Duplicate payment for task" };
  }

  return { status: FirewallResult.APPROVED, reason: "All checks passed" };
}
