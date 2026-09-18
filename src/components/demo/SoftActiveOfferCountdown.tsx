"use client";

import { PersonalOfferCountdown } from "@/src/components/pricing/PersonalOfferCountdown";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /**
   * QA preview only · /demo/save-preview. Live demo save never shows a timer.
   */
  forceDemoRemainingMs?: number;
};

/**
 * Saved countdown for demo save QA. Renders nothing on the live save screen.
 */
export function SoftActiveOfferCountdown({
  className,
  forceDemoRemainingMs,
}: Props) {
  if (forceDemoRemainingMs == null || forceDemoRemainingMs <= 0) {
    return null;
  }

  return (
    <PersonalOfferCountdown
      size="sm"
      className={cn("mt-3", className)}
      demoRemainingMs={forceDemoRemainingMs}
    />
  );
}
