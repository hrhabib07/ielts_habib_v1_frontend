import { redirect } from "next/navigation";

/** Legacy Quiz Content — use Integrated Lessons micro-quizzes in Level Builder. */
export default function LegacyQuizContentPage() {
  redirect("/dashboard/instructor/reading-levels");
}
