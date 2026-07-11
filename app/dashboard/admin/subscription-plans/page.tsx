import { redirect } from "next/navigation";

export default function SubscriptionPlansRedirectPage() {
  redirect("/dashboard/admin/pricing");
}
