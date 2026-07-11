"use client";

import { useMemo } from "react";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { GUEST_LANDING_COPY, type GuestLandingCopy } from "@/src/lib/guest-landing-copy";
import type { GuestLandingLocale } from "@/src/lib/guest-landing-copy";

export type { GuestLandingCopy, GuestLandingLocale };

/** Site-wide locale; guest landing copy follows the same Bn/En toggle. */
export function useGuestLandingLocaleState() {
  const { locale, setLocale } = useUiLocale();
  const copy = useMemo(() => GUEST_LANDING_COPY[locale], [locale]);
  return { locale, copy, setLocale };
}
