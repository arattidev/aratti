import type { UserRole } from "@aratti/types";

export const roleHierarchy: Record<UserRole, number> = {
  USER: 1,
  BUSINESS_STAFF: 2,
  BUSINESS_OWNER: 3,
  ADMIN: 4,
};

export function hasMinimumRole(currentRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
}

export function canManageBusiness(role: UserRole): boolean {
  return role === "BUSINESS_OWNER" || role === "BUSINESS_STAFF" || role === "ADMIN";
}
