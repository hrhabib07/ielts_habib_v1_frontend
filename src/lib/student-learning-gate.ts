import type { StudentProfile } from "@/src/lib/api/types";
import { normalizeCountryCode } from "@/src/lib/countryCodes";

/**
 * True when the student has saved all required profile fields and a target band.
 * Used for server redirects (home, reading) and client checks.
 */
export function isStudentLearningReady(profile: StudentProfile | null): boolean {
  if (!profile) return false;
  if (profile.profileCompletion) {
    return profile.profileCompletion.isComplete;
  }

  if (!profile.username?.trim()) return false;

  const displayName =
    profile.displayName?.trim() ||
    (typeof profile.nickname === "string" ? profile.nickname.trim() : "") ||
    (typeof profile.name === "string" ? profile.name.trim() : "");
  if (!displayName) return false;

  const current = normalizeCountryCode(profile.currentCountry);
  const dream = normalizeCountryCode(profile.dreamCountry);
  if (!current || !dream || current === dream) return false;

  const band =
    profile.desiredBandScore ??
    profile.targetBands?.reading ??
    null;
  if (band == null) return false;

  return true;
}

export function needsProfileMigration(profile: StudentProfile | null): boolean {
  if (!profile) return false;
  if (profile.profileCompletion) {
    return profile.profileCompletion.needsMigration;
  }
  const current = normalizeCountryCode(profile.currentCountry);
  const dream = normalizeCountryCode(profile.dreamCountry);
  return !profile.username?.trim() || Boolean(current && dream && current === dream);
}

export function getMigrationReasons(profile: StudentProfile | null): string[] {
  if (!profile) return [];
  const reasons: string[] = [];

  if (profile.profileCompletion?.missingUsername || !profile.username?.trim()) {
    reasons.push(
      "You need a permanent username. It powers your public profile link and cannot be changed later.",
    );
  }

  if (profile.profileCompletion?.sameCountries) {
    reasons.push(
      "Your current country and dream country are the same. Pick two different countries so your journey map works correctly.",
    );
  } else {
    const current = normalizeCountryCode(profile.currentCountry);
    const dream = normalizeCountryCode(profile.dreamCountry);
    if (current && dream && current === dream) {
      reasons.push(
        "Your current country and dream country are the same. Pick two different countries so your journey map works correctly.",
      );
    }
  }

  return reasons;
}
