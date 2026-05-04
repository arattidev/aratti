import { prisma, type Prisma } from "@aratti/db";
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
  const data: Prisma.AuditLogUncheckedCreateInput = {
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
  };

  if (input.actorUserId !== undefined) data.actorUserId = input.actorUserId;
  if (input.actorRole !== undefined) data.actorRole = input.actorRole;
  if (input.requestId !== undefined) data.requestId = input.requestId;
  if (input.ipAddress !== undefined) data.ipAddress = input.ipAddress;
  if (input.userAgent !== undefined) data.userAgent = input.userAgent;
  if (input.riskScore !== undefined) data.riskScore = input.riskScore;
  if (input.metadata !== undefined) data.metadata = input.metadata as Prisma.InputJsonValue;

  return prisma.auditLog.create({
    data,
  });
}
