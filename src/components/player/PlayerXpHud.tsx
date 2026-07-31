"use client";

import { useEffect, useState } from "react";
import { Flag, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getMyPlayerProfile,
  type MyPlayerProfile,
} from "@/src/lib/api/player";
import { GAMLISH_XP_EVENT, GAMLISH_XP_REFRESH } from "@/src/lib/xp-events";

/**
 * Minimal sticky XP strip  -  one clean row, no clutter.
 * `variant="inline"` drops the bar chrome so it can sit inside another header.
 * Pass `missionNumber` on stage screens to show the mission badge instead of streak.
 */
export function PlayerXpHud({
  className,
  variant = "bar",
  missionNumber,
  missionLabel = "Mission",
}: {
  className?: string;
  variant?: "bar" | "inline";
  /** Current mission number (e.g. 6) · replaces streak on stage screens. */
  missionNumber?: number;
  /** Localized short label, e.g. "Mission" / "মিশন". */
  missionLabel?: string;
}) {
  const [profile, setProfile] = useState<MyPlayerProfile | null>(null);
  const [xpPulse, setXpPulse] = useState(false);

  const load = () => {
    getMyPlayerProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const onGain = (e: Event) => {
      const detail = (e as CustomEvent<{ amount: number; source: "answer" | "stage" }>)
        .detail;
      if (!detail?.amount || detail.amount <= 0) return;
      // Only stage XP is persisted  -  answer bursts are dopamine-only.
      if (detail.source === "stage") {
        setProfile((p) => (p ? { ...p, totalXp: p.totalXp + detail.amount } : p));
      }
      setXpPulse(true);
      window.setTimeout(() => setXpPulse(false), 600);
    };
    const onRefresh = () => load();
    window.addEventListener(GAMLISH_XP_EVENT, onGain);
    window.addEventListener(GAMLISH_XP_REFRESH, onRefresh);
    return () => {
      window.removeEventListener(GAMLISH_XP_EVENT, onGain);
      window.removeEventListener(GAMLISH_XP_REFRESH, onRefresh);
    };
  }, []);

  if (variant === "inline") {
    const missionPad =
      missionNumber != null
        ? String(missionNumber).padStart(2, "0")
        : null;

    return (
      <div className={cn("flex shrink-0 items-center gap-1.5", className)}>
        {missionPad != null ? (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2.5 py-1 text-xs font-black tabular-nums text-sky-800 shadow-sm shadow-sky-500/10 dark:text-sky-200"
            title={`${missionLabel} ${missionPad}`}
          >
            <Flag className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span className="tracking-tight">
              <span className="mr-0.5 text-[10px] font-bold uppercase tracking-wide opacity-80">
                {missionLabel}
              </span>
              {missionPad}
            </span>
          </span>
        ) : null}
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-black tabular-nums text-amber-700 transition-transform dark:text-amber-300",
            xpPulse && "scale-110",
          )}
        >
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          {profile ? profile.totalXp.toLocaleString("en-US") : "-"}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "sticky top-0 z-30 border-b border-border/40 bg-background/92 px-4 py-2 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 sm:max-w-2xl">
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-muted-foreground">
            Lv <span className="tabular-nums text-foreground">{profile?.level ?? "-"}</span>
          </span>
          <span className="h-3 w-px bg-border" aria-hidden />
          <span
            className={cn(
              "inline-flex items-center gap-1 font-black tabular-nums text-foreground transition-transform",
              xpPulse && "scale-110 text-amber-600 dark:text-amber-400",
            )}
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            {profile ? profile.totalXp.toLocaleString("en-US") : "-"}
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              XP
            </span>
          </span>
          <span className="h-3 w-px bg-border" aria-hidden />
          <span className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums text-foreground">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            {profile?.streakCurrent ?? 0}d
          </span>
        </div>
        {profile ? (
          <span className="text-[11px] text-muted-foreground">
            {profile.missionsCompleted} missions
          </span>
        ) : (
          <span className="h-3 w-16 animate-pulse rounded bg-muted" />
        )}
      </div>
    </div>
  );
}
