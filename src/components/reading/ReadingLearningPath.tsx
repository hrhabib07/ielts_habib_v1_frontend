"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { useReadingPathState } from "@/src/hooks/useReadingPathState";
import { ReadingPathZoneCard } from "@/src/components/reading/ReadingPathZoneCard";
import { readingPathPremium } from "@/src/lib/readingPathPremium";
import { READING_PATH_ZONES } from "@/src/lib/readingPathZones";
import { readingLevelIndexFromOrder } from "@/src/lib/readingLevelOrder";
import { cn } from "@/lib/utils";

function ReadingPathJourneySkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6">
      <div className="mb-10 space-y-3">
        <div className="h-6 w-40 rounded-full bg-muted/70" />
        <div className="h-9 w-72 max-w-full rounded-lg bg-muted/50" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, z) => (
          <div key={z} className="rounded-2xl border border-border/30 bg-card p-5">
            <div className="mb-4 h-5 w-24 rounded bg-muted/60" />
            <div className="mb-2 h-7 w-40 rounded bg-muted/50" />
            <div className="mb-6 h-1.5 w-full rounded-full bg-muted/40" />
            <div className="space-y-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-muted/30" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReadingLearningPath() {
  const {
    levels,
    loading,
    currentLevelId,
    currentStepId,
    detailCache,
    curriculumDemoAccount,
    currentOrder,
    isLevelUnlocked,
    displayLevelNumber,
  } = useReadingPathState();

  const levelsByOrder = useMemo(() => {
    const map = new Map<number, (typeof levels)[0]>();
    for (const lv of levels) {
      const idx = readingLevelIndexFromOrder(lv.order);
      if (idx >= 0 && idx <= 20) map.set(idx, lv);
    }
    return map;
  }, [levels]);

  if (loading) {
    return (
      <div className="bg-background">
        <ReadingPathJourneySkeleton />
      </div>
    );
  }

  return (
    <div className="relative bg-background">
      <div
        className={cn("pointer-events-none absolute inset-0 -z-10 min-h-full", readingPathPremium.pageTexture)}
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:pb-16">
          <div className="mb-8 text-center lg:mb-10 lg:text-left animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/15 bg-card/90 px-3 py-1 ring-1 ring-accent/10">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className={readingPathPremium.microLabel}>Reading journey</span>
            </div>
            <h1 className={cn(readingPathPremium.heroTitle, "mt-3")}>
              Three zones. Twenty-one levels.
            </h1>
            <p className={cn(readingPathPremium.heroBody, "mx-auto mt-2 max-w-2xl lg:mx-0")}>
              Pick your level inside a zone to start learning. Details load when you open a level.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-stretch lg:gap-5 xl:gap-6">
            {READING_PATH_ZONES.map((zone, zoneIndex) => {
              const zoneLevels = zone.levelOrders
                .map((orderIdx) => levelsByOrder.get(orderIdx))
                .filter(Boolean) as typeof levels;
              const isFutureZone =
                zone.id === "intermediate"
                  ? currentOrder >= 0 && readingLevelIndexFromOrder(currentOrder) < 7
                  : zone.id === "advanced"
                    ? currentOrder >= 0 && readingLevelIndexFromOrder(currentOrder) < 14
                    : false;

              return (
                <ReadingPathZoneCard
                  key={zone.id}
                  zone={zone}
                  zoneIndex={zoneIndex}
                  levels={zoneLevels}
                  allLevels={levels}
                  currentLevelId={currentLevelId}
                  currentStepId={currentStepId}
                  currentOrder={currentOrder}
                  detailCache={detailCache}
                  curriculumDemoAccount={curriculumDemoAccount}
                  isFutureZone={isFutureZone}
                  displayLevelNumber={displayLevelNumber}
                  isLevelUnlocked={isLevelUnlocked}
                />
              );
            })}
          </div>
      </div>
    </div>
  );
}
