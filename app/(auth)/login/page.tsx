import { redirect } from "next/navigation";
import { getBearerTokenFromCookie, getCurrentUser } from "@/src/lib/auth-server";
import {
  getRedirectPathForRole,
  getStudentHomeHref,
  sanitizeAuthReturnPath,
} from "@/src/lib/auth-redirects";
import { fetchStudentProfileServer } from "@/src/lib/api/server-profile";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    reset?: string;
    redirect?: string;
    next?: string;
    returnTo?: string;
  }>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (user) {
    const returnPath =
      sanitizeAuthReturnPath(sp.redirect) ??
      sanitizeAuthReturnPath(sp.next) ??
      sanitizeAuthReturnPath(sp.returnTo);

    if (user.role === "STUDENT") {
      const token = await getBearerTokenFromCookie();
      if (token) {
        const result = await fetchStudentProfileServer(token);
        if (result.status === "ok" && result.profile?.needsUsername === true) {
          redirect(getStudentHomeHref(true));
        }
      }
      if (returnPath) redirect(returnPath);
      redirect(getStudentHomeHref(false));
    }

    redirect(getRedirectPathForRole(user.role));
  }
  return <LoginForm resetSuccess={sp.reset === "1"} />;
}
