import { readStoredUiLocale, type UiLocale } from "@/src/lib/ui-locale";

export type TrafficSourceBucket = "fb_ads" | "organic" | "direct" | "campaign" | "other";

const UTM_STORAGE_KEY = "gamlish_utm_attribution";

export type UtmAttribution = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  trafficSource: TrafficSourceBucket;
};

function classifyTrafficSource(
  utmSource: string | null,
  referrer: string | null,
): TrafficSourceBucket {
  const src = (utmSource ?? "").toLowerCase();
  if (/facebook|fb|meta|instagram|ig/.test(src)) return "fb_ads";
  if (src) return "campaign";
  const ref = (referrer ?? "").trim();
  if (!ref) return "direct";
  try {
    const host = new URL(ref).hostname.toLowerCase();
    if (/facebook|fb\.com|instagram|meta\.com/.test(host)) return "fb_ads";
  } catch {
    /* ignore bad referrer */
  }
  return "organic";
}

/** Capture UTM params once per browser session; prefer first-touch. */
export function captureAndReadUtmAttribution(): UtmAttribution {
  if (typeof window === "undefined") {
    return {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      trafficSource: "direct",
    };
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = {
      utmSource: params.get("utm_source")?.trim() || null,
      utmMedium: params.get("utm_medium")?.trim() || null,
      utmCampaign: params.get("utm_campaign")?.trim() || null,
    };
    const referrer = document.referrer || null;

    if (fromUrl.utmSource || fromUrl.utmMedium || fromUrl.utmCampaign) {
      const next: UtmAttribution = {
        ...fromUrl,
        trafficSource: classifyTrafficSource(fromUrl.utmSource, referrer),
      };
      window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(next));
      return next;
    }

    const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UtmAttribution>;
      return {
        utmSource: parsed.utmSource ?? null,
        utmMedium: parsed.utmMedium ?? null,
        utmCampaign: parsed.utmCampaign ?? null,
        trafficSource:
          parsed.trafficSource ??
          classifyTrafficSource(parsed.utmSource ?? null, referrer),
      };
    }

    return {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      trafficSource: classifyTrafficSource(null, referrer),
    };
  } catch {
    return {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      trafficSource: "direct",
    };
  }
}

export function readUiLocaleForAnalytics(): UiLocale {
  return readStoredUiLocale() ?? "bn";
}

export function buildFunnelAttributionMetadata(): Record<string, unknown> {
  const utm = captureAndReadUtmAttribution();
  return {
    ui_language: readUiLocaleForAnalytics(),
    utm_source: utm.utmSource,
    utm_medium: utm.utmMedium,
    utm_campaign: utm.utmCampaign,
    traffic_source: utm.trafficSource,
  };
}
