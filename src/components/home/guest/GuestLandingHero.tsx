"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GuestHeroHeadline } from "@/src/components/home/guest/GuestHeroHeadline";
import { ProfileSearchLeaderboard } from "@/src/components/home/ProfileSearchLeaderboard";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { Sparkles } from "lucide-react";

export function GuestLandingHero() {
  const reduceMotion = useReducedMotion();
  const { copy } = useGuestLandingLocale();

  const scrollToVideo = () => {
    document
      .getElementById("how-gamlish-works")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative px-4 pb-6 pt-6 sm:px-6 sm:pb-8 sm:pt-8">
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.p
          className="text-sm tracking-wide text-muted-foreground sm:text-base"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: GUEST_EASE }}
        >
          <span className="font-semibold text-foreground">{copy.brandTaglineName}</span>
          <span className="mx-1.5 text-muted-foreground/45">·</span>
          <span className="italic">{copy.brandTaglineSuffix}</span>
        </motion.p>

        <motion.div
          className="mt-4"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.04, ease: GUEST_EASE }}
        >
          <p className="guest-eyebrow-shimmer inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-sm">
            <Sparkles className="h-3 w-3 text-accent" aria-hidden />
            {copy.heroEyebrow}
          </p>
        </motion.div>

          <GuestHeroHeadline className="mx-auto mt-5 max-w-2xl sm:mt-6" accentMode="game" />

        <motion.p
          className="mx-auto mt-4 max-w-md text-pretty text-base text-muted-foreground sm:text-lg"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: GUEST_EASE }}
        >
          {copy.heroSubheadline}
        </motion.p>

        <motion.div
          className="mt-6 flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:items-center sm:justify-center"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: GUEST_EASE }}
        >
          <Button
            size="lg"
            className="guest-cta-glow h-12 rounded-full bg-accent px-8 text-base font-semibold text-accent-foreground"
            asChild
          >
            <Link href="/register">{copy.ctaPrimary}</Link>
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="h-12 rounded-full border-border/70 bg-background/60 px-8 text-base font-medium backdrop-blur-sm"
            onClick={scrollToVideo}
          >
            {copy.ctaSecondary}
          </Button>
        </motion.div>

        <motion.div
          className="relative z-10 mx-auto mt-10 max-w-2xl sm:mt-12"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16, ease: GUEST_EASE }}
        >
          <ProfileSearchLeaderboard compact />
        </motion.div>
      </div>
    </section>
  );
}
