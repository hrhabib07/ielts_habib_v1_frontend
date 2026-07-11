"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GuestTryOneQuestion } from "@/src/components/home/guest/GuestTryOneQuestion";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";

/** Interactive play strip — second beat after the hero world. */
export function GuestPlayMoment() {
  const reduceMotion = useReducedMotion();
  const { copy } = useGuestLandingLocale();

  return (
    <section className="relative px-4 py-12 sm:px-6 sm:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
        <motion.div
          className="text-center lg:text-left"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: GUEST_EASE }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
            {copy.tryOne.eyebrow}
          </p>
          <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {copy.playMomentTitle}
          </h2>
          <p className="mt-3 max-w-md text-muted-foreground sm:text-lg lg:mx-0 mx-auto">
            {copy.playMomentSub}
          </p>

          {/* Decorative word tiles — product feel without being a card stack */}
          <div className="mt-6 hidden justify-start gap-2 lg:flex" aria-hidden>
            {["I", "eat", "rice"].map((w, i) => (
              <motion.span
                key={w}
                className="rounded-xl border border-border/60 bg-card px-4 py-2.5 text-sm font-bold text-foreground shadow-sm"
                initial={reduceMotion ? false : { y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.4, ease: GUEST_EASE }}
              >
                {w}
              </motion.span>
            ))}
            <motion.span
              className="flex items-center text-sm font-semibold text-accent"
              initial={reduceMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45 }}
            >
              → SVO
            </motion.span>
          </div>
        </motion.div>

        <div className="relative">
          <div
            className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-accent/8 blur-2xl dark:bg-accent/12"
            aria-hidden
          />
          <GuestTryOneQuestion className="relative" />
        </div>
      </div>
    </section>
  );
}
