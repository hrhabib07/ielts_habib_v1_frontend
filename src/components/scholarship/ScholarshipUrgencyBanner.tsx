"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useScholarship } from "@/src/contexts/ScholarshipContext";
import {
  useClaimExpiryTimer,
  useScholarshipDecayTimer,
} from "@/src/hooks/useScholarshipTimer";
import { usePaymentApplicationStatus } from "@/src/hooks/usePaymentApplicationStatus";
import { claimMyScholarship } from "@/src/lib/api/scholarship";
import { isReadingExamSimulationPath } from "@/src/lib/siteScrollPolicy";

export function ScholarshipUrgencyBanner() {
  const pathname = usePathname();
  const { status, refresh } = useScholarship();
  const { isPendingReview, hasActiveAccess, loading: paymentLoading } =
    usePaymentApplicationStatus(Boolean(status?.inTrialPhase));
  const decayTimer = useScholarshipDecayTimer(
    status?.scholarshipStartTime ?? status?.createdAt,
  );
  const claimTimer = useClaimExpiryTimer(status?.claimRemainingMs ?? 0);
  const [claiming, setClaiming] = useState(false);

  if (isReadingExamSimulationPath(pathname)) {
    return null;
  }

  if (!status?.inTrialPhase) {
    return null;
  }

  if (!paymentLoading && (isPendingReview || hasActiveAccess)) {
    return null;
  }

  if (status.isClaimActive && status.claimedDiscountPercent != null) {
    return (
      <div
        className="sticky top-0 z-[60] border-b border-orange-600/80 bg-gradient-to-r from-red-950 via-orange-950 to-red-950 px-4 py-3 text-center text-sm text-orange-50 shadow-lg shadow-red-950/50 backdrop-blur-md"
        role="alert"
        aria-live="assertive"
      >
        <p className="mx-auto max-w-4xl font-semibold leading-snug">
          You have{" "}
          <span className="font-mono text-base tabular-nums text-white">
            {claimTimer.ready ? claimTimer.formatted : "24:00:00"}
          </span>{" "}
          to enroll with your{" "}
          <span className="text-white">{status.claimedDiscountPercent}%</span> discount!
          <Link
            href="/pricing"
            className="ml-2 inline-flex underline decoration-orange-300/80 underline-offset-2 hover:text-white"
          >
            Go to checkout
          </Link>
        </p>
      </div>
    );
  }

  if (status.isFullyExpired || status.currentTierPercent <= 0) {
    return null;
  }

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await claimMyScholarship();
      await refresh();
    } catch {
      /* toast optional */
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div
      className="sticky top-0 z-[60] border-b border-indigo-500/40 bg-slate-950/95 px-4 py-2.5 text-center text-sm text-slate-100 shadow-lg shadow-slate-950/40 backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      <p className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-2 gap-y-2 font-medium leading-snug">
        <span>
          Founder&apos;s <span className="font-semibold text-white">60%</span> scholarship ends in{" "}
          <span className="font-mono font-semibold tabular-nums text-indigo-300">
            {decayTimer.ready ? decayTimer.formatted : "--:--:--"}
          </span>
          . Only available until 1 August 2026.
        </span>
        <Button
          type="button"
          size="sm"
          disabled={claiming}
          className="h-8 rounded-full bg-indigo-600 px-4 text-xs font-semibold hover:bg-indigo-500"
          onClick={() => void handleClaim()}
        >
          {claiming ? "Claiming…" : "Claim scholarship"}
        </Button>
        <Link
          href="/pricing"
          className="text-xs text-indigo-300 underline underline-offset-2 hover:text-white"
        >
          View plans
        </Link>
      </p>
    </div>
  );
}

export function ScholarshipBannerSpacer() {
  return null;
}
