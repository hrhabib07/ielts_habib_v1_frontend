"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { journeyToWaterFillPercent } from "@/src/lib/journeyVisualProgress";

export { journeyToVisualWaterPercent } from "@/src/lib/journeyVisualProgress";

function formatBandLabel(band: number): string {
  return Number.isInteger(band) ? String(band) : band.toFixed(1);
}

interface BandScoreWaterDisplayProps {
  band: number;
  overallProgressPct: number;
  /** Override aria-label context, e.g. for public profiles */
  ariaLabelPrefix?: string;
  className?: string;
}

export function BandScoreWaterDisplay({
  band,
  overallProgressPct,
  ariaLabelPrefix = "Target band score",
  className,
}: BandScoreWaterDisplayProps) {
  const bandLabel = formatBandLabel(band);
  const targetFillPct = journeyToWaterFillPercent(overallProgressPct);
  const [fillPct, setFillPct] = useState(0);
  const fillRef = useRef(0);

  useEffect(() => {
    const target = targetFillPct;
    const from = fillRef.current;
    if (from === target) return;

    let raf = 0;
    const duration = 2200;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - (1 - t) * (1 - t);
      const pct = Math.round(from + eased * (target - from));
      fillRef.current = pct;
      setFillPct(pct);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targetFillPct]);

  return (
    <div
      className={cn(
        "band-score-container relative flex items-center justify-center leading-none",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-full bg-accent/5 blur-2xl"
        aria-hidden
      />
      <span
        className="band-score-fill font-bold tabular-nums select-none text-[clamp(4.5rem,16vw,7.5rem)] leading-none tracking-tight"
        style={{ "--fill-pct": `${fillPct}%` } as React.CSSProperties}
        aria-hidden
      >
        {bandLabel}
      </span>
      <span
        className="band-score-outline font-bold tabular-nums select-none text-[clamp(4.5rem,16vw,7.5rem)] leading-none tracking-tight"
        aria-label={`${ariaLabelPrefix} ${bandLabel}, ${overallProgressPct}% complete`}
      >
        {bandLabel}
      </span>
    </div>
  );
}

export { formatBandLabel };
