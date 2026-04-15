import { z } from "zod";

import { idempotencyKeySchema, uuidSchema } from "./common";

export const createOrderBodySchema = z.object({
  offerId: uuidSchema,
  quantity: z.number().int().min(1).max(10),
  paymentProvider: z.enum(["MERCADO_PAGO", "APPLE_PAY", "STRIPE"]),
  idempotencyKey: idempotencyKeySchema,
});

export const createOrderResponseSchema = z.object({
  orderId: uuidSchema,
  orderNumber: z.string(),
  status: z.string(),
  pickupToken: z.string().optional(),
  payment: z.object({
    paymentId: uuidSchema,
    provider: z.enum(["MERCADO_PAGO", "APPLE_PAY", "STRIPE"]),
    status: z.string(),
    clientSecret: z.string().optional(),
    checkoutUrl: z.string().url().optional(),
  }),
});

export const pickupOrderParamsSchema = z.object({
  id: uuidSchema,
});

export const pickupOrderBodySchema = z.object({
  pickupToken: z.string().min(8),
});

export const orderHistoryQuerySchema = z.object({
  status: z.enum(["active", "past", "cancelled"]).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(30).default(20),
});
