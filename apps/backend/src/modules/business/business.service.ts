import {
  businessOrdersQuerySchema,
  createBusinessOfferBodySchema,
  updateBusinessOfferBodySchema,
  updateBusinessOfferParamsSchema,
} from "@aratti/api";
import type { AuthContext } from "@aratti/auth";

import { createAuditLog } from "../../lib/audit";
import { HttpError } from "../../lib/errors";
import { assertBusinessAccess } from "../../lib/security/auth";
import { BusinessRepository } from "./business.repository";

export class BusinessService {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async createOffer(context: AuthContext, input: unknown) {
    const payload = createBusinessOfferBodySchema.parse(input);

    assertBusinessAccess(context, payload.businessId);

    const business = await this.businessRepository.findBusinessById(payload.businessId);

    if (!business || business.verificationStatus !== "ACTIVE") {
      throw new HttpError(404, "business_not_active", "Business not active");
    }

    if (payload.rescuePriceArs >= payload.originalPriceArs) {
      throw new HttpError(400, "invalid_pricing", "Rescue price must be lower than original price");
    }

    const offer = await this.businessRepository.createOffer({
      businessId: payload.businessId,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      originalPriceArs: payload.originalPriceArs,
      rescuePriceArs: payload.rescuePriceArs,
      quantityTotal: payload.quantityTotal,
      pickupStartAt: new Date(payload.pickupStartAt),
      pickupEndAt: new Date(payload.pickupEndAt),
      imageUrls: payload.imageUrls,
      tags: payload.tags,
    });

    await createAuditLog({
      actorUserId: context.userId,
      actorRole: context.role,
      action: "business_offer_created",
      entityType: "offer",
      entityId: offer.id,
      metadata: {
        businessId: payload.businessId,
      },
    });

    return {
      offerId: offer.id,
      status: offer.status,
      quantityAvailable: offer.quantityAvailable,
    };
  }

  async updateOffer(context: AuthContext, params: { id: string }, input: unknown) {
    const parsedParams = updateBusinessOfferParamsSchema.parse(params);
    const payload = updateBusinessOfferBodySchema.parse(input);

    const existingOffer = await this.businessRepository.findOfferById(parsedParams.id);
    if (!existingOffer) {
      throw new HttpError(404, "offer_not_found", "Offer not found");
    }

    assertBusinessAccess(context, existingOffer.businessId);

    const updatedOffer = await this.businessRepository.updateOffer({
      offerId: existingOffer.id,
      ...payload,
      pickupStartAt: payload.pickupStartAt ? new Date(payload.pickupStartAt) : undefined,
      pickupEndAt: payload.pickupEndAt ? new Date(payload.pickupEndAt) : undefined,
    });

    await createAuditLog({
      actorUserId: context.userId,
      actorRole: context.role,
      action: "business_offer_updated",
      entityType: "offer",
      entityId: updatedOffer.id,
    });

    return {
      offerId: updatedOffer.id,
      status: updatedOffer.status,
      quantityAvailable: updatedOffer.quantityAvailable,
    };
  }

  async listBusinessOrders(context: AuthContext, query: unknown) {
    const parsed = businessOrdersQuerySchema.parse(query);

    const businessId = context.businessIds?.[0];
    if (!businessId) {
      throw new HttpError(403, "forbidden", "No business assigned");
    }

    assertBusinessAccess(context, businessId);

    const orders = await this.businessRepository.listBusinessOrders({
      businessId,
      status: parsed.status,
      limit: parsed.limit,
    });

    return {
      data: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        offerTitle: order.offer.title,
        quantity: order.quantity,
        totalArs: order.totalArs,
        customer: {
          id: order.user.id,
          fullName: [order.user.firstName, order.user.lastName].filter(Boolean).join(" "),
          email: order.user.email,
        },
        createdAt: order.createdAt.toISOString(),
      })),
      nextCursor: null,
    };
  }
}
