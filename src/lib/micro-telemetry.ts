/**
 * Standalone native micro-telemetry (zero npm deps).
 * Isolated from GTM / Meta / dataLayer. Never runs on payment routes.
 */

import { getOrCreateVisitorId } from "@/src/lib/analytics-visitor";
import { detectClientMeta } from "@/src/lib/analytics-visitor";
import { readDemoSessionId } from "@/src/lib/demo-session";

export type MicroTelemetryEventName =
  | "element_viewed"
  | "rage_click"
  | "input_hesitation"
  | "language_switched"
  | "page_exit";

const VIEW_DWELL_MS = 1000;
const RAGE_WINDOW_MS = 1500;
const RAGE_CLICK_THRESHOLD = 3;

/** Segment-safe blacklist — does NOT match `/player` via substring "pay". */
const BLACKLIST_SEGMENT_RE =
  /(^|\/)(checkout|payment|pay|confirmation|confirm|order|bkash|verify)([/-]|$)/i;

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
}

export function isFbInAppBrowser(
  ua: string = typeof navigator !== "undefined" ? navigator.userAgent : "",
): boolean {
  return /FBAN|FBAV|FB_IAB/i.test(ua);
}

export function isTelemetryPathBlacklisted(pathname: string): boolean {
  const path = pathname.toLowerCase();
  return BLACKLIST_SEGMENT_RE.test(path);
}

/** Landing, demo, dashboard, player, auth entry — never payment. */
export function isTelemetryPathAllowed(pathname: string): boolean {
  if (isTelemetryPathBlacklisted(pathname)) return false;
  const p = pathname.toLowerCase();
  if (p === "/" || p === "") return true;
  return (
    p.startsWith("/demo") ||
    p.startsWith("/dashboard") ||
    p.startsWith("/player") ||
    p.startsWith("/register") ||
    p.startsWith("/login") ||
    p.startsWith("/pricing") ||
    p.startsWith("/founding-members") ||
    p.startsWith("/squad")
  );
}

function safePathname(): string {
  try {
    return window.location.pathname || "/";
  } catch {
    return "/";
  }
}

function buildMicroPayload(
  event: MicroTelemetryEventName,
  metadata: Record<string, unknown>,
) {
  const meta = detectClientMeta();
  return {
    visitorId: getOrCreateVisitorId(),
    event,
    path: safePathname(),
    referrer: typeof document !== "undefined" ? document.referrer || null : null,
    demoSessionId: readDemoSessionId(),
    step: null,
    screen: null,
    deviceType: meta.deviceType,
    browser: meta.browser,
    metadata: {
      is_fb_inapp: isFbInAppBrowser(),
      source: "micro_telemetry",
      timestamp: Date.now(),
      ...metadata,
    },
  };
}

function dispatchBeacon(payload: Record<string, unknown>): void {
  const base = apiBase();
  if (!base) return;
  const body = JSON.stringify(payload);
  const urlLog = `${base}/analytics/log`;
  const urlBeacon = `${base}/analytics/beacon`;

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(urlLog, blob)) return;
      if (navigator.sendBeacon(urlBeacon, blob)) return;
    }
  } catch {
    /* fall through */
  }

  try {
    void fetch(urlLog, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "omit",
    }).catch(() => undefined);
  } catch {
    /* never throw into the page */
  }
}

