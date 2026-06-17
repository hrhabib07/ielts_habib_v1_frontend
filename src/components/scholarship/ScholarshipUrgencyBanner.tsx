"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Sparkles, Timer } from "lucide-react";
import { useScholarship } from "@/src/contexts/ScholarshipContext";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";
import { useScholarshipDecayTimer } from "@/src/hooks/useScholarshipTimer";
import { usePaymentApplicationStatus } from "@/src/hooks/usePaymentApplicationStatus";
import { isReadingExamSimulationPath } from "@/src/lib/siteScrollPolicy";
import { resolveScholarshipWindowStart } from "@/src/lib/scholarshipWindow";
import {
  FOUNDER_SCHOLARSHIP_PERCENT,
  FOUNDER_SCHOLARSHIP_PRICE_BDT,
  PREMIUM_LIST_PRICE_BDT,
} from "@/src/lib/pricingOffer";

export function ScholarshipUrgencyBanner() {
  const pathname = usePathname();
  const { status } = useScholarship();
  const { subscription, loading: sessionLoading } = useStudentSession();
  const { isPendingReview, hasActiveAccess, loading: paymentLoading } =
    usePaymentApplicationStatus(true);
  const windowStart = resolveScholarshipWindowStart(status);
  const decayTimer = useScholarshipDecayTimer(windowStart);

  if (isReadingExamSimulationPath(pathname)) {
    return null;
  }

  const hasPaidAccess =
    hasActiveAccess || subscription?.status === "ACTIVE";
  if (!paymentLoading && !sessionLoading && (isPendingReview || hasPaidAccess)) {
    return null;
  }

  const scholarshipLive =
    (status?.activeDiscountPercent ?? 0) > 0 ||
    (decayTimer.ready && decayTimer.currentTierPercent > 0);

  if (!scholarshipLive) {
    return null;
  }

  return (
    <Link
      href="/pricing?checkout=founder"
      className="group relative block overflow-hidden border-b border-violet-400/40 bg-gradient-to-r from-violet-950 via-indigo-950 to-violet-950 px-4 py-3 shadow-lg shadow-violet-950/50 transition-all hover:from-violet-900 hover:via-indigo-900"
      role="status"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(251,191,36,0.08),transparent)] opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-sm text-violet-50">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-200 ring-1 ring-amber-400/30">
          <Sparkles className="h-3 w-3" />
          Founder scholarship
        </span>
        <span className="font-semibold leading-snug">
          <span className="text-amber-300">{FOUNDER_SCHOLARSHIP_PERCENT}% off</span>. Pay{" "}
          <span className="text-white">{FOUNDER_SCHOLARSHIP_PRICE_BDT} BDT</span>{" "}
          <span className="text-violet-300/80 line-through">{PREMIUM_LIST_PRICE_BDT} BDT</span>{" "}
          if you enroll within{" "}
          <span className="inline-flex items-center gap-1 font-mono text-base tabular-nums text-amber-200">
            <Timer className="h-3.5 w-3.5" />
            {decayTimer.ready ? decayTimer.formatted : "24:00:00"}
          </span>
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white ring-1 ring-white/20 group-hover:bg-white/15">
          Claim now
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

export function ScholarshipBannerSpacer() {
  return null;
}
