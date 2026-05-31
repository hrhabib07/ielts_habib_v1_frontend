"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GUEST_LANDING_COPY,
  GUEST_LANDING_LOCALE_STORAGE_KEY,
  type GuestLandingCopy,
  type GuestLandingLocale,
} from "@/src/lib/guest-landing-copy";

export const GUEST_LANDING_LOCALE_CHANGE_EVENT = "gamlish-guest-landing-locale-change";

function readStoredLocale(): GuestLandingLocale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GUEST_LANDING_LOCALE_STORAGE_KEY);
    return raw === "bn" || raw === "en" ? raw : null;
  } catch {
    return null;
  }
}

export function useGuestLandingLocaleState() {
  const [locale, setLocaleState] = useState<GuestLandingLocale>("en");

  useEffect(() => {
    const stored = readStoredLocale();
    if (stored) setLocaleState(stored);

    const onLocaleChange = (event: Event) => {
      const detail = (event as CustomEvent<GuestLandingLocale>).detail;
      if (detail === "en" || detail === "bn") setLocaleState(detail);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== GUEST_LANDING_LOCALE_STORAGE_KEY) return;
      if (event.newValue === "en" || event.newValue === "bn") {
        setLocaleState(event.newValue);
      }
    };

    window.addEventListener(GUEST_LANDING_LOCALE_CHANGE_EVENT, onLocaleChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(GUEST_LANDING_LOCALE_CHANGE_EVENT, onLocaleChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setLocale = useCallback((next: GuestLandingLocale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(GUEST_LANDING_LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(
      new CustomEvent(GUEST_LANDING_LOCALE_CHANGE_EVENT, { detail: next }),
    );
  }, []);

  const copy = useMemo(() => GUEST_LANDING_COPY[locale], [locale]);

  return { locale, copy, setLocale };
}

export type { GuestLandingCopy, GuestLandingLocale };
