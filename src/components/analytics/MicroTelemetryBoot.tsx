"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  isTelemetryPathAllowed,
  startMicroTelemetry,
} from "@/src/lib/micro-telemetry";

/**
 * Boots native micro-telemetry on allowed routes only.
 * Hard-aborts on checkout / payment / bkash / verify paths.
 * Never touches GTM, fbq, gtag, or dataLayer.
 */
export function MicroTelemetryBoot() {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    if (!isTelemetryPathAllowed(pathname)) return;
    return startMicroTelemetry();
  }, [pathname]);

  return null;
}
