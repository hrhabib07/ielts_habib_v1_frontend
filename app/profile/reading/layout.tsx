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
    const profile = await fetchStudentProfileServer(token);
    if (!isStudentLearningReady(profile)) {
      redirect("/onboarding");
    }
  }

  return <ReadingLayoutClient>{children}</ReadingLayoutClient>;
}
