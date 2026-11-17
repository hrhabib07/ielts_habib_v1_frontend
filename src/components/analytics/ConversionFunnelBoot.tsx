"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { captureConversionAttribution } from "@/src/lib/conversion-funnel-attribution";
import { captureMetaClickId } from "@/src/lib/meta-attribution";
import { logConversionFunnelEvent } from "@/src/lib/api/conversionFunnel";

/**
 * First-touch UTM cookie + Meta fbclid + one visit event per browser session.
 * pricing_viewed fires once when /pricing is opened (server dedupes per user).
 */
export function ConversionFunnelBoot() {
  const pathname = usePathname() ?? "/";
  const visitSent = useRef(false);
  const pricingSent = useRef(false);

  useEffect(() => {
    captureConversionAttribution();
    captureMetaClickId();
    if (!visitSent.current) {
      visitSent.current = true;
      void logConversionFunnelEvent({ eventName: "visit" });
    }
  }, []);

  useEffect(() => {
    if (pathname !== "/pricing") return;
    if (pricingSent.current) return;
    pricingSent.current = true;
    void logConversionFunnelEvent({ eventName: "pricing_viewed" });
  }, [pathname]);

  return null;
}
