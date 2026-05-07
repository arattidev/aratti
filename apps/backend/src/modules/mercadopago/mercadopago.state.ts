import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { env } from "../../lib/env";
import { HttpError } from "../../lib/errors";

const STATE_VERSION = "v1";
const STATE_TTL_MS = 10 * 60 * 1000;

interface OAuthStatePayload {
  businessId: string;
  userId: string;
  exp: number;
  nonce: string;
}

function getSecret(): string {
  if (!env.SESSION_ENCRYPTION_KEY) {
    throw new Error("SESSION_ENCRYPTION_KEY is required to sign OAuth state");
  }
  return env.SESSION_ENCRYPTION_KEY;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function fromBase64url(input: string): Buffer {
  return Buffer.from(input, "base64url");
}

export function buildOAuthState(input: { businessId: string; userId: string }): string {
  const payload: OAuthStatePayload = {
    businessId: input.businessId,
    userId: input.userId,
    exp: Date.now() + STATE_TTL_MS,
    nonce: randomBytes(8).toString("hex"),
  };

  const body = base64url(JSON.stringify(payload));
  const signature = sign(`${STATE_VERSION}.${body}`);

  return `${STATE_VERSION}.${body}.${signature}`;
}

export function verifyOAuthState(state: string): OAuthStatePayload {
  const parts = state.split(".");
  if (parts.length !== 3 || parts[0] !== STATE_VERSION) {
    throw new HttpError(400, "invalid_state", "Invalid OAuth state");
  }

  const [, body, signature] = parts as [string, string, string];

  const expected = sign(`${STATE_VERSION}.${body}`);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
    throw new HttpError(400, "invalid_state", "OAuth state signature mismatch");
  }

  let payload: OAuthStatePayload;
  try {
    payload = JSON.parse(fromBase64url(body).toString("utf8")) as OAuthStatePayload;
  } catch {
    throw new HttpError(400, "invalid_state", "OAuth state payload malformed");
  }

  if (typeof payload.exp !== "number" || payload.exp < Date.now()) {
    throw new HttpError(400, "expired_state", "OAuth state expired");
  }

  if (!payload.businessId || !payload.userId) {
    throw new HttpError(400, "invalid_state", "OAuth state missing required fields");
  }

  return payload;
}

export function getOAuthStateTtlMs(): number {
  return STATE_TTL_MS;
}
