import { z } from "zod";

import { idempotencyKeySchema, uuidSchema } from "./common";

export const createPaymentBodySchema = z.object({
  orderId: uuidSchema,
  provider: z.enum(["MERCADO_PAGO", "APPLE_PAY", "STRIPE"]),
  idempotencyKey: idempotencyKeySchema,
});

export const createPaymentResponseSchema = z.object({
  paymentId: uuidSchema,
  provider: z.enum(["MERCADO_PAGO", "APPLE_PAY", "STRIPE"]),
  status: z.string(),
  checkoutUrl: z.string().url().optional(),
  clientSecret: z.string().optional(),
});

export const refundRequestBodySchema = z.object({
  paymentId: uuidSchema,
  amountArs: z.number().int().positive(),
  reason: z.string().min(4).max(500),
});
