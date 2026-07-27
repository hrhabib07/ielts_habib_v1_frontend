import { Suspense } from "react";
import { DocumentScrollGuard } from "@/src/components/shared/DocumentScrollGuard";

/**
 * Suspense fallback while AppShellWithAuth resolves.
 * Mirror the resolved shell tag structure so streaming/hydration stay aligned.
 */
export function AppShellFallback() {
  return (
    <>
      <Suspense fallback={null}>
        <DocumentScrollGuard />
      </Suspense>
      <div className="flex min-h-dvh flex-col overflow-x-hidden">
        <div className="sticky top-0 z-50 w-full shrink-0">
          <div
            className="h-14 border-b border-border/50 bg-background/95 sm:h-16"
            aria-hidden
          />
        </div>
        <div
          className="site-scroll-document w-full min-w-0 flex-1"
          role="main"
          aria-busy="true"
        />
        <div className="h-12 shrink-0" aria-hidden />
      </div>
    </>
  );
}
