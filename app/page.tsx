import { redirect } from "next/navigation";
import { HomeHero } from "@/src/components/home/HomeHero";
import {
  getCurrentUser,
  getBearerTokenFromCookie,
} from "@/src/lib/auth-server";
import { getRedirectPathForRole } from "@/src/lib/auth-redirects";
import { fetchStudentProfileServer } from "@/src/lib/api/server-profile";
import { isStudentLearningReady, needsProfileMigration } from "@/src/lib/student-learning-gate";
import { PRIMARY_STUDENT_HREF, PRIMARY_STUDENT_LABEL } from "@/src/lib/platform-config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialUser = await getCurrentUser();
  if (initialUser?.role === "STUDENT") {
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
      } else if (result.status === "ok" && !result.profile) {
        redirect("/onboarding");
      }
    }
  }
  /** Logged-in students land on home; hero CTA points to primary product. */
  const roleCtaHref = initialUser
    ? initialUser.role === "STUDENT"
      ? PRIMARY_STUDENT_HREF
      : getRedirectPathForRole(initialUser.role)
    : null;
  const roleCtaLabel =
    initialUser?.role === "STUDENT"
      ? `Continue to ${PRIMARY_STUDENT_LABEL}`
      : initialUser?.role === "ADMIN"
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
