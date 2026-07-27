import apiClient from "@/src/lib/api-client";
import {
  detectClientMeta,
  getOrCreateVisitorId,
} from "@/src/lib/analytics-visitor";
import { buildFunnelAttributionMetadata } from "@/src/lib/funnel-attribution";
import { isFbInAppBrowser } from "@/src/lib/micro-telemetry";

export type FunnelEventName =
  | "page_view"
  | "demo_start"
  | "demo_step"
  | "demo_complete"
  | "demo_signup_click"
  | "clicked_google_save_button"
  | "oauth_success"
  | "demo_skip"
  | "demo_exit"
  | "element_viewed"
  | "rage_click"
  | "input_hesitation"
  | "language_switched"
  | "page_exit";

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
}

function buildPayload(input: {
  event: FunnelEventName;
  path?: string;
  demoSessionId?: string | null;
  step?: number | null;
  screen?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  const meta = detectClientMeta();
  const attribution = buildFunnelAttributionMetadata();
  return {
    visitorId: getOrCreateVisitorId(),
    event: input.event,
    path: input.path ?? (typeof window !== "undefined" ? window.location.pathname : "/"),
    referrer:
      typeof document !== "undefined" ? document.referrer || null : null,
    demoSessionId: input.demoSessionId ?? null,
    step: input.step ?? null,
    screen: input.screen ?? null,
    deviceType: meta.deviceType,
    browser: meta.browser,
    metadata: {
      ...attribution,
      is_fb_inapp: isFbInAppBrowser(),
      ...(input.metadata ?? {}),
    },
  };
}

export async function trackFunnelEvent(input: {
  event: FunnelEventName;
  path?: string;
  demoSessionId?: string | null;
  step?: number | null;
  screen?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await apiClient.post("/analytics/event", buildPayload(input));
  } catch {
    // Fire-and-forget: never block UX on analytics.
  }
}

/**
 * Reliable exit telemetry for mobile (FB in-app / Chrome).
 * Prefer sendBeacon → /analytics/beacon|/log; fall back to fetch keepalive.
 */
export function trackFunnelEventBeacon(input: {
  event: FunnelEventName;
  path?: string;
  demoSessionId?: string | null;
  step?: number | null;
  screen?: string | null;
  metadata?: Record<string, unknown> | null;
}): void {
  if (typeof window === "undefined") return;
  const base = apiBase();
  const payload = buildPayload(input);
  const body = JSON.stringify(payload);

  if (base) {
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        const ok =
          navigator.sendBeacon(`${base}/analytics/beacon`, blob) ||
          navigator.sendBeacon(`${base}/analytics/log`, blob);
        if (ok) return;
      }
    } catch {
      // fall through
    }

    try {
      void fetch(`${base}/analytics/beacon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
        credentials: "omit",
      }).catch(() => undefined);
      return;
    } catch {
      // fall through
    }
  }

  void trackFunnelEvent(input);
}
