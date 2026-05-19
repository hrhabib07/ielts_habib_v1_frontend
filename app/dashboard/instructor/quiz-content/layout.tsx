import { redirect } from "next/navigation";

export default function LegacyQuizContentLayout() {
  redirect("/dashboard/instructor/reading-levels");
}
