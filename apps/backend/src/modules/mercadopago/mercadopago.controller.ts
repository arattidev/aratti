import {
  mpAuthUrlQuerySchema,
  mpDisconnectBodySchema,
  mpOAuthCallbackQuerySchema,
  mpVerifyConnectionQuerySchema,
} from "@aratti/api";

import { env } from "../../lib/env";
import { apiSuccess } from "../../lib/http";
import { requireAuthContext, requireRoleContext } from "../../lib/security/auth";
import { applyApiGuard, parseBody, parseQuery } from "../../lib/security/request";
import { MercadoPagoRepository } from "./mercadopago.repository";
import { MercadoPagoService } from "./mercadopago.service";

const service = new MercadoPagoService(new MercadoPagoRepository());

export async function mpAuthUrlController(request: Request) {
  await applyApiGuard("mercadopago.auth-url");
  const context = await requireRoleContext("BUSINESS");
  const url = new URL(request.url);
  const query = parseQuery(url.searchParams, mpAuthUrlQuerySchema);
  const data = service.buildAuthorizationUrl(context, query.businessId);
  return apiSuccess(data);
}

export async function mpOAuthCallbackController(request: Request): Promise<Response> {
  await applyApiGuard("mercadopago.oauth-callback");

  const url = new URL(request.url);
  const parsed = mpOAuthCallbackQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));

  const successBase = env.MERCADO_PAGO_SUCCESS_URL ?? `${env.API_BASE_URL ?? ""}/payment/success`;
  const failureBase = env.MERCADO_PAGO_FAILURE_URL ?? `${env.API_BASE_URL ?? ""}/payment/failure`;

  if (!parsed.success) {
    return Response.redirect(buildRedirect(failureBase, { status: "invalid_request" }), 302);
  }

  try {
    const result = await service.handleOAuthCallback(parsed.data);
    return Response.redirect(
      buildRedirect(successBase, {
        status: "connected",
        businessId: result.businessId,
      }),
      302,
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : "oauth_failed";
    return Response.redirect(buildRedirect(failureBase, { status: "error", error: truncate(code, 120) }), 302);
  }
}

export async function mpDisconnectController(request: Request) {
  await applyApiGuard("mercadopago.disconnect");
  const context = await requireRoleContext("BUSINESS");
  const body = await parseBody(request, mpDisconnectBodySchema);
  await service.disconnect(context, body.businessId);
  return apiSuccess({ success: true });
}

export async function mpVerifyConnectionController(request: Request) {
  await applyApiGuard("mercadopago.verify-connection");
  const context = await requireAuthContext();
  const url = new URL(request.url);
  const query = parseQuery(url.searchParams, mpVerifyConnectionQuerySchema);
  const data = await service.verifyConnection(context, query.businessId);
  return apiSuccess(data);
}

function buildRedirect(base: string, params: Record<string, string>): string {
  try {
    const url = new URL(base);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  } catch {
    const search = new URLSearchParams(params).toString();
    return `${base}${base.includes("?") ? "&" : "?"}${search}`;
  }
}

function truncate(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}
