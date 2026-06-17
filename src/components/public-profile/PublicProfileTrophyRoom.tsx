"use client";

import { Award, CheckCircle2, Trophy, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { PublicLevelZoneItem, PublicScholarshipCard } from "@/src/lib/api/types";
import { READING_PATH_ZONES } from "@/src/lib/readingPathZones";
import { cn } from "@/lib/utils";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

interface PublicProfileTrophyRoomProps {
  scholarship?: PublicScholarshipCard;
  levelZones?: PublicLevelZoneItem[];
}

export function PublicProfileTrophyRoom({
  scholarship,
  levelZones = [],
}: PublicProfileTrophyRoomProps) {
  const zonesWithLevels = READING_PATH_ZONES.map((zone) => ({
    zone,
    levels: levelZones.filter((l) => zone.levelOrders.includes(l.levelOrder)),
  }));

  return (
    <div className="space-y-8">
      {scholarship ? (
        <Card className="overflow-hidden border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.08] via-card to-violet-500/[0.06] p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
                <Award className="h-7 w-7" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800 dark:text-amber-400">
                  Merit scholarship
                </p>
                <h2 className="mt-1 text-xl font-bold text-foreground md:text-2xl">
                  {scholarship.meritPercent}% Merit-Based Scholarship
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Unlocks from Level 1 completion speed. faster finishers earn up to{" "}
                  {scholarship.meritPercent}% off premium access.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-left">
              {scholarship.level1CompletedAt ? (
                <>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Unlocked
                  </p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
                    {scholarship.unlockedDiscountPercent}% earned
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Level 1 passed · {formatDate(scholarship.level1CompletedAt)}
                  </p>
                  {scholarship.isOfferActive && scholarship.scholarshipExpiryDate ? (
                    <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      Offer active until {formatDate(scholarship.scholarshipExpiryDate)}
                    </p>
                  ) : scholarship.unlockedDiscountPercent > 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground">Offer expired</p>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">In progress</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Complete Level 1 to unlock merit tiers.
                  </p>
                </>
              )}
            </div>
          </div>
        </Card>
      ) : null}

      <div>
        <div className="mb-6 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Completion zones
          </h2>
        </div>

        <div className="space-y-8">
          {zonesWithLevels.map(({ zone, levels }) =>
            levels.length > 0 ? (
              <div key={zone.id}>
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    {zone.zoneLabel} · {zone.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{zone.subtitle}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {levels.map((level) => (
                    <LevelStatusCard key={level.levelOrder} level={level} />
                  ))}
                </div>
              </div>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}

function LevelStatusCard({ level }: { level: PublicLevelZoneItem }) {
  return (
    <div
      className={cn(
        "relative rounded-xl border px-4 py-3 transition-shadow",
        level.isPassed &&
          "border-emerald-500/35 bg-emerald-500/[0.08] shadow-sm shadow-emerald-500/10",
        level.isFailed &&
          "border-red-500/40 bg-red-500/[0.08] shadow-sm shadow-red-500/10",
        !level.isPassed &&
          !level.isFailed &&
          "border-border/60 bg-muted/20",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Level {level.levelNumber}
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
            {level.title}
          </p>
        </div>
        {level.isPassed ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        ) : level.isFailed ? (
          <XCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
        ) : null}
      </div>
      <p
        className={cn(
          "mt-2 text-[11px] font-semibold uppercase tracking-wide",
          level.isPassed && "text-emerald-700 dark:text-emerald-400",
          level.isFailed && "text-red-700 dark:text-red-400",
          !level.isPassed && !level.isFailed && "text-muted-foreground",
        )}
      >
        {level.isPassed ? "Passed" : level.isFailed ? "Failed" : level.passStatus.replace(/_/g, " ")}
      </p>
    </div>
  );
}
