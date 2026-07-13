import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/src/lib/auth-server";
import { getRedirectPathForRole } from "@/src/lib/auth-redirects";
import { GamlishNavBrand } from "@/src/components/shared/GamlishNavBrand";

export const dynamic = "force-dynamic";

/**
 * Auth route group: /login, /register, /verify-otp, password reset.
 * Immersive chrome (no site nav), but always offer a clear path back home.
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

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Link
            href="/"
            className="flex min-w-0 items-center transition-opacity hover:opacity-90"
            aria-label="Gamlish home"
          >
            <GamlishNavBrand showTagline={false} />
          </Link>
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-accent/30 hover:bg-accent/5 hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Home
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
