"use client";

import { Crown, Star } from "lucide-react";
import {
  FOUNDING_MEMBER_TOOLTIP,
} from "@/src/lib/foundingMember";
import { cn } from "@/lib/utils";

type FoundingMemberBadgeSize = "sm" | "md" | "lg";

const SIZE_STYLES: Record<
  FoundingMemberBadgeSize,
  { wrap: string; icon: string; label: string }
> = {
  sm: {
    wrap: "gap-1 px-2 py-0.5 text-[9px] tracking-[0.14em]",
    icon: "h-3 w-3",
    label: "FOUNDING MEMBER",
  },
  md: {
    wrap: "gap-1.5 px-2.5 py-1 text-[10px] tracking-[0.16em]",
    icon: "h-3.5 w-3.5",
    label: "FOUNDING MEMBER",
  },
  lg: {
    wrap: "gap-2 px-4 py-1.5 text-xs tracking-[0.18em]",
    icon: "h-4 w-4",
    label: "EARLY ADOPTER · FOUNDING MEMBER",
  },
};

export function FoundingMemberBadge(props: {
  size?: FoundingMemberBadgeSize;
  className?: string;
  showTooltip?: boolean;
  /** Shorter label for tight nav slots */
  compact?: boolean;
  /** Tooltip opens below the badge (default) or above */
  tooltipPlacement?: "top" | "bottom";
}) {
  const {
    size = "md",
    className,
    showTooltip = true,
    compact = false,
    tooltipPlacement = "bottom",
  } = props;
  const styles = SIZE_STYLES[size];
  const label = compact ? "FOUNDER" : styles.label;

  return (
    <span className={cn("group relative inline-flex max-w-full", className)}>
      <span
        className={cn(
          "founding-member-badge relative inline-flex items-center rounded-full font-bold text-amber-950 shadow-[0_0_20px_-4px_rgba(251,191,36,0.65)]",
          "bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500",
          "ring-1 ring-amber-300/80 ring-inset",
          "transition-transform duration-300 ease-out hover:scale-[1.04] active:scale-[0.98]",
          "dark:from-amber-400 dark:via-yellow-400 dark:to-amber-600 dark:text-amber-950",
          styles.wrap,
        )}
        title={showTooltip ? undefined : FOUNDING_MEMBER_TOOLTIP}
        aria-label={FOUNDING_MEMBER_TOOLTIP}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-white/40 via-transparent to-white/25 opacity-60"
          aria-hidden
        />
        {size === "lg" ? (
          <Crown className={cn(styles.icon, "relative shrink-0 drop-shadow-sm")} aria-hidden />
        ) : (
          <Star
            className={cn(styles.icon, "relative shrink-0 fill-amber-700/30 drop-shadow-sm")}
            aria-hidden
          />
        )}
        <span className="relative truncate">{label}</span>
      </span>

      {showTooltip ? (
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none absolute left-1/2 z-[100] w-64 -translate-x-1/2",
            tooltipPlacement === "bottom"
              ? "top-[calc(100%+0.5rem)] -translate-y-1 group-hover:translate-y-0 group-focus-within:translate-y-0"
              : "bottom-[calc(100%+0.5rem)] translate-y-1 group-hover:translate-y-0 group-focus-within:translate-y-0",
            "rounded-xl border border-amber-200/80 bg-card px-3 py-2.5 text-left text-[11px] font-normal leading-relaxed text-muted-foreground shadow-xl",
            "opacity-0 transition-all duration-200 group-hover:opacity-100 group-focus-within:opacity-100",
          )}
        >
          {FOUNDING_MEMBER_TOOLTIP}
        </span>
      ) : null}
    </span>
  );
}
