"use client";

import { useEffect, type RefObject } from "react";

function prefersFinePointer(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.matchMedia("(pointer: fine)").matches;
  } catch {
    return true;
  }
}

/**
 * Focus a typed-answer input when the question changes.
 * Desktop: always. Mobile soft: focus with preventScroll after a short settle delay
 * so the next question is type-ready without a hunt-click/tap.
 */
export function useTypedAnswerAutofocus(
  ref: RefObject<HTMLInputElement | null>,
  focusKey: string,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!enabled || !focusKey) return;

    const fine = prefersFinePointer();
    const delayMs = fine ? 40 : 90;

    const timer = window.setTimeout(() => {
      const el = ref.current;
      if (!el || el.disabled || el.readOnly) return;
      el.focus({ preventScroll: true });
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [ref, focusKey, enabled]);
}
