import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth-server";
import { getRedirectPathForRole } from "@/src/lib/auth-redirects";

export const dynamic = "force-dynamic";

/**
 * Auth route group: /login, /register, /verify-otp.
 * If user is authenticated, redirect by role (server-side; no client flash).
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect(getRedirectPathForRole(user.role));
  }
  return <>{children}</>;
}
