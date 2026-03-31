import { Suspense } from "react";
import type { Metadata } from "next";
import { TrialFeedbackPageClient } from "@/src/components/reading/TrialFeedbackPageClient";

export const metadata: Metadata = {
  title: "Trial feedback | Reading",
  description: "Share feedback after your free trial on GAMLISH Reading.",
};

function TrialFeedbackFallback() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-6 h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

export default function TrialFeedbackPage() {
  return (
    <Suspense fallback={<TrialFeedbackFallback />}>
      <TrialFeedbackPageClient />
    </Suspense>
  );
}
