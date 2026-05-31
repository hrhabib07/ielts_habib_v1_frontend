"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export const JOURNEY_ANIM_START_LEVEL = 3;
export const JOURNEY_ANIM_END_LEVEL = 17;
const JOURNEY_CYCLE_MS = 24_000;
const JOURNEY_PAUSE_MS = 2_800;

export const ZONE_LEVEL_COUNTS = [7, 7, 7] as const;
export const ZONE_GLOBAL_STARTS = [0, 7, 14] as const;

export function readinessFromActiveLevel(activeGlobal: number): number {
  const t =
    (activeGlobal - JOURNEY_ANIM_START_LEVEL) /
    (JOURNEY_ANIM_END_LEVEL - JOURNEY_ANIM_START_LEVEL);
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
  const count = ZONE_LEVEL_COUNTS[zoneIndex] ?? 7;

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

/** Looped ease-in-out journey from L3 → L17 for the hero mockup. */
export function useLandingJourneyProgress() {
  const reduceMotion = useReducedMotion();
  const [activeLevel, setActiveLevel] = useState(JOURNEY_ANIM_START_LEVEL);
  const [readinessPct, setReadinessPct] = useState(() =>
    readinessFromActiveLevel(JOURNEY_ANIM_START_LEVEL),
  );

  useEffect(() => {
    if (reduceMotion) {
      setActiveLevel(JOURNEY_ANIM_END_LEVEL);
      setReadinessPct(readinessFromActiveLevel(JOURNEY_ANIM_END_LEVEL));
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
        setActiveLevel(JOURNEY_ANIM_END_LEVEL);
        setReadinessPct(readinessFromActiveLevel(JOURNEY_ANIM_END_LEVEL));
        raf = requestAnimationFrame(tick);
        return;
      }

      const t = elapsed / JOURNEY_CYCLE_MS;
      const eased = 0.5 - 0.5 * Math.cos(Math.PI * t);
      const level =
        JOURNEY_ANIM_START_LEVEL +
        eased * (JOURNEY_ANIM_END_LEVEL - JOURNEY_ANIM_START_LEVEL);
      const rounded = Math.round(level);
      setActiveLevel(rounded);
      setReadinessPct(readinessFromActiveLevel(rounded));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  return { activeLevel, readinessPct };
}
