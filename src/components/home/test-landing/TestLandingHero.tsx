"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TestLandingCtas } from "@/src/components/home/test-landing/TestLandingCtas";
import { TestLandingHeroCompareVisual } from "@/src/components/home/test-landing/TestLandingHeroCompareVisual";
import { PaidLearnersProofChip } from "@/src/components/pricing/PaidLearnersProofChip";
import { useTestLandingCopy } from "@/src/components/home/test-landing/useTestLandingCopy";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
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
  const reduceMotion = useReducedMotion();
  const { copy } = useTestLandingCopy();

  return (
    <section className="relative isolate overflow-hidden px-4 pb-10 pt-3 sm:px-6 sm:pb-16 sm:pt-10">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(56,189,248,0.12),transparent_55%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.35)_100%)]"
        aria-hidden
      />

      <div className="mx-auto grid max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <motion.p
            className={LANDING_EYEBROW_CLASS}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: GUEST_EASE }}
          >
            {copy.eyebrow}
          </motion.p>

          <motion.h1
            className={cn(
              "mx-auto mt-4 max-w-xl text-balance text-[clamp(2.05rem,6.4vw,3.35rem)] font-bold tracking-[-0.03em] text-foreground lg:mx-0",
            )}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.04, ease: GUEST_EASE }}
          >
            <span className="block leading-[1.18]">
              {renderWithAccents(copy.headlineLine1, copy.accentWords)}
            </span>
            <span className="mt-1.5 block leading-[1.2]">
              {renderWithAccents(copy.headlineLine2, copy.accentWords)}
            </span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-5 max-w-xl text-pretty text-lg font-medium leading-relaxed text-foreground/90 sm:text-xl lg:mx-0"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06, ease: GUEST_EASE }}
          >
            {copy.subheadline}
          </motion.p>

          <motion.ul
            className="mt-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: GUEST_EASE }}
          >
            {copy.heroStats.map((stat) => (
              <li
                key={stat.label}
                className="inline-flex items-baseline gap-1.5 rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1"
              >
                <span className="num text-base font-black tabular-nums text-sky-700 dark:text-sky-300">
                  {stat.value}
                </span>
                <span className="text-xs font-bold uppercase tracking-wide text-foreground/70">
                  {stat.label}
                </span>
              </li>
            ))}
          </motion.ul>

          <motion.div
            className="mt-5 flex justify-center lg:justify-start"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: GUEST_EASE }}
          >
            <PaidLearnersProofChip />
          </motion.div>

          <motion.div
            className="mx-auto mt-6 w-full max-w-md lg:mx-0"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.14, ease: GUEST_EASE }}
          >
            <TestLandingCtas copy={copy} align="start" />
          </motion.div>
        </div>

        <motion.div
          className="order-1 mx-auto w-full max-w-md lg:order-2 lg:max-w-none"
          initial={reduceMotion ? false : { y: 10, scale: 0.985 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.08, ease: GUEST_EASE }}
        >
          <TestLandingHeroCompareVisual mediaClassName="aspect-square" />
        </motion.div>
      </div>
    </section>
  );
}
