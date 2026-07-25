"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { useGuestHomeSectionsCopy } from "@/src/components/home/guest/useGuestHomeSectionsCopy";
import { cn } from "@/lib/utils";

export function GuestProblemHook() {
  const copy = useGuestHomeSectionsCopy();
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative border-y border-border/40 bg-muted/35 py-14 dark:bg-muted/20 sm:py-16 md:py-20"
      aria-labelledby="guest-problem-title"
    >
      <div className="mx-auto max-w-[50rem] px-4 sm:px-6">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: GUEST_EASE }}
          className="text-center"
        >
          <p
            className={cn(
              "inline-flex rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1",
              "text-xs font-bold uppercase tracking-[0.14em] text-sky-800 dark:text-sky-200",
            )}
          >
            {copy.problemBadge}
          </p>
          <h2
            id="guest-problem-title"
            className="mt-4 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            {copy.problemTitle}
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {copy.problemP1}
          </p>
        </motion.div>

        <motion.aside
          className="mx-auto mt-8 max-w-xl rounded-2xl border border-orange-500/25 bg-orange-500/[0.07] p-5 text-center sm:p-6"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.08, ease: GUEST_EASE }}
        >
          <p className="text-sm text-muted-foreground">{copy.problemPrompt}</p>
          <p className="mt-2 font-bengali text-lg font-semibold text-foreground">
            &ldquo;{copy.problemBangla}&rdquo;
          </p>
          <p className="mt-3 font-mono text-sm font-medium text-orange-800 dark:text-orange-200">
            {copy.problemOptions}
          </p>
        </motion.aside>

        <motion.p
          className="mx-auto mt-8 max-w-[46rem] text-pretty text-center text-base leading-relaxed text-muted-foreground"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.12, ease: GUEST_EASE }}
        >
          {copy.problemP3}
        </motion.p>
      </div>
    </section>
  );
}
