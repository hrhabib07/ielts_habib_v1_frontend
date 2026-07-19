"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { LANDING_HIGHLIGHT_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import { cn } from "@/lib/utils";

/** One intentional brand-blue highlight word inside an otherwise solid headline. */
export function GuestHeroHeadline({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const { copy } = useGuestLandingLocale();

  const line1 = copy.heroHeadlineLine1;
  const line2 = copy.heroHeadlineLine2;
  const accent = copy.heroAccentWord;

  const renderLine2 = () => {
    if (!line2) return null;
    if (!accent || !line2.includes(accent)) {
      return <span className="text-foreground">{line2}</span>;
    }
    const [before, ...rest] = line2.split(accent);
    const after = rest.join(accent);
    return (
      <>
        {before}
        <span className={LANDING_HIGHLIGHT_CLASS}>{accent}</span>
        {after}
      </>
    );
  };

  return (
    <motion.h1
      className={cn(
        "overflow-visible text-balance text-[clamp(1.85rem,6.2vw,2.85rem)] font-bold tracking-[-0.03em] text-foreground",
        className,
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.04, ease: GUEST_EASE }}
    >
      <span className="block leading-[1.15]">{line1}</span>
      {line2 ? (
        <span className="mt-1.5 block leading-[1.2]">{renderLine2()}</span>
      ) : null}
    </motion.h1>
  );
}
