"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Award, Play, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GuestCampShowcase } from "@/src/components/home/guest/GuestCampShowcase";
import type { GuestHowItWorksStepIcon } from "@/src/lib/guest-how-it-works-types";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { LANDING_CTA_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import { cn } from "@/lib/utils";

const STEP_ICONS: Record<
  GuestHowItWorksStepIcon,
  typeof Play
> = {
  play: Play,
  badge: Award,
  save: Save,
};

export function GuestHowGamlishWorks() {
  const reduceMotion = useReducedMotion();
  const { copy } = useGuestLandingLocale();
  const content = copy.howItWorks;

  return (
    <>
      <GuestCampShowcase />

      <section
        id="how-gamlish-works"
        className="scroll-mt-24 border-t border-border/30 px-4 pb-28 pt-10 sm:px-6 sm:pb-24 sm:pt-14"
        aria-labelledby="how-gamlish-heading"
      >
        <div className="mx-auto max-w-md space-y-10">
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
          </motion.div>

          <ol className="space-y-3">
            {content.steps.map((step, i) => {
              const Icon = STEP_ICONS[step.icon];
              return (
                <motion.li
                  key={step.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: reduceMotion ? 0 : i * 0.06,
                    ease: GUEST_EASE,
                  }}
                  className="flex gap-3 rounded-2xl border border-border/50 bg-card/80 p-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-foreground">
                      {step.title}
                    </span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </span>
                  </span>
                </motion.li>
              );
            })}
          </ol>

          <div className="rounded-3xl border border-sky-500/25 bg-sky-500/5 px-5 py-8 text-center">
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              {copy.finalCtaTitle}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{copy.finalCtaSub}</p>
            <Button
              size="lg"
              className={cn(
                "mt-5 h-14 w-full rounded-2xl text-base font-bold",
                LANDING_CTA_CLASS,
              )}
              asChild
            >
              <Link href="/demo">{copy.ctaPrimary}</Link>
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">{copy.ctaPrimarySub}</p>
            <Button
              size="lg"
              variant="outline"
              className="mt-3 h-12 w-full rounded-2xl border-2 border-amber-500/50 bg-amber-400/10 text-base font-bold text-amber-950 hover:bg-amber-400/20 dark:border-amber-400/45 dark:text-amber-100"
              asChild
            >
              <Link href="/pricing#pay-now">{copy.ctaPreOrder}</Link>
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">{copy.ctaPreOrderSub}</p>
          </div>
        </div>
      </section>
    </>
  );
}
