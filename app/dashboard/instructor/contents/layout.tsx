import { redirect } from "next/navigation";

export default function LegacyContentsLayout() {
  redirect("/dashboard/instructor/reading-levels");
}
