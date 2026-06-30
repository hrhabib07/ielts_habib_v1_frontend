import type { StudentProfile } from "@/src/lib/api/types";

/** Preferred greeting name: displayName, nickname, else username. */
export function getStudentDisplayName(
  profile:
    | {
        displayName?: string | null;
        username?: string | null;
        nickname?: string | null;
        name?: string | null;
      }
    | null
    | undefined,
): string | null {
  if (!profile) return null;
  const display = profile.displayName?.trim();
  if (display) return display;
  const nick =
    typeof profile.nickname === "string" ? profile.nickname.trim() : "";
  if (nick) return nick;
  const legacyName = typeof profile.name === "string" ? profile.name.trim() : "";
  if (legacyName) return legacyName;
  const handle = profile.username?.trim();
  if (handle) return handle;
  return null;
}
