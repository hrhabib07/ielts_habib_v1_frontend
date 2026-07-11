import { Suspense } from "react";
import { DocumentScrollGuard } from "@/src/components/shared/DocumentScrollGuard";

/**
 * Suspense fallback while AppShellWithAuth resolves.
 * Do not mount SyncAuthCookie here — initialUser=null would force a redundant
 * sync + router.refresh and cause login flicker after tab return.
 */
export function AppShellFallback() {
  return (
    <>
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
