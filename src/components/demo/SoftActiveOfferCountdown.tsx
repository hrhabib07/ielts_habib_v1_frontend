"use client";

import { useEffect, useState } from "react";
import { PersonalOfferCountdown } from "@/src/components/pricing/PersonalOfferCountdown";
import { fetchPersonalOffer } from "@/src/lib/api/visitor-offer";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /**
   * Test/preview only · always show an active countdown for this many ms.
   * Live save screen omits this · expired visitors still see nothing.
   */
  forceDemoRemainingMs?: number;
};

/**
 * Soft personal-offer countdown for the demo save screen.
 * Renders nothing when the visitor window is expired (no "window closed" guilt),
 * unless forceDemoRemainingMs is set for QA previews.
 */
export function SoftActiveOfferCountdown({
  className,
  forceDemoRemainingMs,
}: Props) {
  const [show, setShow] = useState(Boolean(forceDemoRemainingMs));

  useEffect(() => {
    if (forceDemoRemainingMs != null && forceDemoRemainingMs > 0) {
      setShow(true);
      return;
    }

    let cancelled = false;
    void fetchPersonalOffer()
      .then((offer) => {
        if (cancelled) return;
        setShow(!offer.isExpired && offer.remainingMs > 0);
      })
      .catch(() => {
        if (!cancelled) setShow(false);
      });
    return () => {
      cancelled = true;
    };
  }, [forceDemoRemainingMs]);

  if (!show) return null;

  return (
    <PersonalOfferCountdown
      size="sm"
      className={cn("mt-3", className)}
      demoRemainingMs={
        forceDemoRemainingMs != null && forceDemoRemainingMs > 0
          ? forceDemoRemainingMs
          : undefined
      }
    />
  );
}
