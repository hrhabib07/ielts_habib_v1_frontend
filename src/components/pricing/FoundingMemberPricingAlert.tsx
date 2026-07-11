"use client";

import { AlertTriangle, CalendarClock, Sparkles } from "lucide-react";
import { isFoundingMemberWindowOpen } from "@/src/lib/foundingMember";
import {
  FOUNDER_SCHOLARSHIP_PERCENT,
  FOUNDER_SCHOLARSHIP_PRICE_BDT,
  PREMIUM_BASE_PRICE_BDT,
  PREMIUM_LIST_PRICE_BDT,
} from "@/src/lib/pricingOffer";
import { brandSurfaces } from "@/src/lib/brand-theme";
import { cn } from "@/lib/utils";

export function FoundingMemberPricingAlert() {
  const windowOpen = isFoundingMemberWindowOpen();

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6",
        windowOpen
          ? cn("shadow-md ring-1 ring-primary/15", brandSurfaces.premiumBanner)
          : "border-border/80 bg-muted/30",
      )}
    >
      {windowOpen && (
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl"
          aria-hidden
        />
      )}
      <div className="relative flex gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            windowOpen
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          )}
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
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Regular Founder price
                  </p>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    {PREMIUM_BASE_PRICE_BDT} BDT
                  </p>
                  <p className="text-xs text-muted-foreground">
                    6 months access · priced like 1 month · permanent badge
                  </p>
                </div>
                <div className="rounded-xl border border-primary/25 bg-primary/8 p-3">
                  <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-primary">
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
              <p className="text-xs text-muted-foreground">
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
