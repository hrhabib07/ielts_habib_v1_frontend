"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { cn } from "@/lib/utils";

type AccentMode = "easy" | "reading" | "game";

/** Bold hero headline with gradient accent on the payoff word. */
export function GuestHeroHeadline({
  className,
  accentMode = "reading",
}: {
  className?: string;
  accentMode?: AccentMode;
}) {
  const reduceMotion = useReducedMotion();
  const { copy } = useGuestLandingLocale();

  const line1 = copy.heroHeadlineLine1;
  const line2 = copy.heroHeadlineLine2;

  const accentOnLine2 = accentMode === "easy" || accentMode === "game";

  return (
    <motion.h1
      className={cn(
        "overflow-visible text-balance text-[clamp(2rem,6.5vw,3.75rem)] font-semibold tracking-[-0.035em]",
        className,
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.04, ease: GUEST_EASE }}
    >
      <span className="block leading-[1.08] text-foreground">{line1}</span>
      {line2 ? (
        <span className="mt-1 block overflow-visible leading-[1.05] sm:mt-1.5">
          <span
            className={cn(
              accentOnLine2
                ? "guest-hero-accent-word guest-hero-accent-gradient inline-block bg-gradient-to-r from-primary via-accent to-accent bg-clip-text pb-[0.08em] text-transparent"
                : "text-foreground",
            )}
          >
            {line2}
          </span>
        </span>
      ) : null}
    </motion.h1>
  );
}
