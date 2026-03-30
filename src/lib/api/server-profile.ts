import type { StudentProfile } from "@/src/lib/api/types";

/**
 * Server-only fetch for GET /api/students/me using a Bearer token (e.g. httpOnly cookie).
 */
export async function fetchStudentProfileServer(
  accessToken: string,
): Promise<StudentProfile | null> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) return null;

  const res = await fetch(`${base.replace(/\/$/, "")}/students/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) return null;

  const json = (await res.json()) as {
    success?: boolean;
    data?: StudentProfile;
  };
  return json.data ?? null;
}
