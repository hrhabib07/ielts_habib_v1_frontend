import type { UserRole } from "@/src/lib/constants";
import { PRIMARY_STUDENT_HREF } from "@/src/lib/platform-config";

/** Redirect paths for authenticated users by role. Single source of truth. */
export const ROLE_REDIRECT_PATH: Record<UserRole, string> = {
  STUDENT: PRIMARY_STUDENT_HREF,
  INSTRUCTOR: "/dashboard/instructor",
  ADMIN: "/dashboard/admin",
};

export function getRedirectPathForRole(role: UserRole): string {
  return ROLE_REDIRECT_PATH[role];
}
