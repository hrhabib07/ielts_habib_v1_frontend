"use client";

import { PaidLearnersProofChip } from "@/src/components/pricing/PaidLearnersProofChip";
import type { UiLocale } from "@/src/lib/ui-locale";
import { cn } from "@/lib/utils";

type Props = {
  locale: "bn" | "en";
  className?: string;
  /** Ignored. Every page uses the same 40+ paid line. */
  line?: (countLabel: string) => string;
};

/**
 * Demo save social proof. Same 40+ paid chip as home, pricing, and landing.
 */
export function DemoJoinedSocialProof({ locale, className }: Props) {
  return (
    <PaidLearnersProofChip
      locale={locale}
      className={cn("mt-3 w-full justify-center", className)}
    />
  );
}
