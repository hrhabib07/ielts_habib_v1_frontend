"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBdt } from "@/src/lib/api/pricing";
import { JOURNEY_LIST_PRICE_BDT } from "@/src/lib/journey-prices";
import { trackFunnelEvent } from "@/src/lib/api/analytics";
import {
  MISSION_ONE_PAYWALL_COPY as COPY,
  type MissionOnePaywallScore,
} from "@/src/lib/mission-one-paywall";
import { cn } from "@/lib/utils";

export function MissionOnePaywallFlow({
  score: _score,
  missionsDone: _missionsDone,
  missionsTotal: _missionsTotal,
  onLater,
  className,
  checkoutHref = COPY.checkoutHref,
}: {
  score: MissionOnePaywallScore | null;
  missionsDone: number;
  missionsTotal: number;
  onLater: () => void;
  className?: string;
  checkoutHref?: string;
}) {
  useEffect(() => {
    void trackFunnelEvent({
      event: "paywall_shown",
      screen: "journey_lock",
      metadata: { priceBdt: JOURNEY_LIST_PRICE_BDT },
    });
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col bg-slate-950 text-white",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1e3a5f_0%,transparent_55%)]" />
      <div className="relative mx-auto flex h-full w-full max-w-lg flex-1 flex-col justify-center gap-5 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] font-bengali">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-6 w-6 shrink-0 text-rose-300" />
            <div>
              <h1 className="text-2xl font-black">{COPY.headline}</h1>
              <p className="mt-2 text-sm font-medium leading-relaxed text-white/75">
                {COPY.gapBody}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-amber-400/30 bg-gradient-to-b from-amber-400/15 to-transparent p-5 text-center">
          <p className="font-sans text-4xl font-black tabular-nums text-amber-300">
            {formatBdt(JOURNEY_LIST_PRICE_BDT)}
          </p>
          <p className="mt-3 text-xs font-semibold leading-relaxed text-white/70">
            {COPY.clarifier}
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="h-14 w-full rounded-2xl bg-amber-400 text-base font-black text-slate-950 hover:bg-amber-300"
        >
          <Link href={checkoutHref}>{COPY.cta}</Link>
        </Button>
        <button
          type="button"
          onClick={onLater}
          className="text-center text-sm font-semibold text-white/45 hover:text-white/70"
        >
          {COPY.later}
        </button>
      </div>
    </div>
  );
}
