import { createHmac, timingSafeEqual } from "node:crypto";

import type { AuthContext } from "@aratti/auth";

import { env } from "../env";
import { HttpError } from "../errors";

interface TokenPayload {
  sub: string;
  role: AuthContext["role"];
  email?: string;
  businessIds?: string[];
  exp: number;
}

const tokenVersion = "v1";

export function createAccessToken(context: AuthContext, expiresInSeconds = 60 * 60 * 24 * 7): { token: string; expiresAt: string } {
  const payload: TokenPayload = {
    sub: context.userId,
    role: context.role,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  if (context.email !== undefined) {
    payload.email = context.email;
  }

  if (context.businessIds !== undefined) {
    payload.businessIds = context.businessIds;
  }

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(`${tokenVersion}.${encodedPayload}`);
  const token = `${tokenVersion}.${encodedPayload}.${signature}`;

  return {
    token,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  };
}

export function verifyAccessToken(token: string): AuthContext {
  const [version, encodedPayload, signature] = token.split(".");

  if (!version || !encodedPayload || !signature || version !== tokenVersion) {
    throw new HttpError(401, "unauthorized", "Invalid access token format");
  }

  const expectedSignature = sign(`${version}.${encodedPayload}`);
  if (!secureEqual(signature, expectedSignature)) {
    throw new HttpError(401, "unauthorized", "Invalid access token signature");
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as TokenPayload;

  if (!payload.sub || !payload.role || !payload.exp) {
    throw new HttpError(401, "unauthorized", "Invalid access token payload");
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new HttpError(401, "unauthorized", "Access token expired");
  }

  const context: AuthContext = {
    userId: payload.sub,
    role: payload.role,
    businessIds: payload.businessIds ?? [],
  };

  if (payload.email !== undefined) {
    context.email = payload.email;
  }

  return context;
}

function sign(content: string): string {
  return createHmac("sha256", env.AUTH_TOKEN_SECRET).update(content).digest("base64url");
}

function secureEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
