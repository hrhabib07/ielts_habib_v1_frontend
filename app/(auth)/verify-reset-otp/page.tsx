import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth-server";
import { getRedirectPathForRole } from "@/src/lib/auth-redirects";
import { VerifyResetOtpForm } from "./VerifyResetOtpForm";

export const dynamic = "force-dynamic";

export default async function VerifyResetOtpPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(getRedirectPathForRole(user.role));
  }
  return <VerifyResetOtpForm />;
}
