"use client";

import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

/** Exact calendar join date — always public, for early-adopter bragging rights. */
export function formatJoinedDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

export function JoinedDateBadge({
  joinedAt,
  className,
  size = "md",
}: {
  joinedAt: string | null | undefined;
  className?: string;
  size?: "sm" | "md";
}) {
  const label = formatJoinedDate(joinedAt);
  if (!label) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 font-medium text-foreground",
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        className,
      )}
      title={`Joined on ${label}`}
    >
      <CalendarDays
        className={cn(
          "shrink-0 text-primary",
          size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5",
        )}
      />
      Joined {label}
    </span>
  );
}
