"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useScholarship } from "@/src/contexts/ScholarshipContext";
import { useScholarshipDecayTimer } from "@/src/hooks/useScholarshipTimer";
import { claimMyScholarship } from "@/src/lib/api/scholarship";
import { resolveScholarshipWindowStart } from "@/src/lib/scholarshipWindow";
import { FOUNDER_SCHOLARSHIP_PERCENT } from "@/src/lib/pricingOffer";

export function ScholarshipDecayClaimCard() {
  const { status, refresh } = useScholarship();
  const decayTimer = useScholarshipDecayTimer(resolveScholarshipWindowStart(status));
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (
    !status?.inTrialPhase ||
    status.isClaimActive ||
    status.isFullyExpired ||
    status.currentTierPercent <= 0
  ) {
    return null;
  }

  const handleClaim = async () => {
    setClaiming(true);
    setError(null);
    try {
      await claimMyScholarship();
      await refresh();
    } catch {
      setError("Could not claim scholarship. The tier may have expired.");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-indigo-500/35 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-slate-100 shadow-sm">
      <p className="text-sm font-semibold">Founder&apos;s {FOUNDER_SCHOLARSHIP_PERCENT}% scholarship</p>
      <p className="mt-2 text-sm text-slate-400">
        Your Early Student offer ends in{" "}
        <span className="font-mono tabular-nums text-indigo-300">
          {decayTimer.ready ? decayTimer.formatted : "--:--:--"}
        </span>
        . This offer is available until 1 August 2026.
      </p>
      <p className="mt-2 text-xs text-slate-500">
        Claim now to lock {FOUNDER_SCHOLARSHIP_PERCENT}% off at checkout. After 1 August 2026 the scholarship disappears
        permanently and pricing returns to full rate.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={claiming}
          className="bg-indigo-600 hover:bg-indigo-500"
          onClick={() => void handleClaim()}
        >
          {claiming ? "Claiming…" : `Claim ${status.currentTierPercent}% scholarship`}
        </Button>
        <Button asChild variant="outline" className="border-slate-600 bg-transparent text-slate-200">
          <Link href="/profile/reading">Keep training</Link>
        </Button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
    </Card>
  );
}
