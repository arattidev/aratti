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
