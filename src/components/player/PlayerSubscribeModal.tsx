"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Crown, Sparkles, Swords, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlayerMapMission } from "@/src/lib/api/player";
import { usePlayerUiCopy } from "@/src/hooks/useLocalizedCopy";
import { brandSurfaces } from "@/src/lib/brand-theme";
import { cn } from "@/lib/utils";

function missionShortTitle(title: string): string {
  const match = title.match(/^Mission\s+\d+\s*(?:\[Inspection\])?\s*:\s*(.+)$/i);
  return match?.[1]?.trim() ?? title;
}

export function PlayerSubscribeModal({
  mission,
  onClose,
}: {
  mission: PlayerMapMission | null;
  onClose: () => void;
}) {
  const PLAYER_UI = usePlayerUiCopy();
  const open = mission !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mission) return null;

  const shortTitle = missionShortTitle(mission.title);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-bengali"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-subscribe-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
        aria-label="বন্ধ করো"
        onClick={onClose}
      />
      <div className={cn("relative w-full max-w-md overflow-hidden rounded-3xl border p-6 shadow-2xl shadow-primary/15 sm:p-8", brandSurfaces.pricingCard)}>
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
          aria-label="বন্ধ করো"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative space-y-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Crown className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              {PLAYER_UI.subscribeModalEyebrow}
            </p>
            <h2 id="player-subscribe-title" className="text-xl font-black leading-snug text-foreground sm:text-2xl">
              {PLAYER_UI.subscribeModalTitle(shortTitle)}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {PLAYER_UI.subscribeModalBody}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-left dark:border-primary/25 dark:bg-primary/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/15">
              <Swords className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs font-medium leading-relaxed text-foreground/90">
              {PLAYER_UI.subscribeModalPerk}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <Button asChild className={cn("h-11 rounded-2xl text-base font-bold", brandSurfaces.ctaButton)}>
              <Link href="/pricing?course=english-foundations" onClick={onClose}>
                <Sparkles className="mr-2 h-4 w-4" />
                {PLAYER_UI.subscribeModalCta}
              </Link>
            </Button>
            <Button type="button" variant="ghost" className="rounded-xl text-muted-foreground" onClick={onClose}>
              {PLAYER_UI.subscribeModalLater}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
