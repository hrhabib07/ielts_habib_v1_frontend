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

/** Paid users who still need a permanent @handle go here first. */
export const USERNAME_CLAIM_HREF = "/username?next=/player";

export function getStudentHomeHref(needsUsername: boolean): string {
  return needsUsername ? USERNAME_CLAIM_HREF : PRIMARY_STUDENT_HREF;
}

/**
 * Safe post-login destination from query (`redirect`, `next`, or `returnTo`).
 * Only same-origin relative paths are allowed (open-redirect safe).
 */
export function sanitizeAuthReturnPath(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;
  let value = raw.trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    return null;
  }
  value = value.trim();
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes("://")) return null;
  return value;
}

export function readAuthReturnPathFromSearch(
  search: string | URLSearchParams,
): string | null {
  const params =
    typeof search === "string" ? new URLSearchParams(search) : search;
  return (
    sanitizeAuthReturnPath(params.get("redirect")) ??
    sanitizeAuthReturnPath(params.get("next")) ??
    sanitizeAuthReturnPath(params.get("returnTo"))
  );
}

/** Client-side: return path from current URL, or fallback when absent. */
export function getStudentPostAuthHref(fallback = "/"): string {
  if (typeof window === "undefined") return fallback;
  return readAuthReturnPathFromSearch(window.location.search) ?? fallback;
}
