import { z } from "zod";

import { uuidSchema } from "./common";

export const createBusinessOfferBodySchema = z.object({
  businessId: uuidSchema,
  title: z.string().min(4).max(120),
  description: z.string().min(8).max(800),
  category: z.string().min(2).max(60),
  originalPriceArs: z.number().int().positive(),
  rescuePriceArs: z.number().int().positive(),
  quantityTotal: z.number().int().positive(),
  pickupStartAt: z.string().datetime(),
  pickupEndAt: z.string().datetime(),
  imageUrls: z.array(z.string().url()).max(8).default([]),
  tags: z.array(z.string().min(2).max(40)).max(8).default([]),
});

export const updateBusinessOfferParamsSchema = z.object({
  id: uuidSchema,
});

export const updateBusinessOfferBodySchema = createBusinessOfferBodySchema.partial().extend({
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "SOLD_OUT", "EXPIRED", "ARCHIVED"]).optional(),
});

export const businessOrdersQuerySchema = z.object({
  status: z
    .enum(["PENDING_PAYMENT", "CONFIRMED", "CANCELLED", "PICKED_UP", "NO_SHOW", "REFUNDED", "PAYMENT_EXPIRED"])
    .optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const listBusinessOffersQuerySchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "SOLD_OUT", "EXPIRED", "ARCHIVED"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(40),
});

export const upsertBusinessAvailabilityBodySchema = z.object({
  businessId: uuidSchema,
  offerId: uuidSchema,
  date: z.string().date(),
  quantityPublished: z.number().int().min(0).max(10000),
  quantityAvailable: z.number().int().min(0).max(10000).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).default("PUBLISHED"),
  notes: z.string().max(280).optional(),
});

export const listBusinessAvailabilityQuerySchema = z.object({
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  limit: z.coerce.number().int().min(1).max(120).default(30),
});

export const updateBusinessAvailabilityParamsSchema = z.object({
  id: uuidSchema,
});

export const updateBusinessAvailabilityBodySchema = z.object({
  quantityPublished: z.number().int().min(0).max(10000).optional(),
  quantityAvailable: z.number().int().min(0).max(10000).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional(),
  notes: z.string().max(280).optional(),
});

export const createBusinessPayoutBodySchema = z.object({
  businessId: uuidSchema,
  amountArs: z.number().int().positive(),
});

export const listBusinessPayoutsQuerySchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SUCCEEDED", "FAILED"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});
