import { prisma } from "@aratti/db";

export interface FraudCheckResult {
  score: number;
  reasons: string[];
}

export async function evaluateRefundRisk(userId: string): Promise<FraudCheckResult> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const recentRefunds = await prisma.refund.count({
    where: {
      requestedByUserId: userId,
      createdAt: { gte: since },
      deletedAt: null,
    },
  });

  const reasons: string[] = [];
  let score = 0;

  if (recentRefunds >= 3) {
    score += 50;
    reasons.push("multiple_refunds_30d");
  }

  if (recentRefunds >= 5) {
    score += 30;
    reasons.push("high_refund_velocity");
  }

  return {
    score,
    reasons,
  };
}

export async function evaluatePurchaseRisk(userId: string): Promise<FraudCheckResult> {
  const since = new Date(Date.now() - 2 * 60 * 60 * 1000);

  const recentOrders = await prisma.order.count({
    where: {
      userId,
      createdAt: { gte: since },
      deletedAt: null,
    },
  });

  const reasons: string[] = [];
  let score = 0;

  if (recentOrders >= 8) {
    score += 45;
    reasons.push("order_burst_2h");
  }

  return {
    score,
    reasons,
  };
}
