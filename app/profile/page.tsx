import { redirect } from "next/navigation";

/** Authenticated profile root: redirect to reading summary. */
export default function ProfilePage() {
  redirect("/profile/reading");
}
