"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { LANDING_CTA_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import { useGuestHomeSectionsCopy } from "@/src/components/home/guest/useGuestHomeSectionsCopy";
import { cn } from "@/lib/utils";

/**
 * Post-hero conversion block: what you get + why join now + Start now CTA.
 */
export function GuestJoinOfferSection() {
  const copy = useGuestHomeSectionsCopy().joinOffer;
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative border-b border-border/40 py-14 sm:py-16 md:py-20"
      aria-labelledby="guest-join-offer-title"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <motion.div
          className="text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: GUEST_EASE }}
        >
          <p
            className={cn(
              "inline-flex rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1",
              "text-xs font-bold uppercase tracking-[0.14em] text-sky-800 dark:text-sky-200",
            )}
          >
            {copy.eyebrow}
          </p>
          <h2
            id="guest-join-offer-title"
            className="mt-4 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
          >
            {copy.title}
          </h2>
          <p className="mt-3 text-pretty text-base text-muted-foreground sm:text-lg">
            {copy.sub}
          </p>
        </motion.div>

        <ol className="mt-10 space-y-3">
          {copy.weekOutcomes.map((outcome, i) => (
            <motion.li
              key={outcome.label}
              className="flex gap-3 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.45,
                delay: reduceMotion ? 0 : i * 0.05,
                ease: GUEST_EASE,
              }}
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-xs font-black tabular-nums text-sky-800 dark:text-sky-200">
                {i + 1}
              </span>
              <div className="min-w-0 text-left">
                <p className="text-sm font-bold text-foreground sm:text-base">
                  {outcome.label}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                  {outcome.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>

        <motion.p
          className="mt-6 text-center text-sm font-semibold text-sky-900 dark:text-sky-200 sm:text-base"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, delay: 0.1, ease: GUEST_EASE }}
        >
          {copy.missionLoop}
        </motion.p>

        <motion.div
          className="mt-8 text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.12, ease: GUEST_EASE }}
        >
          <p className="text-base font-bold text-foreground sm:text-lg">
            {copy.whyNow}
          </p>

          <div className="mt-5 flex w-full flex-col items-center gap-3">
            <Button
              size="lg"
              className={cn(
                "h-auto min-h-14 w-full max-w-md whitespace-normal rounded-2xl px-5 py-3.5 text-base font-black leading-snug",
                LANDING_CTA_CLASS,
              )}
              asChild
            >
              <Link href="/register">{copy.ctaPrimary}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full max-w-md rounded-2xl border-2 text-base font-bold"
              asChild
            >
              <Link href="/demo">{copy.ctaSecondary}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
