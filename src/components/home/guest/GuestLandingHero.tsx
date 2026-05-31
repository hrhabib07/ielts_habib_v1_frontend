"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LandingPathMockup } from "@/src/components/home/guest/LandingPathMockup";
import { GuestHeroHeadline } from "@/src/components/home/guest/GuestHeroHeadline";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { Sparkles } from "lucide-react";

export function GuestLandingHero() {
  const reduceMotion = useReducedMotion();
  const { copy } = useGuestLandingLocale();

  const scrollToHowToPlay = () => {
    document.getElementById("how-to-play")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative px-4 pb-10 pt-5 sm:px-6 sm:pb-14 sm:pt-7 lg:pb-16 lg:pt-8">
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid items-center gap-4 sm:gap-5 md:grid-cols-2 md:gap-6 lg:gap-8 xl:gap-10">
          {/* Copy */}
          <div className="text-center md:text-left">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: GUEST_EASE }}
            >
              <p className="guest-eyebrow-shimmer inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-sm sm:text-[0.65rem]">
                <Sparkles className="h-3 w-3 text-accent" aria-hidden />
                <span>{copy.heroEyebrow}</span>
              </p>
            </motion.div>

            <GuestHeroHeadline className="md:text-left" />

            <motion.p
              className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-snug text-muted-foreground sm:mt-4 sm:text-base sm:leading-relaxed md:mx-0"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: GUEST_EASE }}
            >
              {copy.heroSubheadline}
            </motion.p>

            <motion.div
              className="mt-5 flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:items-center sm:justify-center md:mt-6 md:justify-start"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.14, ease: GUEST_EASE }}
            >
              <Button
                size="lg"
                className="guest-cta-glow h-11 rounded-full bg-accent px-8 text-sm font-semibold text-accent-foreground sm:h-12 sm:px-10 sm:text-base"
                asChild
              >
                <Link href="/register">{copy.ctaPrimary}</Link>
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="h-11 rounded-full border-border/70 bg-background/50 px-8 text-sm font-medium backdrop-blur-sm sm:h-12 sm:px-10 sm:text-base"
                onClick={scrollToHowToPlay}
              >
                {copy.ctaSecondary}
              </Button>
            </motion.div>
          </div>

          {/* Reading journey mockup */}
          <motion.div
            className="relative w-full min-w-0"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: GUEST_EASE }}
          >
            <div
              className="pointer-events-none absolute -inset-4 rounded-2xl bg-accent/8 blur-2xl lg:-inset-6"
              aria-hidden
            />
            <LandingPathMockup className="relative" compact />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
