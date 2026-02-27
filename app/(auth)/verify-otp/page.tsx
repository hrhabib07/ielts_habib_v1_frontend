import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth-server";
import { getRedirectPathForRole } from "@/src/lib/auth-redirects";
import { VerifyOtpForm } from "./VerifyOtpForm";

export const dynamic = "force-dynamic";

interface VerifyOtpPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function VerifyOtpPage({
  searchParams,
}: VerifyOtpPageProps) {
  // Redirect authenticated users
  const user = await getCurrentUser();
  if (user) {
    redirect(getRedirectPathForRole(user.role));
  }

  const params = await searchParams;
  const emailParam = params.email;
  const email = emailParam ? decodeURIComponent(emailParam) : "";

  return <VerifyOtpForm email={email} />;
}
