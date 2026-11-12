"use client";

import { RotateCcw } from "lucide-react";

/**
 * On with `npm run dev`. A local production build (`npm run build && npm run start`) can opt in with
 * NEXT_PUBLIC_GAMLISH_DEV_TOOLS=1 in `.env.local`; never set it on the live deployment.
 */
export const IS_DEV =
  process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_GAMLISH_DEV_TOOLS === "1";

/** Every Gamlish key this browser keeps: guest wins, one-time prompts, cached mission state, settings. */
function clearGamlishStorage(): void {
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith("gamlish-")) window.localStorage.removeItem(key);
    }
    for (const key of Object.keys(window.sessionStorage)) {
      if (key.startsWith("gamlish-")) window.sessionStorage.removeItem(key);
    }
  } catch {
    return;
  }
}

/** Development only: wipe this browser's Gamlish progress and start /play from the welcome screen. */
export function DevResetButton() {
  if (!IS_DEV) return null;
  return (
    <button
      type="button"
      onClick={() => {
        clearGamlishStorage();
        window.location.assign("/play");
      }}
      className="fixed left-1.5 top-1/2 z-[60] flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-rose-600 text-white opacity-80 shadow-lg ring-2 ring-white transition hover:scale-105 hover:opacity-100 active:scale-95"
      title="Development only: clears guest progress and prompts saved in this browser"
      aria-label="Dev: reset"
    >
      <RotateCcw className="size-4" aria-hidden />
    </button>
  );
}
