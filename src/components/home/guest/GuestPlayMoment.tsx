"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GuestTryOneQuestion } from "@/src/components/home/guest/GuestTryOneQuestion";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";

/** Interactive taste of the real game loop (same +1 XP answer pulse). */
export function GuestPlayMoment() {
  const reduceMotion = useReducedMotion();
  const { copy } = useGuestLandingLocale();

  return (
    <section className="relative px-4 py-12 sm:px-6 sm:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative mx-auto max-w-md">
        <motion.div
          className="mb-6 text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: GUEST_EASE }}
        >
          <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {copy.playMomentTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
            {copy.playMomentSub}
          </p>
        </motion.div>

        <GuestTryOneQuestion />
      </div>
    </section>
  );
}
