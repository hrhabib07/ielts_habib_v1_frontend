"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { shouldUseDocumentScroll } from "@/src/lib/siteScrollPolicy";

/** Ensures document scroll is enabled on normal pages; leaves exam/runner shells locked. */
export function DocumentScrollGuard() {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const hasStepParam = Boolean(searchParams.get("step"));

  useEffect(() => {
    if (!shouldUseDocumentScroll(pathname, hasStepParam)) return;

    delete document.documentElement.dataset.scrollLock;
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("height");
    document.documentElement.style.removeProperty("overflow");
    document.documentElement.style.removeProperty("height");
  }, [pathname, hasStepParam]);

  return null;
}
