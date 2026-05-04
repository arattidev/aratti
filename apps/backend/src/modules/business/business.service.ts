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
import type { AuthContext } from "@aratti/auth";

import { createAuditLog } from "../../lib/audit";
import { env } from "../../lib/env";
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

    const updateInput: {
      offerId: string;
      title?: string;
      description?: string;
      category?: string;
      originalPriceArs?: number;
      rescuePriceArs?: number;
      quantityTotal?: number;
      pickupStartAt?: Date;
      pickupEndAt?: Date;
      status?: "DRAFT" | "ACTIVE" | "PAUSED" | "SOLD_OUT" | "EXPIRED" | "ARCHIVED";
      imageUrls?: string[];
      tags?: string[];
    } = {
      offerId: existingOffer.id,
    };

    if (payload.title !== undefined) updateInput.title = payload.title;
    if (payload.description !== undefined) updateInput.description = payload.description;
    if (payload.category !== undefined) updateInput.category = payload.category;
    if (payload.originalPriceArs !== undefined) updateInput.originalPriceArs = payload.originalPriceArs;
    if (payload.rescuePriceArs !== undefined) updateInput.rescuePriceArs = payload.rescuePriceArs;
    if (payload.quantityTotal !== undefined) updateInput.quantityTotal = payload.quantityTotal;
    if (payload.pickupStartAt !== undefined) updateInput.pickupStartAt = new Date(payload.pickupStartAt);
    if (payload.pickupEndAt !== undefined) updateInput.pickupEndAt = new Date(payload.pickupEndAt);
    if (payload.status !== undefined) updateInput.status = payload.status;
    if (payload.imageUrls !== undefined) updateInput.imageUrls = payload.imageUrls;
    if (payload.tags !== undefined) updateInput.tags = payload.tags;

    const updatedOffer = await this.businessRepository.updateOffer(updateInput);

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

  async listBusinessOffers(context: AuthContext, query: unknown) {
    const parsed = listBusinessOffersQuerySchema.parse(query);

    const businessId = context.businessIds?.[0];
    if (!businessId) {
      throw new HttpError(403, "forbidden", "No business assigned");
    }

    assertBusinessAccess(context, businessId);

    const offers = await this.businessRepository.listBusinessOffers({
      businessId,
      status: parsed.status,
      limit: parsed.limit,
    });

    return {
      data: offers.map((offer) => ({
        id: offer.id,
        businessId: offer.businessId,
        title: offer.title,
        category: offer.category,
        status: offer.status,
        rescuePriceArs: offer.rescuePriceArs,
        originalPriceArs: offer.originalPriceArs,
        quantityTotal: offer.quantityTotal,
        quantityAvailable: offer.quantityAvailable,
        pickupStartAt: offer.pickupStartAt.toISOString(),
        pickupEndAt: offer.pickupEndAt.toISOString(),
        imageUrl: offer.images[0]?.imageUrl ?? null,
        createdAt: offer.createdAt.toISOString(),
      })),
    };
  }

  async upsertDailyAvailability(context: AuthContext, input: unknown) {
    const payload = upsertBusinessAvailabilityBodySchema.parse(input);
    assertBusinessAccess(context, payload.businessId);

    const offer = await this.businessRepository.findOfferById(payload.offerId);
    if (!offer || offer.businessId !== payload.businessId) {
      throw new HttpError(404, "offer_not_found", "Offer not found for this business");
    }

    const date = new Date(`${payload.date}T00:00:00.000Z`);
    const availabilityInput: {
      businessId: string;
      offerId: string;
      date: Date;
      quantityPublished: number;
      quantityAvailable: number;
      status: "DRAFT" | "PUBLISHED" | "CLOSED";
      notes?: string;
    } = {
      businessId: payload.businessId,
      offerId: payload.offerId,
      date,
      quantityPublished: payload.quantityPublished,
      quantityAvailable: payload.quantityAvailable ?? payload.quantityPublished,
      status: payload.status,
      ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
    };

    const availability = await this.businessRepository.upsertAvailability(availabilityInput);

    await createAuditLog({
      actorUserId: context.userId,
      actorRole: context.role,
      action: "business_availability_upserted",
      entityType: "business_availability",
      entityId: availability.id,
      metadata: {
        businessId: payload.businessId,
        offerId: payload.offerId,
        date: payload.date,
      },
    });

    return {
      id: availability.id,
      businessId: availability.businessId,
      offerId: availability.offerId,
      offerTitle: availability.offer.title,
      date: availability.date.toISOString().slice(0, 10),
      quantityPublished: availability.quantityPublished,
      quantityAvailable: availability.quantityAvailable,
      status: availability.status,
      notes: availability.notes,
    };
  }

  async listDailyAvailability(context: AuthContext, query: unknown) {
    const parsed = listBusinessAvailabilityQuerySchema.parse(query);
    const businessId = context.businessIds?.[0];
    if (!businessId) {
      throw new HttpError(403, "forbidden", "No business assigned");
    }

    assertBusinessAccess(context, businessId);
    const from = parsed.from ? new Date(`${parsed.from}T00:00:00.000Z`) : undefined;
    const to = parsed.to ? new Date(`${parsed.to}T23:59:59.999Z`) : undefined;

    const rows = await this.businessRepository.listBusinessAvailability({
      businessId,
      from,
      to,
      limit: parsed.limit,
    });

    return {
      data: rows.map((row) => ({
        id: row.id,
        offerId: row.offerId,
        offerTitle: row.offer.title,
        date: row.date.toISOString().slice(0, 10),
        quantityPublished: row.quantityPublished,
        quantityAvailable: row.quantityAvailable,
        status: row.status,
        notes: row.notes,
      })),
    };
  }

  async updateDailyAvailability(context: AuthContext, params: { id: string }, input: unknown) {
    const parsedParams = updateBusinessAvailabilityParamsSchema.parse(params);
    const payload = updateBusinessAvailabilityBodySchema.parse(input);

    const current = await this.businessRepository.findAvailabilityById(parsedParams.id);
    if (!current) {
      throw new HttpError(404, "availability_not_found", "Availability record not found");
    }

    assertBusinessAccess(context, current.businessId);
    const updateInput: {
      id: string;
      quantityPublished?: number;
      quantityAvailable?: number;
      status?: "DRAFT" | "PUBLISHED" | "CLOSED";
      notes?: string;
    } = {
      id: current.id,
    };

    if (payload.quantityPublished !== undefined) updateInput.quantityPublished = payload.quantityPublished;
    if (payload.quantityAvailable !== undefined) updateInput.quantityAvailable = payload.quantityAvailable;
    if (payload.status !== undefined) updateInput.status = payload.status;
    if (payload.notes !== undefined) updateInput.notes = payload.notes;

    const updated = await this.businessRepository.updateAvailability(updateInput);

    await createAuditLog({
      actorUserId: context.userId,
      actorRole: context.role,
      action: "business_availability_updated",
      entityType: "business_availability",
      entityId: updated.id,
    });

    return {
      id: updated.id,
      offerId: updated.offerId,
      offerTitle: updated.offer.title,
      date: updated.date.toISOString().slice(0, 10),
      quantityPublished: updated.quantityPublished,
      quantityAvailable: updated.quantityAvailable,
      status: updated.status,
      notes: updated.notes,
    };
  }

  async createPayout(context: AuthContext, input: unknown) {
    const payload = createBusinessPayoutBodySchema.parse(input);
    assertBusinessAccess(context, payload.businessId);

    const isMock = env.PAYMENTS_MODE === "MOCK";

    const payoutInput: {
      businessId: string;
      amountArs: number;
      provider: "MOCK" | "STRIPE";
      status: "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED";
      reference?: string;
      metadata?: Record<string, unknown>;
      paidAt?: Date;
    } = {
      businessId: payload.businessId,
      amountArs: payload.amountArs,
      provider: isMock ? "MOCK" : "STRIPE",
      status: isMock ? "SUCCEEDED" : "PENDING",
      metadata: {
        mode: env.PAYMENTS_MODE,
      },
      ...(isMock ? { reference: `mock_payout_${Date.now()}`, paidAt: new Date() } : {}),
    };

    const payout = await this.businessRepository.createPayout(payoutInput);

    await createAuditLog({
      actorUserId: context.userId,
      actorRole: context.role,
      action: "business_payout_created",
      entityType: "payout",
      entityId: payout.id,
      metadata: {
        businessId: payload.businessId,
        amountArs: payload.amountArs,
        mode: env.PAYMENTS_MODE,
      },
    });

    return {
      id: payout.id,
      amountArs: payout.amountArs,
      currencyCode: payout.currencyCode,
      provider: payout.provider,
      status: payout.status,
      reference: payout.reference,
      paidAt: payout.paidAt?.toISOString() ?? null,
      createdAt: payout.createdAt.toISOString(),
    };
  }

  async listPayouts(context: AuthContext, query: unknown) {
    const parsed = listBusinessPayoutsQuerySchema.parse(query);
    const businessId = context.businessIds?.[0];
    if (!businessId) {
      throw new HttpError(403, "forbidden", "No business assigned");
    }

    assertBusinessAccess(context, businessId);
    const payouts = await this.businessRepository.listPayouts({
      businessId,
      status: parsed.status,
      limit: parsed.limit,
    });

    return {
      data: payouts.map((payout) => ({
        id: payout.id,
        amountArs: payout.amountArs,
        currencyCode: payout.currencyCode,
        provider: payout.provider,
        status: payout.status,
        reference: payout.reference,
        paidAt: payout.paidAt?.toISOString() ?? null,
        createdAt: payout.createdAt.toISOString(),
      })),
    };
  }
}
