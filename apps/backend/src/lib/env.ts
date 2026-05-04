import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  AUTH_MODE: z.enum(["BYPASS", "CLERK"]).default("BYPASS"),
  AUTH_TOKEN_SECRET: z.string().min(16).default("dev-only-auth-token-secret-change-me"),
  CLERK_SECRET_KEY: z.string().optional(),
  PAYMENTS_MODE: z.enum(["MOCK", "LIVE"]).default("MOCK"),
  MEDIA_MODE: z.enum(["URL_ONLY", "LIVE"]).default("URL_ONLY"),
  MERCADO_PAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADO_PAGO_WEBHOOK_SECRET: z.string().optional(),
  API_BASE_URL: z.string().url().optional(),
  APP_TIMEZONE: z.string().default("America/Argentina/Buenos_Aires"),
  APP_DEFAULT_CURRENCY: z.literal("ARS").default("ARS"),
  INTERNAL_WEBHOOK_SIGNING_SECRET: z.string().optional(),
}).superRefine((value, ctx) => {
  if (value.AUTH_MODE === "CLERK" && !value.CLERK_SECRET_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["CLERK_SECRET_KEY"],
      message: "CLERK_SECRET_KEY is required when AUTH_MODE=CLERK",
    });
  }
});

export type AppEnv = z.infer<typeof envSchema>;

export const env: AppEnv = envSchema.parse(process.env);
