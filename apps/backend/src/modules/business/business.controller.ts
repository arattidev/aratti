import {
  businessOrdersQuerySchema,
  createBusinessOfferBodySchema,
  updateBusinessOfferBodySchema,
  updateBusinessOfferParamsSchema,
} from "@aratti/api";

import { apiSuccess } from "../../lib/http";
import { requireRoleContext } from "../../lib/security/auth";
import { applyApiGuard, parseBody, parseQuery } from "../../lib/security/request";
import { BusinessRepository } from "./business.repository";
import { BusinessService } from "./business.service";

const businessService = new BusinessService(new BusinessRepository());

export async function createBusinessOfferController(request: Request) {
  await applyApiGuard("business.offers.create");
  const context = await requireRoleContext("BUSINESS_STAFF");
  const body = await parseBody(request, createBusinessOfferBodySchema);
  const data = await businessService.createOffer(context, body);
  return apiSuccess(data, 201);
}

export async function updateBusinessOfferController(request: Request, params: { id: string }) {
  await applyApiGuard("business.offers.update");
  const context = await requireRoleContext("BUSINESS_STAFF");
  updateBusinessOfferParamsSchema.parse(params);
  const body = await parseBody(request, updateBusinessOfferBodySchema);
  const data = await businessService.updateOffer(context, params, body);
  return apiSuccess(data);
}

export async function listBusinessOrdersController(request: Request) {
  await applyApiGuard("business.orders.list");
  const context = await requireRoleContext("BUSINESS_STAFF");
  const url = new URL(request.url);
  const query = parseQuery(url.searchParams, businessOrdersQuerySchema);
  const data = await businessService.listBusinessOrders(context, query);
  return apiSuccess(data);
}
