"use client";

import { GuestHeroMissionCardVisual } from "@/src/components/home/guest/GuestHeroMissionCardVisual";
import { GuestHeroTranslateCinema } from "@/src/components/home/guest/GuestHeroTranslateCinema";
import { USE_HERO_TRANSLATE_CINEMA } from "@/src/lib/platform-config";

/**
 * Right-side hero visual entry point.
 * Flip USE_HERO_TRANSLATE_CINEMA to false to restore the legacy mission card.
 */
export function GuestHeroMissionVisual({ className }: { className?: string }) {
  if (USE_HERO_TRANSLATE_CINEMA) {
    return <GuestHeroTranslateCinema className={className} />;
  }
  return <GuestHeroMissionCardVisual className={className} />;
}
