import type { ScholarshipStatus } from "@/src/lib/api/scholarship";

/** Account-creation time is the sole anchor for the 24-hour Founder window. */
export function resolveScholarshipWindowStart(
  status: Pick<ScholarshipStatus, "createdAt" | "scholarshipStartTime"> | null | undefined,
): string | null {
  return status?.createdAt ?? status?.scholarshipStartTime ?? null;
}
