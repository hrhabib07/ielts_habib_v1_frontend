"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Sparkles, Timer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScholarship } from "@/src/contexts/ScholarshipContext";
import { useScholarshipDecayTimer } from "@/src/hooks/useScholarshipTimer";
import { resolveScholarshipWindowStart } from "@/src/lib/scholarshipWindow";
import {
  FOUNDER_OFFER_SESSION_KEY,
  FOUNDER_SCHOLARSHIP_PERCENT,
  FOUNDER_SCHOLARSHIP_PRICE_BDT,
  PREMIUM_BASE_PRICE_BDT,
} from "@/src/lib/pricingOffer";
import { isFoundingMemberWindowOpen } from "@/src/lib/foundingMember";

export function FounderWelcomeModal() {
  const { status } = useScholarship();
  const [open, setOpen] = useState(false);
  const windowStart = resolveScholarshipWindowStart(status);
  const decayTimer = useScholarshipDecayTimer(windowStart);
  const foundingWindowOpen = isFoundingMemberWindowOpen();

  useEffect(() => {
    try {
      if (sessionStorage.getItem(FOUNDER_OFFER_SESSION_KEY) === "1") {
        setOpen(true);
        sessionStorage.removeItem(FOUNDER_OFFER_SESSION_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  const scholarshipLive = decayTimer.ready && decayTimer.currentTierPercent > 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="founder-welcome-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        aria-label="Close"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 p-8 shadow-2xl shadow-violet-950/50">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl"
          aria-hidden
        />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-violet-300/80 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Dismiss"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
            <Crown className="h-7 w-7 text-white" />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-300">
              Founder opportunity
            </p>
            <h2 id="founder-welcome-title" className="text-2xl font-bold text-white sm:text-3xl">
              {scholarshipLive
                ? `You unlocked ${FOUNDER_SCHOLARSHIP_PERCENT}% off`
                : "Welcome to Gamlish"}
            </h2>
          </div>

          {scholarshipLive ? (
            <>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5">
                <p className="text-sm text-violet-200/90 line-through">
                  {PREMIUM_BASE_PRICE_BDT} BDT
                </p>
                <p className="mt-1 text-5xl font-extrabold tracking-tight text-white">
                  {FOUNDER_SCHOLARSHIP_PRICE_BDT}
                  <span className="ml-2 text-xl font-semibold text-violet-300">BDT</span>
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300">
                  <Sparkles className="h-4 w-4" />
                  {FOUNDER_SCHOLARSHIP_PERCENT}% Founder scholarship
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-100">
                <Timer className="h-4 w-4 shrink-0" />
                <span>
                  Offer ends in{" "}
                  <span className="font-mono text-base font-bold tabular-nums text-white">
                    {decayTimer.formatted}
                  </span>
                </span>
              </div>

              {foundingWindowOpen && (
                <p className="text-sm leading-relaxed text-violet-200/80">
                  Before <strong className="text-white">1 August 2026</strong>: pay like{" "}
                  <strong className="text-white">1 month</strong>, get{" "}
                  <strong className="text-white">6 months</strong> of premium Reading + a permanent
                  Founding Member badge.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm leading-relaxed text-violet-200/80">
              Your 24-hour scholarship window has ended. You can still enroll at{" "}
              <strong className="text-white">{PREMIUM_BASE_PRICE_BDT} BDT</strong>
              {foundingWindowOpen ? " for 6 months of premium access." : " per month."}
            </p>
          )}

          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-base font-bold shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-indigo-500"
            >
              <Link href="/pricing?checkout=founder" onClick={() => setOpen(false)}>
                {scholarshipLive
                  ? `Pay ${FOUNDER_SCHOLARSHIP_PRICE_BDT} BDT with bKash`
                  : "Go to pricing"}
              </Link>
            </Button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-violet-300/80 hover:text-white"
            >
              I&apos;ll explore first
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
