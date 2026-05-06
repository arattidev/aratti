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
  MERCADO_PAGO_PUBLIC_KEY: z.string().optional(),
  MERCADO_PAGO_WEBHOOK_SECRET: z.string().optional(),
  MERCADO_PAGO_CLIENT_ID: z.string().optional(),
  MERCADO_PAGO_CLIENT_SECRET: z.string().optional(),
  MERCADO_PAGO_OAUTH_REDIRECT_URI: z.string().url().optional(),
  MERCADO_PAGO_SUCCESS_URL: z.string().url().optional(),
  MERCADO_PAGO_FAILURE_URL: z.string().url().optional(),
  MERCADO_PAGO_PENDING_URL: z.string().url().optional(),
  MERCADO_PAGO_WEBHOOK_URL: z.string().url().optional(),
  MARKETPLACE_COMMISSION_PERCENTAGE: z.coerce.number().min(0).max(100).default(2),
  SESSION_ENCRYPTION_KEY: z.string().optional(),
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

  if (value.PAYMENTS_MODE === "LIVE") {
    const requiredLive: Array<keyof typeof value> = [
      "MERCADO_PAGO_CLIENT_ID",
      "MERCADO_PAGO_CLIENT_SECRET",
      "MERCADO_PAGO_OAUTH_REDIRECT_URI",
      "MERCADO_PAGO_WEBHOOK_SECRET",
      "MERCADO_PAGO_WEBHOOK_URL",
      "SESSION_ENCRYPTION_KEY",
    ];

    for (const key of requiredLive) {
      if (!value[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} is required when PAYMENTS_MODE=LIVE`,
        });
      }
    }
  }
});

export type AppEnv = z.infer<typeof envSchema>;

export const env: AppEnv = envSchema.parse(process.env);
