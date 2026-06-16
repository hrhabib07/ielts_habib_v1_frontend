import { Suspense } from "react";
import { SyncAuthCookie } from "@/src/components/auth/SyncAuthCookie";
import { DocumentScrollGuard } from "@/src/components/shared/DocumentScrollGuard";

/**
 * Suspense fallback while AppShellWithAuth resolves.
 * No Header/Footer and no page children — prevents duplicate shells in the DOM during auth streaming.
 */
export function AppShellFallback() {
  return (
    <>
      <SyncAuthCookie initialUser={null} />
      <Suspense fallback={null}>
        <DocumentScrollGuard />
      </Suspense>
      <div className="flex min-h-dvh flex-col overflow-x-hidden">
        <div
          className="h-14 shrink-0 border-b border-border/50 bg-background/95 sm:h-16"
          aria-hidden
        />
        <main className="site-scroll-document w-full min-w-0 flex-1" aria-busy="true" />
      </div>
    </>
  );
}
