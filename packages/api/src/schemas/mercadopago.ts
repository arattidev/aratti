import { z } from "zod";

import { uuidSchema } from "./common";

export const mpAuthUrlQuerySchema = z.object({
  businessId: uuidSchema,
});

export const mpAuthUrlResponseSchema = z.object({
  url: z.string().url(),
  expiresAt: z.string().datetime(),
});

export const mpOAuthCallbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

export const mpDisconnectBodySchema = z.object({
  businessId: uuidSchema,
});

export const mpVerifyConnectionQuerySchema = z.object({
  businessId: uuidSchema,
});

export const mpVerifyConnectionResponseSchema = z.object({
  connected: z.boolean(),
  mpUserId: z.string().nullable(),
  liveMode: z.boolean().nullable(),
  expiresAt: z.string().datetime().nullable(),
  scope: z.string().nullable(),
});
