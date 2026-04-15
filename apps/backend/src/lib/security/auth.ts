import { requireBusinessAccess, requireRole, type AuthContext } from "@aratti/auth";
import { prisma } from "@aratti/db";
import { auth } from "@clerk/nextjs/server";

import { HttpError } from "../errors";

export async function getAuthContext(): Promise<AuthContext | null> {
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
