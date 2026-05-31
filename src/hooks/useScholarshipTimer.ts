"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatCountdownMs,
  getTierTimerFromCreatedAt,
} from "@/src/lib/scholarshipUtils";

export interface ScholarshipTimerState {
  /** False until client mount — avoids hydration mismatch. */
  ready: boolean;
  currentTierPercent: number;
  nextTierPercent: number;
  remainingMs: number;
  formatted: string;
}

/**
 * Real-time countdown until the next scholarship tier drops (trial phase).
 */
export function useScholarshipTimer(createdAt: string | null | undefined): ScholarshipTimerState {
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return useMemo(() => {
    if (!createdAt || nowMs == null) {
      return {
        ready: false,
        currentTierPercent: 60,
        nextTierPercent: 50,
        remainingMs: 0,
        formatted: "--:--:--",
      };
    }

    const timer = getTierTimerFromCreatedAt(createdAt, nowMs);
    return {
      ready: true,
      ...timer,
      formatted: formatCountdownMs(timer.remainingMs),
    };
  }, [createdAt, nowMs]);
}

/**
 * Countdown for the exploding offer expiry window.
 */
export function useOfferExpiryTimer(remainingMs: number): { ready: boolean; formatted: string } {
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [anchorMs, setAnchorMs] = useState<number | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
    setAnchorMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [remainingMs]);

  return useMemo(() => {
    if (nowMs == null || anchorMs == null) {
      return { ready: false, formatted: "--:--:--" };
    }
    const elapsed = nowMs - anchorMs;
    const left = Math.max(0, remainingMs - elapsed);
    return { ready: true, formatted: formatCountdownMs(left) };
  }, [nowMs, anchorMs, remainingMs]);
}
