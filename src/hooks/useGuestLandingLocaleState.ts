"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GUEST_LANDING_COPY,
  GUEST_LANDING_LOCALE_STORAGE_KEY,
  type GuestLandingCopy,
  type GuestLandingLocale,
} from "@/src/lib/guest-landing-copy";

export const GUEST_LANDING_LOCALE_CHANGE_EVENT = "gamlish-guest-landing-locale-change";

/** Bangladesh-first product: UI copy is always Bangla. */
const FIXED_LOCALE: GuestLandingLocale = "bn";

export function useGuestLandingLocaleState() {
  const [locale, setLocaleState] = useState<GuestLandingLocale>(FIXED_LOCALE);

  useEffect(() => {
    setLocaleState(FIXED_LOCALE);
    try {
      window.localStorage.setItem(GUEST_LANDING_LOCALE_STORAGE_KEY, FIXED_LOCALE);
    } catch {
      /* ignore */
    }
  }, []);

  const setLocale = useCallback((_next: GuestLandingLocale) => {
    setLocaleState(FIXED_LOCALE);
    try {
      window.localStorage.setItem(GUEST_LANDING_LOCALE_STORAGE_KEY, FIXED_LOCALE);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(
      new CustomEvent(GUEST_LANDING_LOCALE_CHANGE_EVENT, { detail: FIXED_LOCALE }),
    );
  }, []);

  const copy = useMemo(() => GUEST_LANDING_COPY[FIXED_LOCALE], []);

  return { locale, copy, setLocale };
}

export type { GuestLandingCopy, GuestLandingLocale };
