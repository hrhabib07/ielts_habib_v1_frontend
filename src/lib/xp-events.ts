"use client";

/**
 * Lightweight XP / reward events so the HUD can update live
 * and floating bursts can fire from stages / correct answers.
 */

export const GAMLISH_XP_EVENT = "gamlish:xp-gain";
export const GAMLISH_XP_REFRESH = "gamlish:xp-refresh";

export function emitXpGain(amount: number, source: "answer" | "stage" = "stage") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(GAMLISH_XP_EVENT, { detail: { amount, source } }),
  );
}

export function emitXpRefresh() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(GAMLISH_XP_REFRESH));
}
