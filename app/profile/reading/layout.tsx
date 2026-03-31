import { redirect } from "next/navigation";
import { getCurrentUser, getBearerTokenFromCookie } from "@/src/lib/auth-server";
import { fetchStudentProfileServer } from "@/src/lib/api/server-profile";
import { isStudentLearningReady } from "@/src/lib/student-learning-gate";
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
    if (
      result.status === "ok" &&
      !isStudentLearningReady(result.profile)
    ) {
      redirect("/onboarding");
    }
  }

  return <ReadingLayoutClient>{children}</ReadingLayoutClient>;
}
