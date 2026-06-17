import { redirect } from "next/navigation";

/** Legacy Content Management. use Integrated Lessons in Level Builder. */
export default function LegacyContentsPage() {
  redirect("/dashboard/instructor/reading-levels");
}
