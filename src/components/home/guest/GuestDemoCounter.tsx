"use client";

import { PaidLearnersProofChip } from "@/src/components/pricing/PaidLearnersProofChip";
import { cn } from "@/lib/utils";

export function GuestDemoCounter({ className }: { className?: string }) {
  return <PaidLearnersProofChip className={cn("align-middle", className)} />;
}
