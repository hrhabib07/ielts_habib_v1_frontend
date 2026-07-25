"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { LANDING_ACCENT_WORD_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import { cn } from "@/lib/utils";

function renderWithAccents(
  line: string,
  accents: readonly string[],
  accentNode: (word: string, index: number) => ReactNode,
  accentIndexOffset = 0,
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

  const before = line.slice(0, bestIndex);
  const after = line.slice(bestIndex + bestAccent.length);
  const thisIndex = accentIndexOffset;

  return (
    <>
      {before}
      {accentNode(bestAccent, thisIndex)}
      {renderWithAccents(after, accents, accentNode, thisIndex + 1)}
    </>
  );
}

/** Two-line hero headline; accent words (game + English) use static brand blue. */
export function GuestHeroHeadline({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const { copy } = useGuestLandingLocale();

  const line1 = copy.heroHeadlineLine1;
  const line2 = copy.heroHeadlineLine2;
  const accents = copy.heroAccentWords;

  const accentWord = (word: string) => (
    <span className={LANDING_ACCENT_WORD_CLASS}>{word}</span>
  );

  return (
    <motion.h1
      className={cn(
        "overflow-visible text-balance text-[clamp(2rem,6.8vw,3.15rem)] font-bold tracking-[-0.03em] text-foreground",
        className,
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.04, ease: GUEST_EASE }}
    >
      <motion.span
        className="block leading-[1.12]"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.06, ease: GUEST_EASE }}
      >
        {renderWithAccents(line1, accents, accentWord)}
      </motion.span>
      {line2 ? (
        <motion.span
          className="mt-1.5 block leading-[1.15]"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.14, ease: GUEST_EASE }}
        >
          {renderWithAccents(line2, accents, accentWord)}
        </motion.span>
      ) : null}
    </motion.h1>
  );
}
