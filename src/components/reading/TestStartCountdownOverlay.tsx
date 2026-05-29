"use client";

import { useEffect, useRef, useState } from "react";

export type TestStartCountdownVariant = "indigo" | "navy";

const VARIANT_RING: Record<TestStartCountdownVariant, string> = {
  indigo: "from-indigo-500/30 via-indigo-400/20 to-transparent",
  navy: "from-[#1e3a8a]/35 via-[#3b82f6]/20 to-transparent dark:from-[#3b82f6]/30",
};

const VARIANT_GO: Record<TestStartCountdownVariant, string> = {
  indigo: "text-emerald-400 drop-shadow-[0_0_40px_rgba(52,211,153,0.45)]",
  navy: "text-emerald-400 drop-shadow-[0_0_36px_rgba(52,211,153,0.4)]",
};

/**
 * Full-screen 3 → 2 → 1 → GO sequence (~3.6s) before starting a timed test.
 * Parent controls visibility with `open`; `onComplete` runs once after GO.
 */
export function TestStartCountdownOverlay({
  open,
  onComplete,
  subtitle = "Get ready",
  variant = "indigo",
  fast = false,
}: {
  open: boolean;
  onComplete: () => void;
  subtitle?: string;
  variant?: TestStartCountdownVariant;
  /** Shorter 3-2-1-GO when content is already prefetched. */
  fast?: boolean;
}) {
  const [display, setDisplay] = useState<number | "GO" | null>(null);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    if (!open) {
      setDisplay(null);
      return;
    }

    setDisplay(3);
    const stepMs = fast ? 650 : 1000;
    const goMs = fast ? 1950 : 3000;
    const doneMs = fast ? 2400 : 3600;
    const t2 = window.setTimeout(() => setDisplay(2), stepMs);
    const t1 = window.setTimeout(() => setDisplay(1), stepMs * 2);
    const tGo = window.setTimeout(() => setDisplay("GO"), goMs);
    const tDone = window.setTimeout(() => {
      setDisplay(null);
      completeRef.current();
    }, doneMs);

    return () => {
      window.clearTimeout(t2);
      window.clearTimeout(t1);
      window.clearTimeout(tGo);
      window.clearTimeout(tDone);
    };
  }, [open, fast]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open && display === null) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950/88 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${VARIANT_RING[variant]}`}
        aria-hidden
      />
      <p className="relative mb-10 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
        {subtitle}
      </p>
      <div className="relative flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
        <div
          className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
          aria-hidden
        />
        {display !== null && display !== "GO" && (
          <span
            key={display}
            className="relative text-7xl font-bold tabular-nums text-white motion-safe:animate-[readingCount_0.35s_ease-out_both] sm:text-8xl"
          >
            {display}
          </span>
        )}
        {display === "GO" && (
          <span
            key="go"
            className={`relative text-5xl font-extrabold uppercase tracking-[0.2em] motion-safe:animate-[readingCount_0.35s_ease-out_both] sm:text-6xl ${VARIANT_GO[variant]}`}
          >
            Go
          </span>
        )}
      </div>
      <p className="relative mt-12 max-w-xs text-center text-sm text-slate-500">
        Focus. Your attempt starts when the timer ends.
      </p>
    </div>
  );
}
