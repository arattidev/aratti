import { createOrderBodySchema, orderHistoryQuerySchema, pickupOrderBodySchema, pickupOrderParamsSchema } from "@aratti/api";

import { apiSuccess } from "../../lib/http";
import { requireAuthContext, requireRoleContext } from "../../lib/security/auth";
import { applyApiGuard, parseBody, parseQuery } from "../../lib/security/request";
import { OrdersRepository } from "./orders.repository";
import { OrdersService } from "./orders.service";

const ordersService = new OrdersService(new OrdersRepository());

export async function createOrderController(request: Request) {
  await applyApiGuard("orders.create");
  const context = await requireAuthContext();
  const body = await parseBody(request, createOrderBodySchema);
  const data = await ordersService.createOrder(context, body);
  return apiSuccess(data, 201);
}

export async function pickupOrderController(request: Request, params: { id: string }) {
  await applyApiGuard("orders.pickup");
  const context = await requireRoleContext("BUSINESS");
  const parsedParams = pickupOrderParamsSchema.parse(params);
  const body = await parseBody(request, pickupOrderBodySchema);
  const data = await ordersService.pickupOrder(context, parsedParams, body);
  return apiSuccess(data);
}

export async function listOrderHistoryController(request: Request) {
  await applyApiGuard("orders.history");
  const context = await requireAuthContext();
  const url = new URL(request.url);
  const query = parseQuery(url.searchParams, orderHistoryQuerySchema);
  const data = await ordersService.listUserOrders(context, query);
  return apiSuccess(data);
}
