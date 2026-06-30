"use client";

import { AlertTriangle, CalendarClock, Sparkles } from "lucide-react";
import { isFoundingMemberWindowOpen } from "@/src/lib/foundingMember";
import {
  FOUNDER_SCHOLARSHIP_PERCENT,
  FOUNDER_SCHOLARSHIP_PRICE_BDT,
  PREMIUM_BASE_PRICE_BDT,
  PREMIUM_LIST_PRICE_BDT,
} from "@/src/lib/pricingOffer";

export function FoundingMemberPricingAlert() {
  const windowOpen = isFoundingMemberWindowOpen();

  return (
    <div
      className={
        windowOpen
          ? "relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-violet-500/5 p-6 shadow-md ring-1 ring-amber-500/15"
          : "relative overflow-hidden rounded-2xl border border-border/80 bg-muted/30 p-6"
      }
    >
      {windowOpen && (
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-400/15 blur-2xl"
          aria-hidden
        />
      )}
      <div className="relative flex gap-4">
        <div
          className={
            windowOpen
              ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-amber-600 dark:text-amber-400"
              : "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"
          }
        >
          {windowOpen ? (
            <CalendarClock className="h-6 w-6" />
          ) : (
            <AlertTriangle className="h-6 w-6" />
          )}
        </div>
        <div className="space-y-3 text-sm leading-relaxed">
          {windowOpen ? (
            <>
              <p className="text-base font-bold text-foreground">
                Before 1 August 2026 · Founder pricing
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    Regular Founder price
                  </p>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    {PREMIUM_BASE_PRICE_BDT} BDT
                  </p>
                  <p className="text-xs text-muted-foreground">
                    6 months access · priced like 1 month · permanent badge
                  </p>
                </div>
                <div className="rounded-xl border border-violet-500/25 bg-violet-500/5 p-3">
                  <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-400">
                    <Sparkles className="h-3 w-3" />
                    First 24 hours only
                  </p>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    <span className="text-sm font-medium text-muted-foreground line-through">
                      {PREMIUM_LIST_PRICE_BDT} BDT
                    </span>{" "}
                    {FOUNDER_SCHOLARSHIP_PRICE_BDT} BDT
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {FOUNDER_SCHOLARSHIP_PERCENT}% scholarship · same 6-month bundle
                  </p>
                </div>
              </div>
              <p className="text-xs text-amber-900/90 dark:text-amber-100/80">
                Create your account to start the 24-hour countdown. After 1 August 2026, pricing
                becomes {PREMIUM_BASE_PRICE_BDT} BDT/month with no bundle or badge.
              </p>
            </>
          ) : (
            <>
              <p className="text-base font-bold text-foreground">
                Standard pricing from 1 August 2026
              </p>
              <p className="text-muted-foreground">
                English Foundations is now{" "}
                <strong className="text-foreground">{PREMIUM_BASE_PRICE_BDT} BDT per month</strong>{" "}
                with no bundle discount. The full-course Founder bundle and badge are no longer
                available.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
