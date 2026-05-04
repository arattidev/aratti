import { z } from "zod";

const roleSchema = z.enum(["USER", "BUSINESS", "BUSINESS_OWNER", "BUSINESS_STAFF", "ADMIN"]);

export const registerBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(80).optional(),
  businessName: z.string().min(2).max(120).optional(),
});

const passwordLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const legacyClerkLoginSchema = z.object({
  clerkUserId: z.string().min(3),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  locale: z.string().default("es-AR"),
});

const magicLinkLoginSchema = z.object({
  email: z.string().email(),
  magicToken: z.string().min(8),
});

export const loginBodySchema = z.union([passwordLoginSchema, legacyClerkLoginSchema, magicLinkLoginSchema]);

export const oauthLoginBodySchema = z.object({
  provider: z.enum(["google"]),
  email: z.string().email(),
  name: z.string().min(2).max(120).optional(),
  oauthSubject: z.string().min(3).optional(),
});

export const magicLinkRequestBodySchema = z.object({
  email: z.string().email(),
});

export const magicLinkVerifyBodySchema = z.object({
  email: z.string().email(),
  token: z.string().min(8),
});

export const loginResponseSchema = z.object({
  userId: z.string().uuid(),
  role: roleSchema,
  accountStatus: z.enum(["ACTIVE", "BLOCKED", "PENDING_DELETION"]),
  accessToken: z.string().min(16).optional(),
  expiresAt: z.string().datetime().optional(),
});

export const registerResponseSchema = loginResponseSchema;
