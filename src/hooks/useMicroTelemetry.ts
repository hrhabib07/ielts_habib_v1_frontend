"use client";

import { useEffect, useRef } from "react";
import {
  isTelemetryPathAllowed,
  logLanguageSwitch,
  startMicroTelemetry,
} from "@/src/lib/micro-telemetry";

/**
 * Optional hook if a page needs explicit control.
 * Prefer <MicroTelemetryBoot /> in the app shell for global coverage.
 */
export function useMicroTelemetry(enabled = true): void {
  const pathRef = useRef(
    typeof window !== "undefined" ? window.location.pathname : "/",
  );

  useEffect(() => {
    if (!enabled) return;
    const path =
      typeof window !== "undefined" ? window.location.pathname : pathRef.current;
    pathRef.current = path;
    if (!isTelemetryPathAllowed(path)) return;
    return startMicroTelemetry();
  }, [enabled]);
}

export function useLogLanguageSwitch(
  locale: string,
  enabled = true,
): void {
  const prev = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (prev.current == null) {
      prev.current = locale;
      return;
    }
    if (prev.current !== locale) {
      if (
        typeof window !== "undefined" &&
        isTelemetryPathAllowed(window.location.pathname)
      ) {
        logLanguageSwitch(prev.current, locale);
      }
      prev.current = locale;
    }
  }, [locale, enabled]);
}
