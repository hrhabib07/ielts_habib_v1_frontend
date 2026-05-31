import { redirect } from "next/navigation";
import { HomeHero } from "@/src/components/home/HomeHero";
import {
  getCurrentUser,
  getBearerTokenFromCookie,
} from "@/src/lib/auth-server";
import { getRedirectPathForRole } from "@/src/lib/auth-redirects";
import { fetchStudentProfileServer } from "@/src/lib/api/server-profile";
import { isStudentLearningReady } from "@/src/lib/student-learning-gate";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialUser = await getCurrentUser();
  if (initialUser?.role === "STUDENT") {
    const token = await getBearerTokenFromCookie();
    if (token) {
      const result = await fetchStudentProfileServer(token);
      if (
        result.status === "ok" &&
        !isStudentLearningReady(result.profile)
      ) {
        redirect("/onboarding");
      }
    }
  }
  /** Logged-in students land on home; hero CTA still points to Reading (not a duplicate “home” link). */
  const roleCtaHref = initialUser
    ? initialUser.role === "STUDENT"
      ? "/profile/reading"
      : getRedirectPathForRole(initialUser.role)
    : null;
  const roleCtaLabel =
    initialUser?.role === "STUDENT"
      ? "Continue to Reading"
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