function dispatchAsync(payload: Record<string, unknown>): void {
  const base = apiBase();
  if (!base) return;
  try {
    void fetch(`${base}/analytics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: "omit",
    }).catch(() => undefined);
  } catch {
    /* ignore */
  }
}

export function logMicroEvent(
  event: MicroTelemetryEventName,
  metadata: Record<string, unknown> = {},
  opts?: { beacon?: boolean },
): void {
  if (typeof window === "undefined") return;
  if (!isTelemetryPathAllowed(safePathname())) return;
  try {
    const payload = buildMicroPayload(event, metadata);
    if (opts?.beacon) dispatchBeacon(payload);
    else dispatchAsync(payload);
  } catch {
    /* swallow */
  }
}

type Teardown = () => void;

function observeElementViews(): Teardown {
  if (typeof IntersectionObserver === "undefined") return () => undefined;

  const viewed = new Set<string>();
  const visibleSince = new WeakMap<Element, number>();
  const timers = new WeakMap<Element, number>();

  const flushView = (el: Element) => {
    const key =
      el.getAttribute("data-telemetry")?.trim() ||
      el.getAttribute("id")?.trim() ||
      "";
    if (!key || viewed.has(key)) return;
    viewed.add(key);
    logMicroEvent("element_viewed", {
      element: key,
      timestamp: Date.now(),
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio > 0) {
          if (!visibleSince.has(el)) {
            visibleSince.set(el, Date.now());
            const handle = window.setTimeout(() => {
              if (visibleSince.has(el)) flushView(el);
            }, VIEW_DWELL_MS);
            timers.set(el, handle);
          }
        } else {
          const handle = timers.get(el);
          if (handle != null) window.clearTimeout(handle);
          timers.delete(el);
          visibleSince.delete(el);
        }
      }
    },
    { threshold: [0.25, 0.5] },
  );

  const watch = (root: ParentNode = document) => {
    try {
      root.querySelectorAll("[data-telemetry]").forEach((el) => {
        observer.observe(el);
      });
    } catch {
      /* ignore */
    }
  };

  watch();
  const mo = new MutationObserver(() => watch());
  try {
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch {
    /* ignore */
  }

  return () => {
    try {
      mo.disconnect();
      observer.disconnect();
    } catch {
      /* ignore */
    }
  };
}

function observeRageClicks(): Teardown {
  const clickBuckets = new WeakMap<Element, number[]>();

  const onClick = (event: Event) => {
    try {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const cta = target.closest("[data-telemetry-cta='true']");
      if (!cta) return;
      const now = Date.now();
      const prev = (clickBuckets.get(cta) ?? []).filter(
        (t) => now - t <= RAGE_WINDOW_MS,
      );
      prev.push(now);
      clickBuckets.set(cta, prev);
      if (prev.length >= RAGE_CLICK_THRESHOLD) {
        clickBuckets.set(cta, []);
        const name =
          cta.getAttribute("data-telemetry") ||
          cta.getAttribute("id") ||
          cta.getAttribute("aria-label") ||
          "cta";
        logMicroEvent("rage_click", { target: name, clicks: prev.length });
      }
    } catch {
      /* ignore */
    }
  };

  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}

function observeInputHesitation(): Teardown {
  const focusedEmpty = new WeakMap<Element, boolean>();

  const isTrackedField = (el: Element): el is HTMLInputElement | HTMLTextAreaElement => {
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
      return false;
    }
    if (el.getAttribute("data-telemetry-field")) return true;
    const type = (el.getAttribute("type") || "text").toLowerCase();
    const name = (el.getAttribute("name") || el.id || "").toLowerCase();
    if (type === "email" || type === "tel") return true;
    return /email|phone|mobile|tel/.test(name);
  };

  const fieldName = (el: HTMLInputElement | HTMLTextAreaElement) =>
    el.getAttribute("data-telemetry-field") ||
    el.getAttribute("name") ||
    el.id ||
    el.type ||
    "field";

  const onFocus = (event: Event) => {
    try {
      const el = event.target;
      if (!(el instanceof Element) || !isTrackedField(el)) return;
      focusedEmpty.set(el, !el.value.trim());
    } catch {
      /* ignore */
    }
  };

  const onBlur = (event: Event) => {
    try {
      const el = event.target;
      if (!(el instanceof Element) || !isTrackedField(el)) return;
      const wasEmptyFocus = focusedEmpty.get(el) === true;
      focusedEmpty.delete(el);
      if (wasEmptyFocus && !el.value.trim()) {
        logMicroEvent("input_hesitation", { field: fieldName(el) });
      }
    } catch {
      /* ignore */
    }
  };

  const onInput = (event: Event) => {
    try {
      const el = event.target;
      if (!(el instanceof Element) || !isTrackedField(el)) return;
      if (el.value.trim()) focusedEmpty.set(el, false);
    } catch {
      /* ignore */
    }
  };

  document.addEventListener("focusin", onFocus, true);
  document.addEventListener("focusout", onBlur, true);
  document.addEventListener("input", onInput, true);
  return () => {
    document.removeEventListener("focusin", onFocus, true);
    document.removeEventListener("focusout", onBlur, true);
    document.removeEventListener("input", onInput, true);
  };
}

function observePageExit(pageEnteredAt: number): Teardown {
  let sent = false;

  const sendExit = () => {
    if (sent) return;
    if (!isTelemetryPathAllowed(safePathname())) return;
    sent = true;
    const dwell = Math.max(0, Math.round((Date.now() - pageEnteredAt) / 1000));
    logMicroEvent(
      "page_exit",
      {
        dwell_time_seconds: dwell,
        last_screen_before_leave: safePathname(),
        is_fb_inapp: isFbInAppBrowser(),
      },
      { beacon: true },
    );
  };

  const onVisibility = () => {
    if (document.visibilityState === "hidden") sendExit();
    else if (document.visibilityState === "visible") sent = false;
  };

  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", sendExit);
  return () => {
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", sendExit);
  };
}

let languageHooked = false;

/** Call from UiLocaleProvider when locale changes (allowed routes only). */
export function logLanguageSwitch(from: string, to: string): void {
  if (from === to) return;
  if (typeof window === "undefined") return;
  if (!isTelemetryPathAllowed(safePathname())) return;
  logMicroEvent("language_switched", {
    from,
    to,
    current_path: safePathname(),
  });
}

/**
 * Start all micro-trackers for the current path.
 * No-ops on blacklisted payment/checkout routes.
 */
export function startMicroTelemetry(): Teardown {
  if (typeof window === "undefined") return () => undefined;

  const path = safePathname();
  if (!isTelemetryPathAllowed(path)) {
    return () => undefined;
  }

  const pageEnteredAt = Date.now();
  const teardowns: Teardown[] = [];

  try {
    teardowns.push(observeElementViews());
  } catch {
    /* ignore */
  }
  try {
    teardowns.push(observeRageClicks());
  } catch {
    /* ignore */
  }
  try {
    teardowns.push(observeInputHesitation());
  } catch {
    /* ignore */
  }
  try {
    teardowns.push(observePageExit(pageEnteredAt));
  } catch {
    /* ignore */
  }

  languageHooked = true;

  return () => {
    languageHooked = false;
    for (const t of teardowns) {
      try {
        t();
      } catch {
        /* ignore */
      }
    }
  };
}

export function isMicroTelemetryLanguageHooked(): boolean {
  return languageHooked;
}
