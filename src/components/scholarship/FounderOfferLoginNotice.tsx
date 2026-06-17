"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";
import { useScholarship } from "@/src/contexts/ScholarshipContext";
import { useScholarshipDecayTimer } from "@/src/hooks/useScholarshipTimer";
import {
  FOUNDER_OFFER_SESSION_KEY,
  FOUNDER_SCHOLARSHIP_PRICE_BDT,
  PREMIUM_BASE_PRICE_BDT,
  PREMIUM_LIST_PRICE_BDT,
  FOUNDER_SCHOLARSHIP_PERCENT,
} from "@/src/lib/pricingOffer";

export function FounderOfferLoginNotice() {
  const { status } = useScholarship();
  const [visible, setVisible] = useState(false);
  const decayTimer = useScholarshipDecayTimer(
    status?.scholarshipStartTime ?? status?.createdAt,
  );

  useEffect(() => {
    try {
      const flag = sessionStorage.getItem(FOUNDER_OFFER_SESSION_KEY);
      if (flag === "1") {
        setVisible(true);
        sessionStorage.removeItem(FOUNDER_OFFER_SESSION_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  if (!visible) return null;

  const scholarshipLive = decayTimer.ready && decayTimer.currentTierPercent > 0;

  return (
    <div
      className="border-b border-emerald-500/30 bg-gradient-to-r from-emerald-950/95 via-slate-950 to-emerald-950/95 px-4 py-4 shadow-md"
      role="alert"
    >
      <div className="mx-auto flex max-w-3xl items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
        <div className="min-w-0 flex-1 space-y-1 text-sm">
          <p className="font-semibold text-emerald-50">
            {scholarshipLive
              ? `Your ${FOUNDER_SCHOLARSHIP_PERCENT}% Founder scholarship is active!`
              : "Welcome back. Premium Reading is ready"}
          </p>
          {scholarshipLive ? (
            <p className="text-emerald-100/80">
              Pay{" "}
              <strong className="text-white">{FOUNDER_SCHOLARSHIP_PRICE_BDT} BDT</strong> instead
              of {PREMIUM_LIST_PRICE_BDT} BDT. Your discount ends in{" "}
              <strong className="font-mono text-white tabular-nums">
                {decayTimer.formatted}
              </strong>
              .
            </p>
          ) : (
            <p className="text-emerald-100/80">
              Your 24-hour scholarship window has ended. You can still enroll at{" "}
              <strong className="text-white">{PREMIUM_BASE_PRICE_BDT} BDT</strong>
              {status?.inTrialPhase === false ? " (6 months before 1 Aug 2026)" : ""}.
            </p>
          )}
          <Link
            href="/pricing?checkout=founder"
            className="inline-flex text-xs font-semibold text-emerald-300 underline underline-offset-2 hover:text-white"
          >
            Go to pricing &amp; pay with bKash →
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="shrink-0 rounded-md p-1 text-emerald-300/80 hover:bg-white/10 hover:text-white"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
