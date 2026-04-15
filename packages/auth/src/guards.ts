import type { AuthContext } from "./auth-context";
import { hasMinimumRole } from "./roles";

export class AuthorizationError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function requireRole(context: AuthContext, requiredRole: AuthContext["role"]): void {
  if (!hasMinimumRole(context.role, requiredRole)) {
    throw new AuthorizationError("Missing required role");
  }
}

export function requireBusinessAccess(context: AuthContext, businessId: string): void {
  if (context.role === "ADMIN") {
    return;
  }

  if (!context.businessIds?.includes(businessId)) {
    throw new AuthorizationError("No access to business");
  }
}
