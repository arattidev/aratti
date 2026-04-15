import { z } from "zod";

import { createAuditLog } from "../../lib/audit";
import { HttpError } from "../../lib/errors";
import { AdminRepository } from "./admin.repository";

const approveRefundParamsSchema = z.object({
  id: z.string().uuid(),
});

const approveRefundBodySchema = z.object({
  reason: z.string().min(3).max(200).optional(),
});

export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async listPendingBusinesses() {
    const businesses = await this.adminRepository.listPendingBusinesses();

    return {
      data: businesses.map((business) => ({
        id: business.id,
        name: business.name,
        category: business.category,
        city: business.city,
        province: business.province,
        createdAt: business.createdAt.toISOString(),
      })),
    };
  }

  async approveRefund(input: { params: unknown; body: unknown; adminUserId: string }) {
    const params = approveRefundParamsSchema.parse(input.params);
    const body = approveRefundBodySchema.parse(input.body);

    const refund = await this.adminRepository.findRefundById(params.id);

    if (!refund) {
      throw new HttpError(404, "refund_not_found", "Refund not found");
    }

    if (refund.status !== "REQUESTED") {
      throw new HttpError(409, "refund_state_invalid", "Refund cannot be approved");
    }

    const approved = await this.adminRepository.approveRefund(refund.id);
    await this.adminRepository.updateOrderAsRefunded(refund.orderId);

    await createAuditLog({
      actorUserId: input.adminUserId,
      actorRole: "ADMIN",
      action: "refund_approved",
      entityType: "refund",
      entityId: approved.id,
      metadata: {
        reason: body.reason,
      },
    });

    return {
      refundId: approved.id,
      status: approved.status,
    };
  }

  async listFraudFlags() {
    const logs = await this.adminRepository.listFraudFlags();

    return {
      data: logs.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        riskScore: log.riskScore,
        metadata: log.metadata,
        createdAt: log.createdAt.toISOString(),
      })),
    };
  }
}
