"use client";

import { PaidLearnersProofChip } from "@/src/components/pricing/PaidLearnersProofChip";
import type { UiLocale } from "@/src/lib/ui-locale";
import { cn } from "@/lib/utils";

type Props = {
  locale: "bn" | "en";
  className?: string;
  /** Ignored. Every page uses the same live player-count chip. */
  line?: (countLabel: string) => string;
};

/**
 * Demo save social proof. Same live registered-player chip as home and register.
 */
export function DemoJoinedSocialProof({ locale, className }: Props) {
  return (
    <PaidLearnersProofChip
      locale={locale}
      className={cn("mt-3 w-full justify-center", className)}
    />
  );
}
