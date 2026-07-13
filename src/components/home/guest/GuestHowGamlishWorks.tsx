"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Gamepad2,
  LockOpen,
  Play,
  ShieldCheck,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GuestCampShowcase } from "@/src/components/home/guest/GuestCampShowcase";
import type { GuestHowItWorksStepIcon } from "@/src/lib/guest-how-it-works-types";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { cn } from "@/lib/utils";

const STEP_ICONS: Record<GuestHowItWorksStepIcon, LucideIcon> = {
  gamepad: Gamepad2,
  userPlus: UserPlus,
  shieldCheck: ShieldCheck,
  play: Play,
  unlock: LockOpen,
};

export function GuestHowGamlishWorks() {
  const reduceMotion = useReducedMotion();
  const { copy } = useGuestLandingLocale();
  const content = copy.howItWorks;

  return (
    <section
      id="how-gamlish-works"
      className="scroll-mt-24 border-t border-border/30 px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-14"
      aria-labelledby="how-gamlish-heading"
    >
      <div className="mx-auto max-w-5xl space-y-14 sm:space-y-16">
        <motion.div
          className="text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: GUEST_EASE }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
            {content.eyebrow}
          </p>
          <h2
            id="how-gamlish-heading"
            className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {content.title}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            {content.subtitle}
          </p>
        </motion.div>

        <ol className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {content.steps.map((step, i) => {
            const Icon = STEP_ICONS[step.icon];
            const isLast = i === content.steps.length - 1;
            return (
              <motion.li
                key={step.title}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.45,
                  delay: reduceMotion ? 0 : i * 0.06,
                  ease: GUEST_EASE,
                }}
                className="relative"
              >
                {!isLast ? (
                  <span
                    className="absolute left-8 top-full z-0 hidden h-3 w-px -translate-x-1/2 bg-border/70 sm:hidden"
                    aria-hidden
                  />
                ) : null}
                <article
                  className={cn(
                    "relative h-full rounded-2xl border border-border/60 bg-card px-5 py-5",
                    "transition-colors duration-300 hover:border-accent/25 hover:bg-accent/[0.03]",
                  )}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </article>
              </motion.li>
            );
          })}
        </ol>

        <motion.aside
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: GUEST_EASE }}
          className={cn(
            "flex flex-col gap-4 rounded-2xl border border-border/60 bg-card px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6",
          )}
          aria-label={content.squad.title}
        >
          <div className="flex min-w-0 items-start gap-4 sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300">
              <Users className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                {content.squad.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {content.squad.description}
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-200">
            {content.squad.badge}
          </span>
        </motion.aside>

        <GuestCampShowcase />

        <motion.div
          className="relative overflow-hidden rounded-3xl border border-border/50 bg-card px-6 py-10 text-center sm:px-12 sm:py-12"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: GUEST_EASE }}
        >
          <p className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {content.bottomCtaTitle}
          </p>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {content.bottomCtaSub}
          </p>
          <Button
            size="lg"
            className="guest-cta-glow mt-7 h-12 rounded-full bg-accent px-10 font-semibold text-accent-foreground hover:bg-accent/92"
            asChild
          >
            <Link href="/register" className="inline-flex items-center gap-2">
              {copy.ctaPrimary}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
