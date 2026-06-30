"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** 0-based global mission index for hero mockup animation (M03 → M17). */
export const JOURNEY_ANIM_START_MISSION = 2;
export const JOURNEY_ANIM_END_MISSION = 16;
const JOURNEY_CYCLE_MS = 24_000;
const JOURNEY_PAUSE_MS = 2_800;

/** Missions per camp: 5 + 5 + 5 + 6 = 21 total. */
export const ZONE_MISSION_COUNTS = [5, 5, 5, 6] as const;
export const ZONE_GLOBAL_STARTS = [0, 5, 10, 15] as const;

export function readinessFromActiveMission(activeGlobal: number): number {
  const t =
    (activeGlobal - JOURNEY_ANIM_START_MISSION) /
    (JOURNEY_ANIM_END_MISSION - JOURNEY_ANIM_START_MISSION);
  const clamped = Math.min(1, Math.max(0, t));
  return Math.round(68 + clamped * 24);
}

export interface ZoneJourneyState {
  readonly locked: boolean;
  readonly done: number;
  readonly active: number;
}

export function zoneStateForActiveLevel(
  zoneIndex: number,
  activeGlobal: number,
): ZoneJourneyState {
  const start = ZONE_GLOBAL_STARTS[zoneIndex] ?? 0;
  const count = ZONE_MISSION_COUNTS[zoneIndex] ?? 5;

  if (zoneIndex > 0 && activeGlobal < start) {
    return { locked: true, done: 0, active: -1 };
  }

  if (activeGlobal >= start + count) {
    return { locked: false, done: count, active: -1 };
  }

  if (activeGlobal < start) {
    return { locked: zoneIndex > 0, done: 0, active: -1 };
  }

  const localActive = activeGlobal - start;
  return { locked: false, done: localActive, active: localActive };
}

/** Looped ease-in-out journey from M03 → M17 for the hero mockup. */
export function useLandingJourneyProgress() {
  const reduceMotion = useReducedMotion();
  const [activeLevel, setActiveLevel] = useState(JOURNEY_ANIM_START_MISSION);
  const [readinessPct, setReadinessPct] = useState(() =>
    readinessFromActiveMission(JOURNEY_ANIM_START_MISSION),
  );

  useEffect(() => {
    if (reduceMotion) {
      setActiveLevel(JOURNEY_ANIM_END_MISSION);
      setReadinessPct(readinessFromActiveMission(JOURNEY_ANIM_END_MISSION));
      return;
    }

    let raf = 0;
    let cycleStart = performance.now();

    const tick = (now: number) => {
      const elapsed = now - cycleStart;
      const total = JOURNEY_CYCLE_MS + JOURNEY_PAUSE_MS;

      if (elapsed >= total) {
        cycleStart = now;
        raf = requestAnimationFrame(tick);
        return;
      }

      if (elapsed > JOURNEY_CYCLE_MS) {
        setActiveLevel(JOURNEY_ANIM_END_MISSION);
        setReadinessPct(readinessFromActiveMission(JOURNEY_ANIM_END_MISSION));
        raf = requestAnimationFrame(tick);
        return;
      }

      const t = elapsed / JOURNEY_CYCLE_MS;
      const eased = 0.5 - 0.5 * Math.cos(Math.PI * t);
      const mission =
        JOURNEY_ANIM_START_MISSION +
        eased * (JOURNEY_ANIM_END_MISSION - JOURNEY_ANIM_START_MISSION);
      const rounded = Math.round(mission);
      setActiveLevel(rounded);
      setReadinessPct(readinessFromActiveMission(rounded));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  return { activeLevel, readinessPct };
}
