import { fetchStudentProfileServer } from "@/src/lib/api/server-profile";
import { getStudentHomeHref } from "@/src/lib/auth-redirects";
import type { UserRole } from "@/src/lib/constants";
import { ENABLE_READING, PRIMARY_STUDENT_HREF } from "@/src/lib/platform-config";
import {
  isStudentLearningReady,
  needsProfileMigration,
} from "@/src/lib/student-learning-gate";

/**
 * Where a signed-in visit to `/` should go.
 * Guests stay on the cached homepage (returns null).
 * Same student rules as the old homepage server redirect.
 * Admin and instructor go straight to the dashboard the homepage button used.
 */
export async function resolveHomeEntryRedirect(input: {
  role: UserRole;
  token: string | null;
}): Promise<string | null> {
  if (input.role === "ADMIN") return "/dashboard/admin";
  if (input.role === "INSTRUCTOR") return "/dashboard/instructor";
  if (input.role !== "STUDENT") return null;

  if (!ENABLE_READING) return PRIMARY_STUDENT_HREF;

  if (!input.token) return getStudentHomeHref(false);

  const result = await fetchStudentProfileServer(input.token);
  if (result.status === "ok" && result.profile) {
    if (
      needsProfileMigration(result.profile) ||
      !isStudentLearningReady(result.profile)
    ) {
      return needsProfileMigration(result.profile)
        ? "/onboarding?migrate=1"
        : "/onboarding";
    }
    return getStudentHomeHref(result.profile.needsUsername === true);
  }
  if (result.status === "ok" && !result.profile) return "/onboarding";
  return getStudentHomeHref(false);
}
