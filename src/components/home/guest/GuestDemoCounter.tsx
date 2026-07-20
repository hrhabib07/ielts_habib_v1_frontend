"use client";

import { useEffect, useState } from "react";
import { getDemoStats } from "@/src/lib/api/demo";
import { localizeDigits } from "@/src/lib/ui-locale";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";

export function GuestDemoCounter({ className }: { className?: string }) {
  const { copy, locale } = useGuestLandingLocale();
  const [completions, setCompletions] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      getDemoStats()
        .then((s) => {
          if (!cancelled) setCompletions(s.completions);
        })
        .catch(() => {
          if (!cancelled) setCompletions(null);
        });
    };

    const ric = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      }
    ).requestIdleCallback;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (typeof ric === "function") {
      idleId = ric(load, { timeout: 2000 });
    } else {
      timeoutId = setTimeout(load, 800);
    }

    return () => {
      cancelled = true;
      if (idleId != null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, []);

  const line =
    completions != null && completions > 0
      ? copy.socialProofLine(localizeDigits(completions, locale))
      : copy.socialProofFallback;

  return (
    <span className={className ?? "text-center text-sm text-muted-foreground"}>
      {line}
    </span>
  );
}
