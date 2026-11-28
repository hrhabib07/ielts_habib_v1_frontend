/**
 * First-touch UTM + referrer cookie so ad source survives signup.
 * Cookie lasts 90 days. Never stores email/phone/name.
 */

export type ConversionFunnelSource =
  | "meta_ad"
  | "organic_fb"
  | "youtube"
  | "ai"
  | "direct"
  | "other";

export type ConversionAttribution = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  referrer: string | null;
  source: ConversionFunnelSource;
};

const COOKIE_NAME = "gamlish_funnel_attr";
const COOKIE_DAYS = 90;
const SESSION_KEY = "gamlish_funnel_session";

function classifySource(
  utmSource: string | null,
  utmMedium: string | null,
  referrer: string | null,
): ConversionFunnelSource {
  const src = (utmSource ?? "").toLowerCase();
  const medium = (utmMedium ?? "").toLowerCase();
  let host = "";
  if (referrer) {
    try {
      host = new URL(referrer).hostname.toLowerCase();
    } catch {
      host = "";
    }
  }
  const isMetaUtm =
    /^(facebook|fb|instagram|ig|meta)$/.test(src) || /facebook|instagram|meta/.test(src);
  const isMetaHost = /facebook\.|fb\.com|instagram\.|meta\.com/.test(host);
  const isPaid = /^(cpc|ppc|paid|paid_social|paidsocial|paid-social|display|ads|ad)$/.test(medium);
  if (isMetaUtm && isPaid) return "meta_ad";
  if (isMetaUtm || isMetaHost) return "organic_fb";
  if (/^(youtube|yt)$/.test(src) || /youtube\.|youtu\.be/.test(host)) return "youtube";
  const isAiUtm =
    /^(chatgpt|openai|gpt|claude|anthropic|gemini|bard|perplexity|pplx|copilot|you|phind|ai|llm)$/.test(
      src,
    ) || /^(ai|llm|assistant)$/.test(medium);
  const isAiHost =
    /chatgpt\.|chat\.openai\.|claude\.ai|anthropic\.|gemini\.google\.|bard\.google\.|perplexity\.|copilot\.microsoft\.|you\.com|phind\./.test(
      host,
    );
  if (isAiUtm || isAiHost) return "ai";
  if (!src && !host) return "direct";
  return "other";
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(name.length + 1));
}

function writeCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function emptyAttr(): ConversionAttribution {
  return {
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmContent: null,
    referrer: null,
    source: "direct",
  };
}

function hasUtm(attr: Pick<ConversionAttribution, "utmSource" | "utmMedium" | "utmCampaign" | "utmContent">): boolean {
  return Boolean(attr.utmSource || attr.utmMedium || attr.utmCampaign || attr.utmContent);
}

function readUrlAttribution(): ConversionAttribution {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source")?.trim() || null;
  const utmMedium = params.get("utm_medium")?.trim() || null;
  const utmCampaign = params.get("utm_campaign")?.trim() || null;
  const utmContent = params.get("utm_content")?.trim() || null;
  const referrer = document.referrer || null;
  return {
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    referrer,
    source: classifySource(utmSource, utmMedium, referrer),
  };
}

/**
 * Capture first-touch UTM/referrer into a cookie; later visits keep the first touch.
 * If the first touch had no UTM (direct /play), a later visit with real utm_* can overwrite it.
 */
export function captureConversionAttribution(): ConversionAttribution {
  if (typeof window === "undefined") return emptyAttr();

  try {
    const fromUrl = readUrlAttribution();
    const existingRaw = readCookie(COOKIE_NAME);
    if (existingRaw) {
      const parsed = JSON.parse(existingRaw) as Partial<ConversionAttribution>;
      const existing: ConversionAttribution = {
        utmSource: parsed.utmSource ?? null,
        utmMedium: parsed.utmMedium ?? null,
        utmCampaign: parsed.utmCampaign ?? null,
        utmContent: parsed.utmContent ?? null,
        referrer: parsed.referrer ?? null,
        source:
          parsed.source ??
          classifySource(parsed.utmSource ?? null, parsed.utmMedium ?? null, parsed.referrer ?? null),
      };
      if (!hasUtm(existing) && hasUtm(fromUrl)) {
        const upgraded: ConversionAttribution = {
          ...fromUrl,
          referrer: existing.referrer || fromUrl.referrer,
          source: classifySource(fromUrl.utmSource, fromUrl.utmMedium, existing.referrer || fromUrl.referrer),
        };
        writeCookie(COOKIE_NAME, JSON.stringify(upgraded), COOKIE_DAYS);
        return upgraded;
      }
      return existing;
    }

    writeCookie(COOKIE_NAME, JSON.stringify(fromUrl), COOKIE_DAYS);
    return fromUrl;
  } catch {
    return emptyAttr();
  }
}

export function getOrCreateFunnelSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing && existing.length >= 8) return existing;
    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return `s_${Date.now()}`;
  }
}
