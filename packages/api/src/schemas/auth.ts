import { z } from "zod";

export const loginBodySchema = z.object({
  clerkUserId: z.string().min(3),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  locale: z.string().default("es-AR"),
});

export const loginResponseSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["USER", "BUSINESS_OWNER", "BUSINESS_STAFF", "ADMIN"]),
  accountStatus: z.enum(["ACTIVE", "BLOCKED", "PENDING_DELETION"]),
});
