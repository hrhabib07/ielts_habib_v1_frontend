"use client";

import { AlertTriangle } from "lucide-react";
import { useFounderDashboardOfferCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

const DEFAULT_REMAINING = 15;

export function FounderUrgentAlertBar({
  remainingSeats,
  className,
}: {
  remainingSeats?: number;
  className?: string;
}) {
  const copy = useFounderDashboardOfferCopy();
  const { locale } = useUiLocale();
  const seats =
    typeof remainingSeats === "number" && remainingSeats >= 0
      ? remainingSeats
      : DEFAULT_REMAINING;

  return (
    <div
      className={cn(
        "sticky top-14 z-40 w-full border-b border-amber-600/30 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-amber-950 shadow-md sm:top-16",
        locale === "bn" && "font-bengali",
        className,
      )}
      lang={locale}
      role="status"
    >
      <div className="mx-auto flex max-w-3xl items-start gap-2 px-3 py-2.5 sm:items-center sm:px-4 sm:py-2.5">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0 text-amber-950 sm:mt-0"
          aria-hidden
        />
        <p className="text-[12px] font-bold leading-snug sm:text-[13px]">
          {copy.alert(seats)}
        </p>
      </div>
    </div>
  );
}
