"use client";

import type { ReactNode } from "react";
import { TestLandingCtas } from "@/src/components/home/test-landing/TestLandingCtas";
import { TestLandingHeroCompareVisual } from "@/src/components/home/test-landing/TestLandingHeroCompareVisual";
import { PaidLearnersProofChip } from "@/src/components/pricing/PaidLearnersProofChip";
import { useTestLandingCopy } from "@/src/components/home/test-landing/useTestLandingCopy";
import {
  LANDING_ACCENT_WORD_CLASS,
  LANDING_EYEBROW_CLASS,
} from "@/src/components/home/guest/guest-landing-theme";
import { cn } from "@/lib/utils";

function renderWithAccents(
  line: string,
  accents: readonly string[],
): ReactNode {
  if (!accents.length) return line;

  let bestIndex = -1;
  let bestAccent = "";
  for (const accent of accents) {
    if (!accent) continue;
    const i = line.indexOf(accent);
    if (i !== -1 && (bestIndex === -1 || i < bestIndex)) {
      bestIndex = i;
      bestAccent = accent;
    }
  }

  if (bestIndex === -1 || !bestAccent) return line;

  return (
    <>
      {line.slice(0, bestIndex)}
      <span className={LANDING_ACCENT_WORD_CLASS}>{bestAccent}</span>
      {renderWithAccents(line.slice(bestIndex + bestAccent.length), accents)}
    </>
  );
}

export function TestLandingHero() {
  const { copy } = useTestLandingCopy();

  return (
    <section className="relative isolate overflow-hidden px-4 pb-10 pt-3 sm:px-6 sm:pb-16 sm:pt-10">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(56,189,248,0.12),transparent_55%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.35)_100%)]"
        aria-hidden
      />

      <div className="mx-auto grid max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <p className={cn(LANDING_EYEBROW_CLASS, "landing-rise landing-rise-1")}>
            {copy.eyebrow}
          </p>

          <h1
            className={cn(
              "landing-rise landing-rise-2 mx-auto mt-4 max-w-xl text-balance text-[clamp(2.05rem,6.4vw,3.35rem)] font-bold tracking-[-0.03em] text-foreground lg:mx-0",
            )}
          >
            <span className="block leading-[1.18]">
              {renderWithAccents(copy.headlineLine1, copy.accentWords)}
            </span>
            <span className="mt-1.5 block leading-[1.2]">
              {renderWithAccents(copy.headlineLine2, copy.accentWords)}
            </span>
          </h1>

          <p className="landing-rise landing-rise-3 mx-auto mt-4 max-w-xl text-pretty text-lg font-medium leading-relaxed text-foreground/90 sm:text-xl lg:mx-0">
            {copy.subheadline}
          </p>

          <div className="landing-rise landing-rise-4 mx-auto mt-7 flex w-full max-w-md flex-col items-center gap-3 lg:mx-0 lg:items-start">
            <PaidLearnersProofChip />
            <TestLandingCtas copy={copy} align="start" />
          </div>
        </div>

        <div className="landing-rise-visual order-1 mx-auto w-full max-w-md lg:order-2 lg:max-w-none">
          <TestLandingHeroCompareVisual mediaClassName="aspect-square" />
        </div>
      </div>
    </section>
  );
}
