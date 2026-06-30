"use client";

import {
  BadgeCheck,
  Crown,
  Gamepad2,
  LineChart,
  Map,
  Shield,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FOUNDER_SCHOLARSHIP_PERCENT,
  FOUNDER_SCHOLARSHIP_PRICE_BDT,
  PREMIUM_BASE_PRICE_BDT,
  PREMIUM_LIST_PRICE_BDT,
} from "@/src/lib/pricingOffer";
import type { ScholarshipStatus } from "@/src/lib/api/scholarship";
import { isFoundingMemberWindowOpen } from "@/src/lib/foundingMember";
import { resolveScholarshipWindowStart } from "@/src/lib/scholarshipWindow";
import { useScholarshipDecayTimer } from "@/src/hooks/useScholarshipTimer";

const ENGLISH_FEATURES = [
  { icon: Map, label: "All 4 camps & 21 missions" },
  { icon: Gamepad2, label: "Story, video & evaluation levels" },
  { icon: LineChart, label: "XP, coins & camp progress" },
  { icon: Trophy, label: "Mission 01 free before you upgrade" },
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
      : PREMIUM_LIST_PRICE_BDT;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-indigo-500/15 bg-gradient-to-b from-slate-950 via-indigo-950/95 to-slate-950 p-8 text-white shadow-2xl shadow-indigo-950/20 sm:p-10 md:p-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.28),transparent_55%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-2xl space-y-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
          <Crown className="h-3.5 w-3.5 text-amber-300" />
          English Foundations
        </div>

        <div className="space-y-3">
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Unlock the full Game of English
          </h1>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-indigo-100/80 sm:text-base">
            Mission 01 is free. Upgrade once to open every camp, mission, and evaluation for the
            full course period.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-8 backdrop-blur-sm">
          {scholarshipActive && (
            <p className="mb-1 text-lg font-medium text-indigo-300/70 line-through">
              {basePrice.toLocaleString()} BDT
            </p>
          )}
          <p className="text-6xl font-extrabold tracking-tight sm:text-7xl">
            {displayPrice.toLocaleString()}
            <span className="ml-2 text-2xl font-semibold text-indigo-300">BDT</span>
          </p>
          {scholarshipActive ? (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-sm font-semibold text-amber-100">
              <Sparkles className="h-4 w-4 text-amber-300" />
              {FOUNDER_SCHOLARSHIP_PERCENT}% founder price in your first 24 hours
            </p>
          ) : (
            <p className="mt-3 text-sm text-indigo-200/75">One payment · full course access</p>
          )}
          {foundingWindowOpen && (
            <p className="mt-4 text-sm text-indigo-200/80">
              <BadgeCheck className="mr-1 inline h-4 w-4 text-emerald-400" />
              Founder bundle before 1 August 2026 (regular {PREMIUM_LIST_PRICE_BDT} BDT)
            </p>
          )}
        </div>

        <ul className="grid gap-3 text-left sm:grid-cols-2">
          {ENGLISH_FEATURES.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-indigo-100"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-200">
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
                className="h-14 min-w-[280px] rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-8 text-base font-bold shadow-lg shadow-indigo-600/30"
                onClick={onPurchase}
              >
                <Zap className="mr-2 h-4 w-4" />
                Get full access · {displayPrice.toLocaleString()} BDT
              </Button>
            )
          ) : (
            <>
              <Button
                size="lg"
                className="h-14 min-w-[280px] rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-8 text-base font-bold shadow-lg shadow-indigo-600/30"
                asChild
              >
                <a href="/register">Create account · Mission 01 free</a>
              </Button>
              <a
                href="/login"
                className="text-sm font-medium text-indigo-300/80 underline-offset-4 hover:text-white hover:underline"
              >
                I already have an account
              </a>
            </>
          )}
          <p className="text-xs text-indigo-300/60">
            <Shield className="mr-1 inline h-3.5 w-3.5" />
            Manual bKash verification · access within 24 to 48 hours
          </p>
        </div>
      </div>
    </section>
  );
}
