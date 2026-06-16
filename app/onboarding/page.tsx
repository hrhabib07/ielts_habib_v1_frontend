"use client";

import { Suspense } from "react";
import OnboardingPageContent from "./OnboardingPageContent";

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100dvh-8rem)] items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <OnboardingPageContent />
    </Suspense>
  );
}
