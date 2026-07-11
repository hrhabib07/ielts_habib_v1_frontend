"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GuestHeroHeadline } from "@/src/components/home/guest/GuestHeroHeadline";
import { GuestHeroWorld } from "@/src/components/home/guest/GuestHeroWorld";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";

export function GuestLandingHero() {
  const reduceMotion = useReducedMotion();
  const { copy } = useGuestLandingLocale();

  const scrollToVideo = () => {
    document
      .getElementById("how-gamlish-works")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative isolate overflow-hidden pb-6 pt-4 sm:pb-8 sm:pt-6">
      {/* Full-bleed hero atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,color-mix(in_srgb,var(--steel)_22%,transparent),transparent_55%),linear-gradient(180deg,color-mix(in_srgb,var(--muted)_55%,transparent)_0%,transparent_42%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
        <motion.div
          className="guest-brand-lockup"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: GUEST_EASE }}
        >
          <p className="guest-brand-display text-[clamp(2.75rem,9vw,4.75rem)] font-extrabold leading-[0.95] tracking-[-0.045em] text-foreground">
            {copy.brandTaglineName}
          </p>
          <p className="mt-2 text-sm italic tracking-wide text-muted-foreground sm:text-base">
            {copy.brandTaglineSuffix}
          </p>
        </motion.div>

        <GuestHeroHeadline
          className="mx-auto mt-5 max-w-2xl sm:mt-6"
          accentMode="game"
        />

        <motion.p
          className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground sm:mt-4 sm:text-lg"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: GUEST_EASE }}
        >
          {copy.heroSubheadline}
        </motion.p>

        <motion.div
          className="mt-6 flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:items-center"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: GUEST_EASE }}
        >
          <Button
            size="lg"
            className="guest-cta-glow h-12 rounded-full bg-accent px-9 text-base font-semibold text-accent-foreground"
            asChild
          >
            <Link href="/register">{copy.ctaPrimary}</Link>
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="h-12 rounded-full border-border/70 bg-background/70 px-8 text-base font-medium backdrop-blur-sm"
            onClick={scrollToVideo}
          >
            {copy.ctaSecondary}
          </Button>
        </motion.div>
      </div>

      {/* Dominant edge-to-edge world visual */}
      <div className="relative mt-8 w-full sm:mt-10">
        <div className="px-3 sm:px-6">
          <GuestHeroWorld className="rounded-[1.75rem] shadow-[0_40px_100px_-48px_rgba(15,23,42,0.55)] ring-1 ring-white/10 sm:rounded-[2rem]" />
        </div>
      </div>
    </section>
  );
}
