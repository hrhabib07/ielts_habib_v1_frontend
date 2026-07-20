import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth-server";
import {
  getRedirectPathForRole,
  sanitizeAuthReturnPath,
} from "@/src/lib/auth-redirects";
import { RegisterForm } from "./RegisterForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{
    redirect?: string;
    next?: string;
    returnTo?: string;
    sid?: string;
  }>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (user) {
    const returnPath =
      sanitizeAuthReturnPath(sp.redirect) ??
      sanitizeAuthReturnPath(sp.next) ??
      sanitizeAuthReturnPath(sp.returnTo);
    if (user.role === "STUDENT" && returnPath) {
      redirect(returnPath);
    }
    redirect(getRedirectPathForRole(user.role));
  }
  return <RegisterForm />;
}
