"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Lock } from "lucide-react";
import { guestGlassCardClass, useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import {
  useLandingJourneyProgress,
  zoneStateForActiveLevel,
} from "@/src/hooks/useLandingJourneyProgress";

/** Mission labels per camp (21 missions across 4 camps). */
const ZONE_MISSIONS = [
  ["M01", "M02", "M03", "M04", "M05"],
  ["M06", "M07", "M08", "M09", "M10"],
  ["M11", "M12", "M13", "M14", "M15"],
  ["M16", "M17", "M18", "M19", "M20", "M21"],
] as const;

function AnimatedReadiness({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    setDisplay(value);
  }, [value]);

  return (
    <motion.span
      key={display}
      className="text-sm font-bold tabular-nums text-accent"
      initial={{ opacity: 0.6, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {display}%
    </motion.span>
  );
}

export function LandingPathMockup({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { copy } = useGuestLandingLocale();
  const reduceMotion = useReducedMotion();
  const { activeLevel, readinessPct } = useLandingJourneyProgress();

  return (
    <motion.div
      className={cn(
        "guest-journey-mockup relative mx-auto w-full max-w-4xl overflow-hidden",
        compact ? "p-3 sm:p-3.5" : "p-4 sm:p-5",
        guestGlassCardClass,
        className,
      )}
      aria-hidden
      initial={reduceMotion ? false : { opacity: 0.92 }}
      animate={{ opacity: 1 }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.06] via-transparent to-primary/[0.04] opacity-80"
        aria-hidden
      />
      <div className="guest-journey-shimmer pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden />

      <div
        className={cn(
          "relative flex items-center justify-between gap-2 border-b border-border/60",
          compact ? "mb-2 pb-2" : "mb-3 pb-3",
        )}
      >
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {copy.mockupJourneyTitle}
        </span>
      </div>

      <div
        className={cn(
          "relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
          compact ? "mt-2 gap-2" : "gap-3",
        )}
      >
        {copy.mockupZones.map((zone, zoneIndex) => {
          const missions = ZONE_MISSIONS[zoneIndex] ?? [];
          const { done, active, locked } = zoneStateForActiveLevel(zoneIndex, activeLevel);
          const barPct = missions.length > 0 ? (done / missions.length) * 100 : 0;

          return (
            <div
              key={zone.zoneLabel}
              className={cn(
                compact ? "p-2.5" : "p-3",
                "rounded-xl border border-border/60 bg-muted/30 transition-colors duration-500 dark:bg-muted/20",
                locked && "opacity-65",
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                  {zone.zoneLabel}
                </span>
                {locked ? (
                  <Lock className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {done}/{missions.length}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs font-semibold text-foreground">{zone.title}</p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-primary dark:from-accent dark:to-primary"
                  initial={false}
                  animate={{ width: `${barPct}%` }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <ul className="mt-2.5 flex flex-wrap gap-1">
                {missions.map((missionId, i) => {
                  const passed = i < done;
                  const current = i === active;
                  return (
                    <li
                      key={missionId}
                      className={cn(
                        "flex h-6 min-w-[1.75rem] items-center justify-center rounded-md px-1 text-[9px] font-bold tabular-nums transition-colors duration-300",
                        passed &&
                          "bg-success/15 text-success ring-1 ring-success/30 dark:bg-success/20",
                        current &&
                          "guest-journey-level-active bg-accent/20 text-accent ring-1 ring-accent/40",
                        !passed &&
                          !current &&
                          (locked
                            ? "bg-muted/50 text-muted-foreground/60"
                            : "bg-muted/80 text-muted-foreground"),
                      )}
                    >
                      {passed ? (
                        <motion.span
                          key={`check-${missionId}`}
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.25 }}
                        >
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </motion.span>
                      ) : (
                        missionId
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-lg border border-accent/20 bg-accent/10 px-3 py-1.5 dark:bg-accent/15",
          compact ? "mt-2" : "mt-3",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-medium text-foreground/90">
            {copy.mockupReadinessLabel}
          </span>
          <AnimatedReadiness value={readinessPct} />
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted/80">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent/80 to-accent"
            initial={false}
            animate={{ width: `${readinessPct}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </motion.div>
  );
}
