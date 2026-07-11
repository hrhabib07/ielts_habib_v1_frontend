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
import { brandSurfaces } from "@/src/lib/brand-theme";
import { cn } from "@/lib/utils";
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
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border p-8 shadow-xl sm:p-10 md:p-12",
        brandSurfaces.pricingCard,
        "text-foreground",
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0", brandSurfaces.heroGlow)} aria-hidden />

      <div className="relative mx-auto max-w-2xl space-y-8 text-center">
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]",
            brandSurfaces.eyebrowBadge,
          )}
        >
          <Crown className="h-3.5 w-3.5 text-primary" />
          English Foundations
        </div>

        <div className="space-y-3">
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Unlock the full Game of English
          </h1>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Mission 01 is free. Upgrade once to open every camp, mission, and evaluation for the
            full course period.
          </p>
        </div>

        <div
          className={cn(
            "rounded-2xl border px-6 py-8 backdrop-blur-sm",
            "border-border/70 bg-card/80",
            "dark:border-primary/15 dark:bg-card/60",
          )}
        >
          {scholarshipActive && (
            <p className="mb-1 text-lg font-medium text-muted-foreground line-through">
              {basePrice.toLocaleString()} BDT
            </p>
          )}
          <p className="text-6xl font-extrabold tracking-tight text-foreground sm:text-7xl">
            {displayPrice.toLocaleString()}
            <span className="ml-2 text-2xl font-semibold text-muted-foreground">BDT</span>
          </p>
          {scholarshipActive ? (
            <p className={cn("mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold", brandSurfaces.eyebrowBadge)}>
              <Sparkles className="h-4 w-4 text-primary" />
              {FOUNDER_SCHOLARSHIP_PERCENT}% founder price in your first 24 hours
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">One payment · full course access</p>
          )}
          {foundingWindowOpen && (
            <p className="mt-4 text-sm text-muted-foreground">
              <BadgeCheck className="mr-1 inline h-4 w-4 text-primary" />
              Founder bundle before 1 August 2026 (regular {PREMIUM_LIST_PRICE_BDT} BDT)
            </p>
          )}
        </div>

        <ul className="grid gap-3 text-left sm:grid-cols-2">
          {ENGLISH_FEATURES.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm",
                "border-border/70 bg-card/70 text-foreground",
                "dark:border-primary/15 dark:bg-card/50",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  "bg-primary/10 text-primary",
                  "dark:bg-primary/15 dark:text-primary-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-3">
          {isLoggedIn ? (
            purchaseDisabled ? (
              <p
                className={cn(
                  "max-w-md rounded-xl border px-4 py-3 text-sm",
                  "border-primary/20 bg-primary/5 text-foreground",
                  "dark:border-primary/30 dark:bg-primary/10",
                )}
              >
                {purchaseDisabledReason ?? "Checkout is unavailable right now."}
              </p>
            ) : (
              <Button
                size="lg"
                className={cn("h-14 min-w-[280px] rounded-full px-8 text-base font-bold", brandSurfaces.ctaButton)}
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
                className={cn("h-14 min-w-[280px] rounded-full px-8 text-base font-bold", brandSurfaces.ctaButton)}
                asChild
              >
                <a href="/register">Create account · Mission 01 free</a>
              </Button>
              <a
                href="/login"
                className="text-sm font-medium text-primary underline-offset-4 hover:text-primary/80 hover:underline"
              >
                I already have an account
              </a>
            </>
          )}
          <p className="text-xs text-muted-foreground">
            <Shield className="mr-1 inline h-3.5 w-3.5" />
            Manual bKash verification · access within 24 to 48 hours
          </p>
        </div>
      </div>
    </section>
  );
}
