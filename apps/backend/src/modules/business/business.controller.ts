import {
  createBusinessPayoutBodySchema,
  businessOrdersQuerySchema,
  createBusinessOfferBodySchema,
  listBusinessAvailabilityQuerySchema,
  listBusinessOffersQuerySchema,
  listBusinessPayoutsQuerySchema,
  updateBusinessAvailabilityBodySchema,
  updateBusinessAvailabilityParamsSchema,
  updateBusinessOfferBodySchema,
  updateBusinessOfferParamsSchema,
  upsertBusinessAvailabilityBodySchema,
} from "@aratti/api";

import { apiSuccess } from "../../lib/http";
import { requireRoleContext } from "../../lib/security/auth";
import { applyApiGuard, parseBody, parseQuery } from "../../lib/security/request";
import { BusinessRepository } from "./business.repository";
import { BusinessService } from "./business.service";

const businessService = new BusinessService(new BusinessRepository());

export async function createBusinessOfferController(request: Request) {
  await applyApiGuard("business.offers.create");
  const context = await requireRoleContext("BUSINESS");
  const body = await parseBody(request, createBusinessOfferBodySchema);
  const data = await businessService.createOffer(context, body);
  return apiSuccess(data, 201);
}

export async function updateBusinessOfferController(request: Request, params: { id: string }) {
  await applyApiGuard("business.offers.update");
  const context = await requireRoleContext("BUSINESS");
  updateBusinessOfferParamsSchema.parse(params);
  const body = await parseBody(request, updateBusinessOfferBodySchema);
  const data = await businessService.updateOffer(context, params, body);
  return apiSuccess(data);
}

export async function listBusinessOrdersController(request: Request) {
  await applyApiGuard("business.orders.list");
  const context = await requireRoleContext("BUSINESS");
  const url = new URL(request.url);
  const query = parseQuery(url.searchParams, businessOrdersQuerySchema);
  const data = await businessService.listBusinessOrders(context, query);
  return apiSuccess(data);
}

export async function listBusinessOffersController(request: Request) {
  await applyApiGuard("business.offers.list");
  const context = await requireRoleContext("BUSINESS");
  const url = new URL(request.url);
  const query = parseQuery(url.searchParams, listBusinessOffersQuerySchema);
  const data = await businessService.listBusinessOffers(context, query);
  return apiSuccess(data);
}

export async function upsertBusinessAvailabilityController(request: Request) {
  await applyApiGuard("business.availability.upsert");
  const context = await requireRoleContext("BUSINESS");
  const body = await parseBody(request, upsertBusinessAvailabilityBodySchema);
  const data = await businessService.upsertDailyAvailability(context, body);
  return apiSuccess(data, 201);
}

export async function listBusinessAvailabilityController(request: Request) {
  await applyApiGuard("business.availability.list");
  const context = await requireRoleContext("BUSINESS");
  const url = new URL(request.url);
  const query = parseQuery(url.searchParams, listBusinessAvailabilityQuerySchema);
  const data = await businessService.listDailyAvailability(context, query);
  return apiSuccess(data);
}

export async function updateBusinessAvailabilityController(request: Request, params: { id: string }) {
  await applyApiGuard("business.availability.update");
  const context = await requireRoleContext("BUSINESS");
  updateBusinessAvailabilityParamsSchema.parse(params);
  const body = await parseBody(request, updateBusinessAvailabilityBodySchema);
  const data = await businessService.updateDailyAvailability(context, params, body);
  return apiSuccess(data);
}

export async function createBusinessPayoutController(request: Request) {
  await applyApiGuard("business.payouts.create");
  const context = await requireRoleContext("BUSINESS");
  const body = await parseBody(request, createBusinessPayoutBodySchema);
  const data = await businessService.createPayout(context, body);
  return apiSuccess(data, 201);
}

export async function listBusinessPayoutsController(request: Request) {
  await applyApiGuard("business.payouts.list");
  const context = await requireRoleContext("BUSINESS");
  const url = new URL(request.url);
  const query = parseQuery(url.searchParams, listBusinessPayoutsQuerySchema);
  const data = await businessService.listPayouts(context, query);
  return apiSuccess(data);
}
