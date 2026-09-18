"use client";

import Link from "next/link";
import {
  Award,
  Clock3,
  MessageCircleQuestion,
  PenLine,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import {
  LANDING_CTA_CLASS,
  LANDING_EYEBROW_CLASS,
} from "@/src/components/home/guest/guest-landing-theme";
import { TEST_LANDING_SECONDARY_HREF } from "@/src/lib/test-landing-copy";
import { useTestLandingCopy } from "@/src/components/home/test-landing/useTestLandingCopy";
import { cn } from "@/lib/utils";

const CAMP_ICONS = [PenLine, MessageCircleQuestion, Clock3, Award] as const;

function campIndexLabel(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function TestLandingCamps() {
  const reduceMotion = useReducedMotion();
  const { copy } = useTestLandingCopy();
  const [firstCamp, ...restCamps] = copy.camps;

  return (
    <section
      className="relative overflow-hidden py-12 sm:py-20 md:py-24"
      aria-labelledby="test-landing-camps-title"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(56,189,248,0.12),transparent_60%)]"
        aria-hidden
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: GUEST_EASE }}
        >
          <p className={LANDING_EYEBROW_CLASS}>{copy.campsEyebrow}</p>
          <h2
            id="test-landing-camps-title"
            className="mt-4 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
          >
            {copy.campsTitle}
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-foreground/80 sm:text-xl">
            {copy.campsSub}
          </p>
        </motion.div>

        {firstCamp ? (
          <motion.article
            className="relative mt-10 overflow-hidden rounded-[1.75rem] border border-sky-400/40 bg-gradient-to-br from-sky-500/16 via-card to-card p-5 shadow-[0_28px_80px_-36px_rgba(14,165,233,0.55)] sm:p-8"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: GUEST_EASE }}
          >
            <span
              className="num pointer-events-none absolute -right-1 -top-6 text-[7rem] font-black leading-none text-sky-500/[0.08] sm:text-[9rem]"
              aria-hidden
            >
              {campIndexLabel(0)}
            </span>

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/30">
                    <PenLine className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="inline-flex rounded-full bg-sky-500/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-200">
                    {firstCamp.badge}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-black text-white">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    {copy.campFreeNote}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
                    {copy.campStartHere}
                  </span>
                </div>

                <h3 className="mt-4 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {firstCamp.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-foreground/80 sm:text-lg">
                  {firstCamp.body}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {firstCamp.chips.map((chip) => (
                    <li
                      key={chip}
                      className="rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1 text-sm font-semibold text-sky-950 dark:text-sky-100"
                    >
                      {chip}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                size="lg"
                className={cn(
                  "h-auto min-h-12 w-full shrink-0 rounded-2xl px-5 py-3 text-base font-bold lg:w-auto",
                  LANDING_CTA_CLASS,
                )}
                asChild
              >
                <Link href={TEST_LANDING_SECONDARY_HREF}>{copy.campPlayCta}</Link>
              </Button>
            </div>
          </motion.article>
        ) : null}

        <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restCamps.map((camp, restIndex) => {
            const index = restIndex + 1;
            const Icon = CAMP_ICONS[index] ?? Award;
            return (
              <motion.li
                key={camp.badge}
                className="relative overflow-hidden rounded-3xl border border-sky-500/25 bg-card p-5 shadow-sm sm:p-6"
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.5,
                  delay: reduceMotion ? 0 : restIndex * 0.06,
                  ease: GUEST_EASE,
                }}
              >
                <span
                  className="num pointer-events-none absolute -right-1 -top-3 text-7xl font-black leading-none text-foreground/[0.045]"
                  aria-hidden
                >
                  {campIndexLabel(index)}
                </span>
                <div className="relative flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/12 text-sky-700 dark:text-sky-300">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="inline-flex rounded-full bg-sky-500/12 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-200">
                    {camp.badge}
                  </span>
                  <span className="inline-flex rounded-full bg-amber-400/15 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                    {copy.campNextStep}
                  </span>
                </div>
                <h3 className="relative mt-4 text-xl font-bold text-foreground">
                  {camp.title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-foreground/75 sm:text-[0.95rem]">
                  {camp.body}
                </p>
                <ul className="relative mt-4 flex flex-wrap gap-1.5">
                  {camp.chips.map((chip) => (
                    <li
                      key={chip}
                      className="rounded-full border border-border/70 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground/80"
                    >
                      {chip}
                    </li>
                  ))}
                </ul>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
