import { ArrowRight, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { gap: "gap-1.5", icon: "size-3.5", badge: "size-6", arrow: "size-3.5" },
  md: { gap: "gap-2", icon: "size-4", badge: "size-8", arrow: "size-4" },
  lg: { gap: "gap-2.5", icon: "size-4 sm:size-[1.125rem]", badge: "size-8 sm:size-9", arrow: "size-4 sm:size-[1.05rem]" },
} as const;

/**
 * Shared start-play CTA marks: gamepad + label + soft → (go forward / play now).
 * Pass the localized `PLAY_A_LITTLE` / start-play string as `label`.
 */
export function PlayALittleCtaContent({
  label,
  size = "md",
  badge = true,
  className,
}: {
  label: string;
  size?: keyof typeof SIZES;
  /** Circular badge behind the gamepad (landing hero style). */
  badge?: boolean;
  className?: string;
}) {
  const s = SIZES[size];
  const gamepad = <Gamepad2 className={cn(s.icon, badge && "transition-transform duration-200 ease-out group-hover:rotate-[-8deg]")} aria-hidden />;

  return (
    <span className={cn("relative z-10 inline-flex items-center justify-center", s.gap, className)}>
      {badge ? (
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] ring-1 ring-white/40 transition-transform duration-200 ease-out group-hover:scale-105 group-[.is-pressing]:scale-95",
            s.badge,
          )}
        >
          {gamepad}
        </span>
      ) : (
        gamepad
      )}
      <span>{label}</span>
      <ArrowRight
        className={cn(s.arrow, "shrink-0 opacity-90 transition-transform duration-200 ease-out group-hover:translate-x-0.5")}
        strokeWidth={2.75}
        aria-hidden
      />
    </span>
  );
}
