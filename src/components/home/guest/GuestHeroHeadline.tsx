"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { cn } from "@/lib/utils";

/** Gradient headline with descender-safe accent word (fixes clipped g from bg-clip-text). */
export function GuestHeroHeadline({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const { copy, locale } = useGuestLandingLocale();

  const line2 = copy.heroHeadlineLine2;
  const enParts =
    locale === "en" && line2.toLowerCase().endsWith("game")
      ? { prefix: line2.slice(0, -4), accent: line2.slice(-4) }
      : null;

  return (
    <motion.h1
      className={cn(
        "mt-4 overflow-visible text-balance text-[clamp(1.65rem,5.2vw,3.35rem)] font-semibold tracking-[-0.03em] sm:mt-5",
        className,
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.04, ease: GUEST_EASE }}
    >
      <span className="block leading-[1.1] text-foreground">{copy.heroHeadlineLine1}</span>
      <span className="mt-1 block overflow-visible leading-[1.15] sm:mt-1.5">
        {enParts ? (
          <>
            <span className="text-foreground">{enParts.prefix}</span>
            <span className="guest-hero-accent-word relative inline-block align-baseline pb-[0.12em]">
              <span className="guest-hero-accent-gradient bg-gradient-to-r from-primary via-accent to-accent bg-clip-text text-transparent">
                {enParts.accent}
              </span>
            </span>
          </>
        ) : (
          <span className="guest-hero-accent-word inline-block pb-[0.1em]">
            <span className="guest-hero-accent-gradient bg-gradient-to-r from-foreground via-accent to-accent bg-clip-text text-transparent dark:from-slate-50 dark:via-primary dark:to-accent">
              {line2}
            </span>
          </span>
        )}
      </span>
    </motion.h1>
  );
}
