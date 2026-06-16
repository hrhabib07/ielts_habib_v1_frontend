import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { fetchStudentProfileServer } from "@/src/lib/api/server-profile";
import { needsProfileMigration } from "@/src/lib/student-learning-gate";

const TOKEN_COOKIE = "ielts_habib_token";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  if (token) {
    const result = await fetchStudentProfileServer(token);
    if (
      result.status === "ok" &&
      result.profile &&
      needsProfileMigration(result.profile)
    ) {
      redirect("/onboarding?migrate=1");
    }
  }

  return children;
}
