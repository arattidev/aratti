import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const isoDateStringSchema = z.string().datetime();

export const currencyCodeSchema = z.literal("ARS");

export const latSchema = z.number().min(-90).max(90);

export const lngSchema = z.number().min(-180).max(180);

export const paginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const idempotencyKeySchema = z.string().min(8).max(128);
