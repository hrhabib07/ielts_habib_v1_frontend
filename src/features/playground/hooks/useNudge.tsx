"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAnimate, useReducedMotion } from "framer-motion";

/** Seconds of no tapping before the options give a small bounce, so learners see where to tap. */
const FIRST_NUDGE_MS = 3500;
const NUDGE_EVERY_MS = 5000;
const STAGGER_S = 0.08;

const NudgeContext = createContext(0);

/** Counts nudges while the learner is idle on a question; resets on every new question or tap. */
export function NudgeProvider({ active, resetKey, children }: { active: boolean; resetKey: string | null; children: ReactNode }) {
  const [nudge, setNudge] = useState<{ key: string | null; tick: number }>({ key: null, tick: 0 });

  useEffect(() => {
    if (!active) return;
    let timer = window.setTimeout(function fire() {
      setNudge((current) => ({ key: resetKey, tick: current.key === resetKey ? current.tick + 1 : 1 }));
      timer = window.setTimeout(fire, NUDGE_EVERY_MS);
    }, FIRST_NUDGE_MS);
    return () => window.clearTimeout(timer);
  }, [active, resetKey]);

  const tick = active && nudge.key === resetKey ? nudge.tick : 0;
  return <NudgeContext.Provider value={tick}>{children}</NudgeContext.Provider>;
}

/** Attach the returned ref to a tappable option; it bounces on each nudge while `enabled`. */
export function useNudge<T extends Element>(enabled: boolean, index = 0) {
  const tick = useContext(NudgeContext);
  const reduceMotion = useReducedMotion();
  const [scope, animate] = useAnimate<T>();

  useEffect(() => {
    if (!tick || !enabled || reduceMotion || !scope.current) return;
    void animate(
      scope.current,
      { y: [0, -7, 0, -3, 0], rotate: [0, -2, 2, -1, 0] },
      { duration: 0.65, delay: index * STAGGER_S, ease: "easeOut" },
    );
  }, [tick, enabled, index, reduceMotion, animate, scope]);

  return scope;
}
