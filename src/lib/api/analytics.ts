import apiClient from "@/src/lib/api-client";
import {
  detectClientMeta,
  getOrCreateVisitorId,
} from "@/src/lib/analytics-visitor";

export type FunnelEventName =
  | "page_view"
  | "demo_start"
  | "demo_step"
  | "demo_complete"
  | "demo_signup_click"
  | "demo_skip"
  | "demo_exit";

export async function trackFunnelEvent(input: {
  event: FunnelEventName;
  path?: string;
  demoSessionId?: string | null;
  step?: number | null;
  screen?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  if (typeof window === "undefined") return;
  const meta = detectClientMeta();
  try {
    await apiClient.post("/analytics/event", {
      visitorId: getOrCreateVisitorId(),
      event: input.event,
      path: input.path ?? window.location.pathname,
      referrer: document.referrer || null,
      demoSessionId: input.demoSessionId ?? null,
      step: input.step ?? null,
      screen: input.screen ?? null,
      deviceType: meta.deviceType,
      browser: meta.browser,
      metadata: input.metadata ?? null,
    });
  } catch {
    // Fire-and-forget: never block UX on analytics.
  }
}

export function trackFunnelEventBeacon(input: {
  event: FunnelEventName;
  path?: string;
  demoSessionId?: string | null;
  step?: number | null;
  screen?: string | null;
}): void {
  if (typeof window === "undefined") return;
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
  if (!base) return;
  const meta = detectClientMeta();
  const body = JSON.stringify({
    visitorId: getOrCreateVisitorId(),
    event: input.event,
    path: input.path ?? window.location.pathname,
    referrer: document.referrer || null,
    demoSessionId: input.demoSessionId ?? null,
    step: input.step ?? null,
    screen: input.screen ?? null,
    deviceType: meta.deviceType,
    browser: meta.browser,
  });
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(`${base}/analytics/event`, blob);
      return;
    }
  } catch {
    // fall through
  }
  void trackFunnelEvent(input);
}
