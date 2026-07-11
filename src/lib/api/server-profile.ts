import type { StudentProfile } from "@/src/lib/api/types";
import { getApiBaseUrl } from "@/src/lib/api-base-url";

export type FetchStudentProfileServerResult =
  | { status: "ok"; profile: StudentProfile | null }
  | { status: "unavailable" };

/**
 * Server-only fetch for GET /api/students/me using a Bearer token (e.g. httpOnly cookie).
 * Network failures return `unavailable` so callers can avoid treating outages like missing profiles.
 */
export async function fetchStudentProfileServer(
  accessToken: string,
): Promise<FetchStudentProfileServerResult> {
  const base = getApiBaseUrl();

  try {
    const res = await fetch(`${base}/students/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (res.status === 401 || res.status === 403) {
      return { status: "ok", profile: null };
    }
    if (!res.ok) return { status: "unavailable" };

    const json = (await res.json()) as {
      success?: boolean;
      data?: StudentProfile;
    };
    return { status: "ok", profile: json.data ?? null };
  } catch {
    return { status: "unavailable" };
  }
}
