import { Suspense } from "react";
import { GoogleOAuthCallbackClient } from "@/src/components/auth/GoogleOAuthCallbackClient";

export const dynamic = "force-dynamic";

export default function GoogleOAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background px-4">
          <p className="text-sm text-muted-foreground">Finishing Google sign-in…</p>
        </div>
      }
    >
      <GoogleOAuthCallbackClient />
    </Suspense>
  );
}
