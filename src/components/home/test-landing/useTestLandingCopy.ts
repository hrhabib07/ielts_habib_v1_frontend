"use client";

import { useMemo } from "react";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { TEST_LANDING_COPY, type TestLandingCopy } from "@/src/lib/test-landing-copy";
import type { GuestLandingLocale } from "@/src/lib/guest-landing-copy";

export function useTestLandingCopy(): {
  locale: GuestLandingLocale;
  copy: TestLandingCopy;
} {
  const { locale } = useUiLocale();
  const copy = useMemo(() => TEST_LANDING_COPY[locale], [locale]);
  return { locale, copy };
}
