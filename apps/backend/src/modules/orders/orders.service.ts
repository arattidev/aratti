import { createHash, randomBytes } from "node:crypto";

import { createOrderBodySchema, orderHistoryQuerySchema, pickupOrderBodySchema } from "@aratti/api";
import type { AuthContext } from "@aratti/auth";

import { createAuditLog } from "../../lib/audit";
import { env } from "../../lib/env";
import { HttpError } from "../../lib/errors";
import { evaluatePurchaseRisk } from "../../lib/fraud";
import { assertBusinessAccess } from "../../lib/security/auth";
import { PaymentsRepository } from "../payments/payments.repository";
import { PaymentsService } from "../payments/payments.service";
import { OrdersRepository } from "./orders.repository";

export class OrdersService {
  private readonly paymentsService: PaymentsService;

  constructor(private readonly ordersRepository: OrdersRepository) {
    this.paymentsService = new PaymentsService(new PaymentsRepository());
  }

  async createOrder(context: AuthContext, input: unknown) {
    const payload = createOrderBodySchema.parse(input);

    const offer = await this.ordersRepository.findOfferForOrder(payload.offerId);

    if (!offer || offer.deletedAt || offer.status !== "ACTIVE") {
      throw new HttpError(404, "offer_not_found", "Offer unavailable");
    }

    if (offer.quantityAvailable < payload.quantity) {
      throw new HttpError(409, "insufficient_stock", "No hay packs suficientes");
    }

    const risk = await evaluatePurchaseRisk(context.userId);
    if (risk.score >= 80) {
      throw new HttpError(403, "risk_blocked", "Suspicious purchase pattern detected", {
        reasons: risk.reasons,
      });
    }

    const pickupToken = randomBytes(18).toString("hex");
    const pickupTokenHash = hashToken(pickupToken);
    const pickupCode = pickupToken.slice(0, 8).toUpperCase();

    const subtotalArs = offer.rescuePriceArs * payload.quantity;
    const serviceFeeArs = Math.round(subtotalArs * (env.MARKETPLACE_COMMISSION_PERCENTAGE / 100));
    const totalArs = subtotalArs + serviceFeeArs;

    const order = await this.ordersRepository.createPendingOrder({
      userId: context.userId,
      offerId: offer.id,
      quantity: payload.quantity,
      unitPriceArs: offer.rescuePriceArs,
      subtotalArs,
      serviceFeeArs,
      totalArs,
      businessId: offer.businessId,
      pickupQrTokenHash: pickupTokenHash,
      pickupCode,
    });

    const payment = await this.paymentsService.createPayment({
      orderId: order.id,
      userId: context.userId,
      provider: payload.paymentProvider,
      idempotencyKey: payload.idempotencyKey,
    });

    await createAuditLog({
      actorUserId: context.userId,
      actorRole: context.role,
      action: "order_created",
      entityType: "order",
      entityId: order.id,
      riskScore: risk.score,
      metadata: {
        offerId: offer.id,
        quantity: payload.quantity,
      },
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      pickupToken,
      payment,
    };
  }

  async pickupOrder(context: AuthContext, params: { id: string }, body: unknown) {
    const payload = pickupOrderBodySchema.parse(body);
    const order = await this.ordersRepository.findOrderById(params.id);

    if (!order) {
      throw new HttpError(404, "order_not_found", "Order not found");
    }

    assertBusinessAccess(context, order.businessId);

    if (order.status !== "CONFIRMED") {
      throw new HttpError(409, "order_not_confirmed", "Order is not ready for pickup");
    }

    const incomingHash = hashToken(payload.pickupToken);
    if (incomingHash !== order.pickupQrTokenHash) {
      throw new HttpError(400, "pickup_token_invalid", "Pickup token invalid");
    }

    const updated = await this.ordersRepository.markOrderPickedUp(order.id);

    await createAuditLog({
      actorUserId: context.userId,
      actorRole: context.role,
      action: "order_picked_up",
      entityType: "order",
      entityId: updated.id,
      metadata: {
        businessId: updated.businessId,
      },
    });

    return {
      orderId: updated.id,
      status: updated.status,
      pickedUpAt: updated.pickedUpAt?.toISOString(),
    };
  }

  async listUserOrders(context: AuthContext, query: unknown) {
    const parsed = orderHistoryQuerySchema.parse(query);

    const orders = await this.ordersRepository.listUserOrders({
      userId: context.userId,
      statusFilter: parsed.status,
      limit: parsed.limit,
    });

    return {
      data: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        offerTitle: order.offer.title,
        businessName: order.business.name,
        quantity: order.quantity,
        totalArs: order.totalArs,
        status: order.status,
        pickupWindow: {
          startAt: order.offer.pickupStartAt.toISOString(),
          endAt: order.offer.pickupEndAt.toISOString(),
        },
        createdAt: order.createdAt.toISOString(),
      })),
      nextCursor: null,
    };
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
