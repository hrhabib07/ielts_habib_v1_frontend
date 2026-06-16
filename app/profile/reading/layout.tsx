import { redirect } from "next/navigation";
import { getCurrentUser, getBearerTokenFromCookie } from "@/src/lib/auth-server";
import { fetchStudentProfileServer } from "@/src/lib/api/server-profile";
import { isStudentLearningReady, needsProfileMigration } from "@/src/lib/student-learning-gate";
import ReadingLayoutClient from "./ReadingLayoutClient";

export default async function ReadingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user?.role === "STUDENT") {
    const token = await getBearerTokenFromCookie();
    if (!token) {
      redirect("/login");
    }
    const result = await fetchStudentProfileServer(token);
    if (result.status === "ok") {
      if (!result.profile) {
        redirect("/onboarding");
      }
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
    }
  }

  return <ReadingLayoutClient>{children}</ReadingLayoutClient>;
}
