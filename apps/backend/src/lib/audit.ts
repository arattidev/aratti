import { prisma } from "@aratti/db";
import type { UserRole } from "@aratti/types";

export async function createAuditLog(input: {
  actorUserId?: string;
  actorRole?: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  riskScore?: number;
  metadata?: Record<string, unknown>;
}) {
  return prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      requestId: input.requestId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      riskScore: input.riskScore,
      metadata: input.metadata,
    },
  });
}
