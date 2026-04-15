import type { UserRole } from "@aratti/types";

export interface AuthContext {
  userId: string;
  clerkUserId?: string;
  email?: string;
  role: UserRole;
  businessIds?: string[];
}
