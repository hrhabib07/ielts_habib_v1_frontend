"use client";

import { useScholarship } from "@/src/contexts/ScholarshipContext";
import { useScholarshipTimer } from "@/src/hooks/useScholarshipTimer";

export function ScholarshipUrgencyBanner() {
  const { status } = useScholarship();
  const timer = useScholarshipTimer(status?.createdAt);

  if (!status?.inTrialPhase || status.currentTierPercent <= 0) {
    return null;
  }

  return (
    <div
      className="sticky top-0 z-[60] border-b border-slate-700/80 bg-slate-950/95 px-4 py-2.5 text-center text-sm text-slate-100 shadow-lg shadow-slate-950/40 backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      <p className="mx-auto max-w-4xl font-medium leading-snug">
        <span aria-hidden>⚡</span>{" "}
        <span className="text-slate-300">Fast Action Scholarship:</span> Complete Level 1 in{" "}
        <span className="font-mono font-semibold tabular-nums text-indigo-300">
          {timer.ready ? timer.formatted : "--:--:--"}
        </span>{" "}
        to unlock a{" "}
        <span className="font-semibold text-white">{status.currentTierPercent}%</span> discount on
        Premium.
      </p>
    </div>
  );
}

export function ScholarshipBannerSpacer() {
  const { status } = useScholarship();
  if (!status?.inTrialPhase || status.currentTierPercent <= 0) return null;
  return <div className="h-0" aria-hidden />;
}
