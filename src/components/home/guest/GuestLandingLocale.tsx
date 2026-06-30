"use client";

import { createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  useGuestLandingLocaleState,
  type GuestLandingCopy,
  type GuestLandingLocale,
} from "@/src/hooks/useGuestLandingLocaleState";

interface GuestLandingLocaleContextValue {
  locale: GuestLandingLocale;
  copy: GuestLandingCopy;
  setLocale: (locale: GuestLandingLocale) => void;
}

const GuestLandingLocaleContext = createContext<GuestLandingLocaleContextValue | null>(null);

export function GuestLandingLocaleProvider({ children }: { children: ReactNode }) {
  const state = useGuestLandingLocaleState();
  return (
    <GuestLandingLocaleContext.Provider value={state}>
      {children}
    </GuestLandingLocaleContext.Provider>
  );
}

export function useGuestLandingLocale() {
  const ctx = useContext(GuestLandingLocaleContext);
  if (!ctx) {
    throw new Error("useGuestLandingLocale must be used within GuestLandingLocaleProvider");
  }
  return ctx;
}

/** Compact EN/BN toggle — hidden; Bangladesh audience uses Bangla only. */
export function GuestLandingLanguageToggle(_props: { className?: string }) {
  return null;
}

export const guestGlassCardClass =
  "rounded-3xl border border-border/50 bg-card/90 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-border/40 dark:bg-card/75 dark:shadow-black/30";

export const guestIconTileClass =
  "flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/15 bg-accent/8 text-accent transition-colors group-hover:border-accent/30 group-hover:bg-accent/12 dark:border-accent/20 dark:bg-accent/12";

export const guestIconTileSmClass =
  "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/15 bg-accent/8 text-accent dark:border-accent/20 dark:bg-accent/12";
