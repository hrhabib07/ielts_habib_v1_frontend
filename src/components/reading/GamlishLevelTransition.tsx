"use client";

import { Map } from "lucide-react";
import { readingPathPremium } from "@/src/lib/readingPathPremium";
import { cn } from "@/lib/utils";

/** Minimal branded transition. no gray skeleton blocks. */
export function GamlishLevelTransition({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-[min(70vh,calc(100dvh-8rem))] flex-col items-center justify-center px-4",
        readingPathPremium.pageTexture,
        className,
      )}
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border/40 bg-card/90 p-8 text-center shadow-lg ring-1 ring-accent/10 backdrop-blur-sm">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/15 blur-2xl"
          aria-hidden
        />
        <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
          <Map className="h-7 w-7 animate-pulse" />
        </div>
        <p className="text-sm font-semibold tracking-tight text-foreground">
          Opening your level
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">Just a moment…</p>
        <div className="mx-auto mt-6 h-1 w-24 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-[shimmer_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-transparent via-accent to-transparent" />
        </div>
      </div>
    </div>
  );
}
