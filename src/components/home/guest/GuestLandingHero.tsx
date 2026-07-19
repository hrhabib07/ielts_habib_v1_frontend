"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GuestHeroHeadline } from "@/src/components/home/guest/GuestHeroHeadline";
import { GuestHeroMissionVisual } from "@/src/components/home/guest/GuestHeroMissionVisual";
import { GuestDemoCounter } from "@/src/components/home/guest/GuestDemoCounter";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import {
  LANDING_CTA_CLASS,
  LANDING_EYEBROW_CLASS,
} from "@/src/components/home/guest/guest-landing-theme";
import { cn } from "@/lib/utils";

export function GuestLandingHero() {
  const reduceMotion = useReducedMotion();
  const { copy } = useGuestLandingLocale();

  return (
    <section className="relative isolate overflow-hidden px-4 pb-10 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(56,189,248,0.12),transparent_55%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.35)_100%)]"
        aria-hidden
      />

      <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div className="text-center lg:text-left">
          <motion.p
            className={LANDING_EYEBROW_CLASS}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: GUEST_EASE }}
          >
            {copy.heroEyebrow}
          </motion.p>

          <GuestHeroHeadline className="mx-auto mt-4 max-w-xl lg:mx-0" />

          <motion.p
            className="mx-auto mt-3 max-w-md text-pretty text-base leading-relaxed text-muted-foreground lg:mx-0"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06, ease: GUEST_EASE }}
          >
            {copy.heroSubheadline}
          </motion.p>

          <motion.div
            className="mt-6 flex flex-col items-center gap-2 lg:items-start"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: GUEST_EASE }}
          >
            <Button
              size="lg"
              className={cn(
                "h-14 w-full max-w-sm rounded-2xl text-base font-bold lg:w-auto lg:min-w-[15rem]",
                LANDING_CTA_CLASS,
              )}
              asChild
            >
              <Link href="/demo">{copy.ctaPrimary}</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              {copy.ctaPrimarySub}
              <span className="mx-1.5 text-border">·</span>
              <GuestDemoCounter className="inline text-sm text-muted-foreground" />
            </p>
          </motion.div>
        </div>

        <GuestHeroMissionVisual />
      </div>
    </section>
  );
}
