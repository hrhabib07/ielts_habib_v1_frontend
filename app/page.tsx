import { redirect } from "next/navigation";
import { HomeHero } from "@/src/components/home/HomeHero";
import {
  getCurrentUser,
  getBearerTokenFromCookie,
} from "@/src/lib/auth-server";
import { getRedirectPathForRole, getStudentHomeHref } from "@/src/lib/auth-redirects";
import { fetchStudentProfileServer } from "@/src/lib/api/server-profile";
import { isStudentLearningReady, needsProfileMigration } from "@/src/lib/student-learning-gate";
import { ENABLE_READING, PRIMARY_STUDENT_HREF } from "@/src/lib/platform-config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialUser = await getCurrentUser();

  // Logged-in students go straight to the mission roadmap (Duolingo-style home).
  if (initialUser?.role === "STUDENT") {
    // English-first mode: skip /students/me on `/` — /player already gates
    // username claim and learning readiness on the client.
    if (!ENABLE_READING) {
      redirect(PRIMARY_STUDENT_HREF);
    }

    const token = await getBearerTokenFromCookie();
    if (token) {
      const result = await fetchStudentProfileServer(token);
      if (result.status === "ok" && result.profile) {
        if (
          needsProfileMigration(result.profile) ||
          !isStudentLearningReady(result.profile)
        ) {
          redirect(
            needsProfileMigration(result.profile)
              ? "/onboarding?migrate=1"
              : "/onboarding",
          );
        }
        redirect(getStudentHomeHref(result.profile.needsUsername === true));
      } else if (result.status === "ok" && !result.profile) {
        redirect("/onboarding");
      }
    }
    redirect(getStudentHomeHref(false));
  }

  const roleCtaHref = initialUser ? getRedirectPathForRole(initialUser.role) : null;
  const roleCtaLabel =
    initialUser?.role === "ADMIN"
      ? "Go to Admin Panel"
      : initialUser?.role === "INSTRUCTOR"
        ? "Go to Dashboard"
        : null;

  return (
    <HomeHero
      initialUser={initialUser}
      roleCtaHref={roleCtaHref}
      roleCtaLabel={roleCtaLabel}
    />
  );
}
