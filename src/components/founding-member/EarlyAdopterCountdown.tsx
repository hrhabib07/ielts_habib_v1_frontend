"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import {
  formatFoundingCountdown,
  isFoundingMemberWindowOpen,
  msUntilFoundingMemberCutoff,
} from "@/src/lib/foundingMember";
import { cn } from "@/lib/utils";

export function EarlyAdopterCountdown(props: {
  className?: string;
  showLink?: boolean;
}) {
  const { className, showLink = true } = props;
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      if (!isFoundingMemberWindowOpen()) {
        setRemainingMs(0);
        return;
      }
      setRemainingMs(msUntilFoundingMemberCutoff());
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (remainingMs === null || remainingMs <= 0) {
    return null;
  }

  const { days, hours, minutes } = formatFoundingCountdown(remainingMs);

  const inner = (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-2 rounded-xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-violet-500/10 px-3 py-2 text-xs text-foreground ring-1 ring-amber-500/10",
        className,
      )}
    >
      <Clock3 className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
      <span className="font-medium text-muted-foreground">
        Early Adopter badge closes in{" "}
        <span className="font-semibold tabular-nums text-amber-800 dark:text-amber-200">
          {days}d {hours}h {minutes}m
        </span>
      </span>
    </div>
  );

  if (!showLink) return inner;

  return (
    <Link href="/pricing" className="block transition-opacity hover:opacity-95">
      {inner}
    </Link>
  );
}
