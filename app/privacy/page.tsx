import { redirect } from "next/navigation";

/** Short alias: /privacy -> /privacy-policy */
export default function PrivacyAliasPage() {
  redirect("/privacy-policy");
}
