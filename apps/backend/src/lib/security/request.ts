import { headers } from "next/headers";
import { z } from "zod";

import { HttpError } from "../errors";
import { enforceRateLimit } from "./rate-limit";

export async function parseBody<T extends z.ZodTypeAny>(request: Request, schema: T): Promise<z.infer<T>> {
  const payload = await request.json().catch(() => {
    throw new HttpError(400, "invalid_json", "Malformed JSON body");
  });

  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw new HttpError(400, "validation_error", "Request validation failed", parsed.error.flatten());
  }

  return parsed.data;
}

export function parseQuery<T extends z.ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: T,
): z.infer<T> {
  const payload = Object.fromEntries(searchParams.entries());
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw new HttpError(400, "validation_error", "Query validation failed", parsed.error.flatten());
  }

  return parsed.data;
}

export async function applyApiGuard(endpointKey: string) {
  const ip = headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  enforceRateLimit(`${endpointKey}:${ip}`, {
    maxRequests: 100,
    windowMs: 60_000,
  });
}
