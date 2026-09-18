"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import {
  LANDING_CTA_CLASS,
  LANDING_EYEBROW_CLASS,
} from "@/src/components/home/guest/guest-landing-theme";
import {
  TEST_LANDING_PRIMARY_HREF,
  TEST_LANDING_SECONDARY_HREF,
} from "@/src/lib/test-landing-copy";
import { TestLandingPriceLine } from "@/src/components/home/test-landing/TestLandingPriceLine";
import { useTestLandingCopy } from "@/src/components/home/test-landing/useTestLandingCopy";
import { usePublicPricing } from "@/src/hooks/usePublicPricing";
import { MonthlyOfferStory } from "@/src/components/pricing/MonthlyOfferStory";
import { cn } from "@/lib/utils";

export function TestLandingOffer() {
  const reduceMotion = useReducedMotion();
  const { copy } = useTestLandingCopy();
  const pricing = usePublicPricing();

  return (
    <section
      className="relative overflow-hidden py-16 sm:py-20 md:py-24"
      aria-labelledby="test-landing-offer-title"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_50%_at_50%_50%,rgba(56,189,248,0.16),transparent_70%)]"
        aria-hidden
      />
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <motion.div
          className="rounded-[1.75rem] border border-sky-400/35 bg-gradient-to-br from-sky-500/10 via-card to-card p-6 shadow-[0_28px_90px_-40px_rgba(14,165,233,0.55)] sm:p-8"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: GUEST_EASE }}
        >
          <p className={LANDING_EYEBROW_CLASS}>{copy.offerEyebrow}</p>
          <h2
            id="test-landing-offer-title"
            className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            {copy.offerTitle}
          </h2>
          <div className="mt-5">
            <TestLandingPriceLine align="card" />
          </div>

          <div className="mt-5">
            <MonthlyOfferStory pricing={pricing} size="md" showPaidChip={false} />
          </div>

          <ul className="mt-6 space-y-3">
            {copy.offerItems.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-base leading-relaxed text-foreground sm:text-lg"
              >
                <Check className="mt-1 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <Button
            size="lg"
            className={cn(
              "mt-6 h-auto min-h-14 w-full whitespace-normal rounded-2xl px-5 py-3.5 text-base font-bold sm:text-lg",
              LANDING_CTA_CLASS,
            )}
            asChild
          >
            <Link href={TEST_LANDING_PRIMARY_HREF}>{copy.offerCta}</Link>
          </Button>
          <Link
            href={TEST_LANDING_SECONDARY_HREF}
            className="mt-3 block text-center text-base font-semibold text-foreground/75 underline-offset-4 hover:underline"
          >
            {copy.ctaSecondary}
          </Link>
          <p className="mt-4 text-center text-sm leading-relaxed text-foreground/65 sm:text-[0.95rem]">
            {copy.offerRisk}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
