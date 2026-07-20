import type { StudentProfile } from "@/src/lib/api/types";
import { normalizeCountryCode } from "@/src/lib/countryCodes";
import { ENABLE_READING } from "@/src/lib/platform-config";

function resolveDisplayName(profile: StudentProfile | null): string {
  if (!profile) return "";
  return (
    profile.displayName?.trim() ||
    (typeof profile.nickname === "string" ? profile.nickname.trim() : "") ||
    (typeof profile.name === "string" ? profile.name.trim() : "") ||
    ""
  );
}

/** English Foundations: nickname / display name only. */
export function isStudentPlayerReady(profile: StudentProfile | null): boolean {
  return Boolean(resolveDisplayName(profile));
}

/**
 * True when the student has saved all required profile fields and a target band.
 * Used for server redirects (home, reading) and client checks.
 */
export function isStudentLearningReady(profile: StudentProfile | null): boolean {
  if (!ENABLE_READING) {
    return isStudentPlayerReady(profile);
  }
  if (!profile) return false;
  if (profile.profileCompletion) {
    return profile.profileCompletion.isComplete;
  }

  if (!profile.username?.trim()) return false;

  const displayName = resolveDisplayName(profile);
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
  if (!ENABLE_READING) return false;
  if (!profile) return false;
  if (profile.profileCompletion) {
    return profile.profileCompletion.needsMigration;
  }
  const current = normalizeCountryCode(profile.currentCountry);
  const dream = normalizeCountryCode(profile.dreamCountry);
  return !profile.username?.trim() || Boolean(current && dream && current === dream);
}

export type MigrationReasonKey = "missingUsername" | "sameCountries";

/** Locale-agnostic keys — translate via ONBOARDING_COPY in the UI. */
export function getMigrationReasonKeys(
  profile: StudentProfile | null,
): MigrationReasonKey[] {
  if (!ENABLE_READING) return [];
  if (!profile) return [];
  const reasons: MigrationReasonKey[] = [];

  if (profile.profileCompletion?.missingUsername || !profile.username?.trim()) {
    reasons.push("missingUsername");
  }

  if (profile.profileCompletion?.sameCountries) {
    reasons.push("sameCountries");
  } else {
    const current = normalizeCountryCode(profile.currentCountry);
    const dream = normalizeCountryCode(profile.dreamCountry);
    if (current && dream && current === dream) {
      reasons.push("sameCountries");
    }
  }

  return reasons;
}

