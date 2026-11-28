"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackFunnelEvent } from "@/src/lib/api/analytics";
import {
  detectAiReferral,
  persistAiReferral,
  readPersistedAiReferral,
} from "@/src/lib/ai-referral";
import { captureConversionAttribution } from "@/src/lib/conversion-funnel-attribution";

const SESSION_FLAG = "gamlish.ai_referral_visit_sent.v1";

/**
 * Detects ChatGPT / Claude / Gemini / Perplexity / Copilot visits
 * via utm_source or document.referrer, stores first touch, fires one funnel event per session.
 */
export function AiReferralTracker() {
  const pathname = usePathname() ?? "/";
  const sent = useRef(false);

  useEffect(() => {
    captureConversionAttribution();
    const hit = detectAiReferral() ?? readPersistedAiReferral();
    if (!hit?.isAi) return;
    persistAiReferral(hit);

    if (sent.current) return;
    try {
      if (typeof window !== "undefined" && window.sessionStorage.getItem(SESSION_FLAG)) {
        sent.current = true;
        return;
      }
    } catch {
      // ignore
    }

    sent.current = true;
    try {
      window.sessionStorage.setItem(SESSION_FLAG, "1");
    } catch {
      // ignore
    }

    void trackFunnelEvent({
      event: "ai_referral_visit",
      path: pathname,
      screen: "ai_referral",
      metadata: {
        ai_provider: hit.provider,
        ai_signal: hit.signal,
        ai_referrer_host: hit.referrerHost,
        ai_utm_source: hit.utmSource,
        traffic_source: "ai",
      },
    });
  }, [pathname]);

  return null;
}
