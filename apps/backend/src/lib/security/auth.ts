import { requireBusinessAccess, requireRole, type AuthContext } from "@aratti/auth";
import { prisma } from "@aratti/db";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

import { env } from "../env";
import { HttpError } from "../errors";
import { verifyAccessToken } from "./token";

export async function getAuthContext(): Promise<AuthContext | null> {
  if (env.AUTH_MODE === "BYPASS") {
    return getBypassAuthContext();
  }

  const authResult = await auth();

  if (!authResult.userId) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      clerkUserId: authResult.userId,
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      role: true,
      businessMemberships: {
        where: { deletedAt: null },
        select: { businessId: true },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    clerkUserId: authResult.userId,
    email: user.email,
    role: user.role,
    businessIds: user.businessMemberships.map((membership) => membership.businessId),
  };
}

async function getBypassAuthContext(): Promise<AuthContext | null> {
  const headersList = await headers();
  const authorization = headersList.get("authorization");
  const token = extractBearerToken(authorization);

  if (!token) {
    return null;
  }

  const parsed = verifyAccessToken(token);

  const user = await prisma.user.findFirst({
    where: {
      id: parsed.userId,
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      role: true,
      businessMemberships: {
        where: { deletedAt: null },
        select: { businessId: true },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    businessIds: user.businessMemberships.map((membership) => membership.businessId),
  };
}

export async function requireAuthContext(): Promise<AuthContext> {
  const context = await getAuthContext();
  if (!context) {
    throw new HttpError(401, "unauthorized", "Authentication required");
  }
  return context;
}

export async function requireRoleContext(role: AuthContext["role"]): Promise<AuthContext> {
  const context = await requireAuthContext();

  try {
    requireRole(context, role);
  } catch {
    throw new HttpError(403, "forbidden", "Missing required role");
  }

  return context;
}

export function assertBusinessAccess(context: AuthContext, businessId: string): void {
  try {
    requireBusinessAccess(context, businessId);
  } catch {
    throw new HttpError(403, "forbidden", "No access to this business");
  }
}

function extractBearerToken(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const [prefix, token] = value.split(" ");
  if (prefix?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}
