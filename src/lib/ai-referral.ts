/**
 * Detect visits that likely came from AI assistants / LLM answer engines.
 * Used for first-touch attribution + funnel tracking.
 */

export type AiProvider =
  | "chatgpt"
  | "claude"
  | "gemini"
  | "perplexity"
  | "copilot"
  | "you"
  | "phind"
  | "other_ai";

export type AiReferralHit = {
  isAi: true;
  provider: AiProvider;
  signal: "utm" | "referrer" | "both";
  referrerHost: string | null;
  utmSource: string | null;
};

const UTM_MAP: Array<{ test: RegExp; provider: AiProvider }> = [
  { test: /^(chatgpt|openai|gpt)$/i, provider: "chatgpt" },
  { test: /^(claude|anthropic)$/i, provider: "claude" },
  { test: /^(gemini|bard|google.?ai)$/i, provider: "gemini" },
  { test: /^(perplexity|pplx)$/i, provider: "perplexity" },
  { test: /^(copilot|bing.?chat|microsoft.?copilot)$/i, provider: "copilot" },
  { test: /^you$/i, provider: "you" },
  { test: /^phind$/i, provider: "phind" },
  { test: /^(ai|llm|assistant)$/i, provider: "other_ai" },
];

const HOST_MAP: Array<{ test: RegExp; provider: AiProvider }> = [
  { test: /(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$/, provider: "chatgpt" },
  { test: /(^|\.)claude\.ai$|(^|\.)anthropic\.com$/, provider: "claude" },
  { test: /(^|\.)gemini\.google\.com$|(^|\.)bard\.google\.com$/, provider: "gemini" },
  { test: /(^|\.)perplexity\.ai$/, provider: "perplexity" },
  { test: /(^|\.)copilot\.microsoft\.com$|bing\.com$/, provider: "copilot" },
  { test: /(^|\.)you\.com$/, provider: "you" },
  { test: /(^|\.)phind\.com$/, provider: "phind" },
];

const STORAGE_KEY = "gamlish.ai_referral.v1";

function hostFromReferrer(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function providerFromUtm(source: string | null, medium: string | null): AiProvider | null {
  if (source) {
    for (const row of UTM_MAP) {
      if (row.test.test(source.trim())) return row.provider;
    }
  }
  if (medium && /^(ai|llm|assistant)$/i.test(medium.trim())) return "other_ai";
  return null;
}

function providerFromHost(host: string | null): AiProvider | null {
  if (!host) return null;
  for (const row of HOST_MAP) {
    if (row.test.test(host)) return row.provider;
  }
  return null;
}

export function detectAiReferral(input?: {
  search?: string;
  referrer?: string | null;
}): AiReferralHit | null {
  if (typeof window === "undefined" && !input) return null;
  const search =
    input?.search ??
    (typeof window !== "undefined" ? window.location.search : "");
  const referrer =
    input?.referrer ??
    (typeof document !== "undefined" ? document.referrer || null : null);
  const params = new URLSearchParams(search);
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const host = hostFromReferrer(referrer);
  const fromUtm = providerFromUtm(utmSource, utmMedium);
  const fromHost = providerFromHost(host);
  if (!fromUtm && !fromHost) return null;
  return {
    isAi: true,
    provider: fromUtm ?? fromHost ?? "other_ai",
    signal: fromUtm && fromHost ? "both" : fromUtm ? "utm" : "referrer",
    referrerHost: host,
    utmSource,
  };
}

export function persistAiReferral(hit: AiReferralHit): void {
  try {
    if (typeof window === "undefined") return;
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...hit, capturedAt: new Date().toISOString() }),
    );
  } catch {
    // ignore
  }
}

export function readPersistedAiReferral(): (AiReferralHit & { capturedAt?: string }) | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AiReferralHit & { capturedAt?: string };
  } catch {
    return null;
  }
}

/** Shareable AI-facing campaign links. */
export function aiShareUrl(path: string, provider: AiProvider, campaign: string): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://www.gamlish.com";
  const url = new URL(path, origin);
  url.searchParams.set("utm_source", provider);
  url.searchParams.set("utm_medium", "ai");
  url.searchParams.set("utm_campaign", campaign);
  return url.toString();
}
