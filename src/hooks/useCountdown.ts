"use client";

import { useEffect, useState } from "react";

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  expired: boolean;
}

function compute(target: number): CountdownParts {
  const diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  return { days, hours, minutes, seconds, totalSeconds: diff, expired: diff <= 0 };
}

/**
 * Ticks every second until the ISO deadline.
 * Returns stable expired state after the window closes.
 */
export function useCountdown(deadlineIso: string | null | undefined): CountdownParts {
  const target = deadlineIso ? new Date(deadlineIso).getTime() : null;
  const [parts, setParts] = useState<CountdownParts>(() =>
    target ? compute(target) : { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, expired: true },
  );

  useEffect(() => {
    if (!target) return;
    setParts(compute(target));
    const id = window.setInterval(() => {
      const next = compute(target);
      setParts(next);
      if (next.expired) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  return parts;
}
