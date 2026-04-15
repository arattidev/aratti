import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  MERCADO_PAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADO_PAGO_WEBHOOK_SECRET: z.string().optional(),
  API_BASE_URL: z.string().url().optional(),
  APP_TIMEZONE: z.string().default("America/Argentina/Buenos_Aires"),
  APP_DEFAULT_CURRENCY: z.literal("ARS").default("ARS"),
  INTERNAL_WEBHOOK_SIGNING_SECRET: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export const env: AppEnv = envSchema.parse(process.env);
