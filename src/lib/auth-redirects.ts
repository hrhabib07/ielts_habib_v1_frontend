import type { UserRole } from "@/src/lib/constants";

/** Redirect paths for authenticated users by role. Single source of truth. */
export const ROLE_REDIRECT_PATH: Record<UserRole, string> = {
  STUDENT: "/profile/reading",
  INSTRUCTOR: "/dashboard/instructor",
  ADMIN: "/dashboard/admin",
};

export function getRedirectPathForRole(role: UserRole): string {
  return ROLE_REDIRECT_PATH[role];
}
