import { z } from "zod";

import { latSchema, lngSchema, paginationQuerySchema, uuidSchema } from "./common";

export const nearbyOffersQuerySchema = paginationQuerySchema.extend({
  lat: latSchema,
  lng: lngSchema,
  radiusKm: z.coerce.number().min(0.2).max(30).default(5),
  category: z.string().optional(),
  maxPriceArs: z.coerce.number().int().positive().optional(),
  pickupStart: z.string().datetime().optional(),
  pickupEnd: z.string().datetime().optional(),
});

export const offerDetailParamsSchema = z.object({
  id: uuidSchema,
});

export const nearbyOfferDtoSchema = z.object({
  id: uuidSchema,
  businessId: uuidSchema,
  businessName: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  rescuePriceArs: z.number().int(),
  originalPriceArs: z.number().int(),
  quantityAvailable: z.number().int(),
  pickupStartAt: z.string().datetime(),
  pickupEndAt: z.string().datetime(),
  imageUrl: z.string().url().nullable().optional(),
  status: z.string(),
  isFeatured: z.boolean(),
  distanceKm: z.number().optional(),
});

export const nearbyOffersResponseSchema = z.object({
  data: z.array(nearbyOfferDtoSchema),
  nextCursor: z.string().nullable(),
});
