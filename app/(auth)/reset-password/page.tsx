import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth-server";
import { getRedirectPathForRole } from "@/src/lib/auth-redirects";
import { AuthSimpleChrome } from "@/src/components/auth/AuthSimpleChrome";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(getRedirectPathForRole(user.role));
  }
  return (
    <>
      <AuthSimpleChrome />
      <ResetPasswordForm />
    </>
  );
}
