"use client";

import { useEffect, useState } from "react";
import { getDemoStats } from "@/src/lib/api/demo";
import { localizeDigits } from "@/src/lib/ui-locale";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";

export function GuestDemoCounter({ className }: { className?: string }) {
  const { copy, locale } = useGuestLandingLocale();
  const [completions, setCompletions] = useState<number | null>(null);

  useEffect(() => {
    getDemoStats()
      .then((s) => setCompletions(s.completions))
      .catch(() => setCompletions(null));
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
