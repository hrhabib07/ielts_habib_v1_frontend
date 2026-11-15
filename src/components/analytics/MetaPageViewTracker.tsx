"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  isMetaPixelConfigured,
  trackPageView,
  trackViewContentPricing,
} from "@/src/lib/meta-pixel";

/**
 * PageView on every route change. ViewContent once when /pricing loads.
 * Does not fire PageView from the base snippet (SPA-safe).
 */
export function MetaPageViewTracker() {
  const pathname = usePathname() ?? "/";
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!isMetaPixelConfigured()) return;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    trackPageView();

    if (pathname === "/pricing") {
      trackViewContentPricing();
    }
  }, [pathname]);

  return null;
}
