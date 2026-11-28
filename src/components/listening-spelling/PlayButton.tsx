"use client";

import { Turtle, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onPlayNormal: () => void;
  onPlaySlow: () => void;
  speaking: "normal" | "slow" | null;
  disabled?: boolean;
  showReplayHint?: boolean;
};

function RoundListenButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        "flex size-14 items-center justify-center rounded-2xl border-2 border-b-4 transition-all active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-40 sm:size-16",
        active
          ? "border-accent bg-accent text-white"
          : "border-accent/25 border-b-accent/40 bg-white text-accent hover:bg-accent/5",
      )}
    >
      {children}
    </button>
  );
}

/** Gamlish-style Normal + Slow listen controls. */
export function PlayButton({
  onPlayNormal,
  onPlaySlow,
  speaking,
  disabled,
  showReplayHint,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <RoundListenButton
          label="শুনুন"
          active={speaking === "normal"}
          disabled={disabled}
          onClick={onPlayNormal}
        >
          <Volume2 className={cn("size-6", speaking === "normal" && "animate-pulse")} aria-hidden />
        </RoundListenButton>
        <RoundListenButton
          label="Slow"
          active={speaking === "slow"}
          disabled={disabled}
          onClick={onPlaySlow}
        >
          <Turtle className={cn("size-6", speaking === "slow" && "animate-pulse")} aria-hidden />
        </RoundListenButton>
      </div>
      <div className="flex gap-6 text-[11px] font-bold uppercase tracking-wide text-slate-500">
        <span>শুনুন</span>
        <span>Slow</span>
      </div>
      {showReplayHint ? (
        <p className="text-xs font-semibold text-slate-500">Practice · আবার শোনা যাবে</p>
      ) : null}
    </div>
  );
}
