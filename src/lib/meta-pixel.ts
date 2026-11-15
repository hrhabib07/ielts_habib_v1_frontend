/**
 * Meta Pixel (browser) helpers. No email/phone/name in event params.
 * event_id is always sent so Conversions API can dedupe later.
 */

export const META_PIXEL_ID =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || ""
    : "";

export const META_PURCHASE_VALUE_BDT = 1590;
export const META_PLAN_CONTENT_NAME = "90 days plan";

type FbqFn = (
  command: string,
  eventOrId: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string },
) => void;

type FbqQueue = FbqFn & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: (...args: unknown[]) => void;
  loaded?: boolean;
  version?: string;
};

type MetaWindow = Window & {
  fbq?: FbqQueue;
  _fbq?: FbqQueue;
};

function getFbq(): FbqQueue | null {
  if (typeof window === "undefined") return null;
  return (window as MetaWindow).fbq ?? null;
}

export function isMetaPixelConfigured(): boolean {
  return META_PIXEL_ID.length > 0;
}

export function newMetaEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `meta_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Fire a standard Meta event. Returns the event_id used (for DB / CAPI dedupe).
 */
export function track(
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string,
): string {
  const id = eventId?.trim() || newMetaEventId();
  if (!isMetaPixelConfigured()) return id;

  const fbq = getFbq();
  if (!fbq) return id;

  const safeParams = params ? { ...params } : undefined;
  fbq("track", eventName, safeParams, { eventID: id });
  return id;
}

export function trackPageView(eventId?: string): string {
  return track("PageView", undefined, eventId);
}

export function trackViewContentPricing(eventId?: string): string {
  return track(
    "ViewContent",
    { content_name: "Gamlish Pricing" },
    eventId,
  );
}

export function trackCompleteRegistration(eventId?: string): string {
  return track(
    "CompleteRegistration",
    { content_name: "Free Trial", status: true },
    eventId,
  );
}

export function trackInitiateCheckout(params?: {
  value?: number;
  contentName?: string;
  eventId?: string;
}): string {
  return track(
    "InitiateCheckout",
    {
      value: params?.value ?? META_PURCHASE_VALUE_BDT,
      currency: "BDT",
      content_name: params?.contentName ?? META_PLAN_CONTENT_NAME,
    },
    params?.eventId,
  );
}

export function trackPurchase(params: {
  orderId: string;
  value?: number;
  contentName?: string;
}): string {
  return track(
    "Purchase",
    {
      value: params.value ?? META_PURCHASE_VALUE_BDT,
      currency: "BDT",
      content_name: params.contentName ?? META_PLAN_CONTENT_NAME,
    },
    params.orderId,
  );
}
