"use client";

import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GUEST_HOME_SECTIONS_COPY } from "@/src/lib/guest-home-sections-copy";

export function useGuestHomeSectionsCopy() {
  const { locale } = useGuestLandingLocale();
  return GUEST_HOME_SECTIONS_COPY[locale];
}
