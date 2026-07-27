"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackFunnelEvent } from "@/src/lib/api/analytics";
import { captureAndReadUtmAttribution } from "@/src/lib/funnel-attribution";

const TRACKED_PATHS = new Set(["/", "/demo", "/pricing", "/register", "/login"]);

/**
 * Records guest funnel page views for key conversion paths.
 * Safe no-op if the request fails.
 * Does not interact with GTM / Meta / dataLayer.
 */
export function FunnelPageTracker() {
  const pathname = usePathname() ?? "/";
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!TRACKED_PATHS.has(pathname)) return;
    if (last.current === pathname) return;
    last.current = pathname;
    captureAndReadUtmAttribution();
    void trackFunnelEvent({
      event: "page_view",
      path: pathname,
      screen:
        pathname === "/"
          ? "landing_home"
          : pathname === "/demo"
            ? "demo_enter"
            : pathname.replace(/^\//, "") || "home",
    });
  }, [pathname]);

  return null;
}
