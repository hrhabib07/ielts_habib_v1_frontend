"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatCountdownMs,
  getDecayStateFromStartTime,
} from "@/src/lib/scholarshipUtils";

export interface ScholarshipTimerState {
  ready: boolean;
  currentTierPercent: number;
  nextTierPercent: number;
  remainingMs: number;
  formatted: string;
}

/**
 * Live countdown until the current decay tier drops.
 */
export function useScholarshipDecayTimer(
  scholarshipStartTime: string | null | undefined,
): ScholarshipTimerState {
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return useMemo(() => {
    if (!scholarshipStartTime || nowMs == null) {
      return {
        ready: false,
        currentTierPercent: 60,
        nextTierPercent: 0,
        remainingMs: 0,
        formatted: "--:--:--",
      };
    }

    const timer = getDecayStateFromStartTime(scholarshipStartTime, nowMs);
    return {
      ready: true,
      ...timer,
      formatted: formatCountdownMs(timer.remainingMs),
    };
  }, [scholarshipStartTime, nowMs]);
}

/** @deprecated Use useScholarshipDecayTimer */
export function useScholarshipTimer(createdAt: string | null | undefined): ScholarshipTimerState {
  return useScholarshipDecayTimer(createdAt);
}

/**
 * Countdown for the 48-hour claim checkout window.
 */
export function useClaimExpiryTimer(claimRemainingMs: number): {
  ready: boolean;
  formatted: string;
} {
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [anchorMs, setAnchorMs] = useState<number | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
    setAnchorMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [claimRemainingMs]);

  return useMemo(() => {
    if (nowMs == null || anchorMs == null) {
      return { ready: false, formatted: "--:--:--" };
    }
    const elapsed = nowMs - anchorMs;
    const left = Math.max(0, claimRemainingMs - elapsed);
    return { ready: true, formatted: formatCountdownMs(left) };
  }, [nowMs, anchorMs, claimRemainingMs]);
}

/** @deprecated Use useClaimExpiryTimer */
export function useOfferExpiryTimer(remainingMs: number): {
  ready: boolean;
  formatted: string;
} {
  return useClaimExpiryTimer(remainingMs);
}
