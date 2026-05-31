"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { setReadingTargetBand } from "@/src/lib/api/readingStrictProgression";
import { useScholarship } from "@/src/contexts/ScholarshipContext";

export interface ScholarshipRealityCheckModalProps {
  open: boolean;
  targetBand: number;
  baselineBand: number;
  scholarshipPercent: number;
  onAccept: () => void;
  onRestart: () => void;
  onClose: () => void;
}

export function ScholarshipRealityCheckModal({
  open,
  targetBand,
  baselineBand,
  scholarshipPercent,
  onAccept,
  onRestart,
  onClose,
}: ScholarshipRealityCheckModalProps) {
  const { refresh } = useScholarship();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      await setReadingTargetBand(baselineBand);
      await refresh();
      onAccept();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scholarship-reality-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-indigo-500/30 bg-white/90 p-6 shadow-2xl shadow-indigo-950/20 backdrop-blur-md dark:bg-slate-900/90">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"
          aria-hidden
        />
        <h2
          id="scholarship-reality-title"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          Level 1 Complete. Let&apos;s look at the data.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          You aimed for Band{" "}
          <span className="font-semibold text-foreground">{targetBand}</span>, but your current
          accuracy shows a baseline of Band{" "}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{baselineBand}</span>
          .
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <Button
            type="button"
            className="h-11 bg-indigo-600 font-semibold shadow-lg shadow-indigo-600/25 hover:bg-indigo-700"
            disabled={submitting}
            onClick={() => void handleAccept()}
          >
            Adjust target to Band {baselineBand} and Claim {scholarshipPercent}% Scholarship
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 border-slate-300 bg-transparent font-medium dark:border-slate-600"
            disabled={submitting}
            onClick={onRestart}
          >
            Keep target at Band {targetBand} and restart test
          </Button>
        </div>
      </div>
    </div>
  );
}
