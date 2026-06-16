import type { StudentProfile } from "@/src/lib/api/types";

/** Preferred greeting name: displayName, else username. */
export function getStudentDisplayName(
  profile: { displayName?: string | null; username?: string | null } | null | undefined,
): string | null {
  if (!profile) return null;
  const display = profile.displayName?.trim();
  if (display) return display;
  const handle = profile.username?.trim();
  if (handle) return handle;
  return null;
}
