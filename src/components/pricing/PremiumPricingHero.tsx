"use client";

import {
  BadgeCheck,
  BookOpen,
  Crown,
  LineChart,
  Shield,
  Sparkles,
  Target,
  Timer,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScholarshipDecayTimer } from "@/src/hooks/useScholarshipTimer";
import {
  FOUNDER_SCHOLARSHIP_PERCENT,
  FOUNDER_SCHOLARSHIP_PRICE_BDT,
  PREMIUM_BASE_PRICE_BDT,
} from "@/src/lib/pricingOffer";
import type { ScholarshipStatus } from "@/src/lib/api/scholarship";
import { isFoundingMemberWindowOpen } from "@/src/lib/foundingMember";
import { resolveScholarshipWindowStart } from "@/src/lib/scholarshipWindow";

const PREMIUM_FEATURES = [
  { icon: BookOpen, label: "All 21 Reading levels unlocked" },
  { icon: Target, label: "Band-targeted practice & mock tests" },
  { icon: LineChart, label: "Progress analytics & streak tracking" },
  { icon: Shield, label: "Structured IELTS-style progression" },
] as const;

interface PremiumPricingHeroProps {
  scholarshipStatus: ScholarshipStatus | null;
  isLoggedIn: boolean;
  onPurchase: () => void;
  purchaseDisabled?: boolean;
  purchaseDisabledReason?: string;
}

export function PremiumPricingHero({
  scholarshipStatus,
  isLoggedIn,
  onPurchase,
  purchaseDisabled,
  purchaseDisabledReason,
}: PremiumPricingHeroProps) {
  const windowStart = resolveScholarshipWindowStart(scholarshipStatus);
  const decayTimer = useScholarshipDecayTimer(windowStart);
  const scholarshipActive =
    (scholarshipStatus?.activeDiscountPercent ?? 0) > 0 ||
    (decayTimer.ready && decayTimer.currentTierPercent > 0);
  const foundingWindowOpen = isFoundingMemberWindowOpen();

  const displayPrice = scholarshipActive
    ? (scholarshipStatus?.discountedPrice ?? FOUNDER_SCHOLARSHIP_PRICE_BDT)
    : PREMIUM_BASE_PRICE_BDT;

  const basePrice =
    scholarshipStatus?.basePrice && scholarshipStatus.basePrice > 0
      ? scholarshipStatus.basePrice
      : PREMIUM_BASE_PRICE_BDT;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-b from-slate-950 via-indigo-950/95 to-slate-950 p-8 text-white shadow-2xl shadow-violet-950/30 sm:p-10 md:p-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(139,92,246,0.35),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-2xl space-y-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
          <Crown className="h-3.5 w-3.5 text-amber-300" />
          Gamlish Reading Premium
        </div>

        <div className="space-y-3">
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {scholarshipActive
              ? "Your Founder scholarship is live"
              : "Master IELTS Reading — the Gamlish way"}
          </h1>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-violet-200/85 sm:text-base">
            {scholarshipActive
              ? `Pay ${FOUNDER_SCHOLARSHIP_PRICE_BDT} BDT now — ${FOUNDER_SCHOLARSHIP_PERCENT}% off ${PREMIUM_BASE_PRICE_BDT} BDT. Your window closes when the timer hits zero.`
              : foundingWindowOpen
                ? `${PREMIUM_BASE_PRICE_BDT} BDT unlocks 6 months of premium — priced like one month. Founder badge included before 1 August 2026.`
                : `${PREMIUM_BASE_PRICE_BDT} BDT per month for full premium Reading access.`}
          </p>
        </div>

        {scholarshipActive && (
          <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/35 bg-amber-400/10 px-5 py-3 text-sm font-medium text-amber-100">
            <Timer className="h-4 w-4 shrink-0 animate-pulse" />
            <span>
              Scholarship ends in{" "}
              <span className="font-mono text-lg font-bold tabular-nums text-white">
                {decayTimer.ready ? decayTimer.formatted : "24:00:00"}
              </span>
            </span>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-8 backdrop-blur-sm">
          {scholarshipActive && (
            <p className="mb-1 text-xl font-medium text-violet-300/70 line-through">
              {basePrice.toLocaleString()} BDT
            </p>
          )}
          <p className="text-6xl font-extrabold tracking-tight sm:text-7xl">
            {displayPrice.toLocaleString()}
            <span className="ml-2 text-2xl font-semibold text-violet-300">BDT</span>
          </p>
          {scholarshipActive && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-1 text-sm font-semibold text-violet-100">
              <Sparkles className="h-4 w-4 text-amber-300" />
              {FOUNDER_SCHOLARSHIP_PERCENT}% Founder scholarship applied
            </p>
          )}
          {foundingWindowOpen && (
            <p className="mt-4 text-sm text-violet-200/80">
              <BadgeCheck className="mr-1 inline h-4 w-4 text-emerald-400" />
              <strong className="text-white">6 months</strong> access — special Founder bundle
              (displayed as 1-month price)
            </p>
          )}
        </div>

        <ul className="grid gap-3 text-left sm:grid-cols-2">
          {PREMIUM_FEATURES.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-violet-100"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-violet-200">
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-3">
          {isLoggedIn ? (
            purchaseDisabled ? (
              <p className="max-w-md rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                {purchaseDisabledReason ?? "Checkout is unavailable right now."}
              </p>
            ) : (
              <Button
                size="lg"
                className="h-14 min-w-[280px] rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-8 text-base font-bold text-slate-950 shadow-xl shadow-orange-500/25 hover:from-amber-300 hover:via-orange-400 hover:to-rose-400"
                onClick={onPurchase}
              >
                <Zap className="mr-2 h-4 w-4" />
                {scholarshipActive
                  ? `Pay ${FOUNDER_SCHOLARSHIP_PRICE_BDT} BDT with bKash`
                  : `Pay ${PREMIUM_BASE_PRICE_BDT} BDT with bKash`}
              </Button>
            )
          ) : (
            <>
              <Button
                size="lg"
                className="h-14 min-w-[280px] rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 px-8 text-base font-bold shadow-lg shadow-violet-500/30"
                asChild
              >
                <a href="/register">Create account — 60% off for 24 hours</a>
              </Button>
              <a
                href="/login"
                className="text-sm font-medium text-violet-300/80 underline-offset-4 hover:text-white hover:underline"
              >
                I already have an account
              </a>
            </>
          )}
          <p className="text-xs text-violet-300/60">
            Secure manual verification · Premium unlocks within 24–48 hours
          </p>
        </div>
      </div>
    </section>
  );
}
