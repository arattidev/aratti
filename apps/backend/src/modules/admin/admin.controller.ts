import { z } from "zod";

import { apiSuccess } from "../../lib/http";
import { requireRoleContext } from "../../lib/security/auth";
import { applyApiGuard } from "../../lib/security/request";
import { AdminRepository } from "./admin.repository";
import { AdminService } from "./admin.service";

const adminService = new AdminService(new AdminRepository());

export async function listPendingBusinessesController() {
  await applyApiGuard("admin.businesses.pending");
  await requireRoleContext("ADMIN");
  const data = await adminService.listPendingBusinesses();
  return apiSuccess(data);
}

export async function approveRefundController(request: Request, params: { id: string }) {
  await applyApiGuard("admin.refunds.approve");
  const context = await requireRoleContext("ADMIN");
  const body = await request.json().catch(() => ({}));

  const data = await adminService.approveRefund({
    params: z.object({ id: z.string() }).parse(params),
    body,
    adminUserId: context.userId,
  });

  return apiSuccess(data);
}

export async function listFraudFlagsController() {
  await applyApiGuard("admin.fraud.flags");
  await requireRoleContext("ADMIN");
  const data = await adminService.listFraudFlags();
  return apiSuccess(data);
}
