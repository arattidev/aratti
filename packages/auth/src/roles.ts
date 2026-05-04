import type { UserRole } from "@aratti/types";

export const roleHierarchy: Record<UserRole, number> = {
  USER: 1,
  BUSINESS: 2,
  BUSINESS_STAFF: 3,
  BUSINESS_OWNER: 4,
  ADMIN: 5,
};

export function hasMinimumRole(currentRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
}

export function canManageBusiness(role: UserRole): boolean {
  return role === "BUSINESS" || role === "BUSINESS_OWNER" || role === "BUSINESS_STAFF" || role === "ADMIN";
}
