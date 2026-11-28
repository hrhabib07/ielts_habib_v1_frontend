"use client";

import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onPlay: () => void;
  speaking: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
};

export function PlayButton({
  onPlay,
  speaking,
  disabled,
  label = "শুনুন",
  className,
}: Props) {
  return (
    <button
      type="button"
      onClick={onPlay}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "inline-flex h-14 min-w-[10rem] items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 text-base font-black text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
        speaking && "ring-2 ring-sky-300 ring-offset-2 ring-offset-background",
        className,
      )}
    >
      <Volume2 className={cn("h-5 w-5", speaking && "animate-pulse")} aria-hidden />
      {speaking ? "শুনছেন..." : label}
    </button>
  );
}
