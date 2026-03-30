import type { StudentProfile } from "@/src/lib/api/types";
import { normalizeJourneyCountryLabel } from "@/src/lib/journeyCountries";

/**
 * True when the student has saved all required profile fields and a Reading target band.
 * Used for server redirects (home, reading) and client checks.
 */
export function isStudentLearningReady(profile: StudentProfile | null): boolean {
  if (!profile) return false;
  if (!profile.name?.trim()) return false;
  if (profile.targetBands?.reading == null) return false;

  const p = profile.profile;
  if (!p?.phone?.trim() || p.phone.trim().length < 5) return false;
  if (!p.currentCity?.trim()) return false;
  if (!p.dreamCity?.trim()) return false;

  const currentCountry = normalizeJourneyCountryLabel(
    p.currentCountry ?? p.country,
  );
  const dreamCountry = normalizeJourneyCountryLabel(p.dreamCountry);
  if (!currentCountry || !dreamCountry) return false;

  return true;
}
