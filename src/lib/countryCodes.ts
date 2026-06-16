/**
 * ISO 3166-1 alpha-2 codes for journey countries.
 * Keep in sync with backend `countryCodes.ts`.
 */
export const COUNTRY_CODE_OPTIONS: readonly { code: string; label: string }[] = [
  { code: "BD", label: "Bangladesh" },
  { code: "IN", label: "India" },
  { code: "PK", label: "Pakistan" },
  { code: "NP", label: "Nepal" },
  { code: "LK", label: "Sri Lanka" },
  { code: "UK", label: "United Kingdom" },
  { code: "IE", label: "Ireland" },
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "DK", label: "Denmark" },
  { code: "NL", label: "Netherlands" },
  { code: "SE", label: "Sweden" },
  { code: "NO", label: "Norway" },
  { code: "JP", label: "Japan" },
  { code: "NZ", label: "New Zealand" },
  { code: "MY", label: "Malaysia" },
  { code: "SG", label: "Singapore" },
  { code: "CN", label: "China" },
  { code: "KR", label: "South Korea" },
  { code: "AE", label: "UAE" },
  { code: "SA", label: "Saudi Arabia" },
  { code: "EG", label: "Egypt" },
  { code: "NG", label: "Nigeria" },
  { code: "ZA", label: "South Africa" },
  { code: "BR", label: "Brazil" },
  { code: "MX", label: "Mexico" },
] as const;

const CODE_TO_LABEL = new Map(COUNTRY_CODE_OPTIONS.map((c) => [c.code, c.label]));

const LABEL_TO_CODE = new Map<string, string>();
for (const { code, label } of COUNTRY_CODE_OPTIONS) {
  LABEL_TO_CODE.set(label.toLowerCase(), code);
}
LABEL_TO_CODE.set("england", "UK");
LABEL_TO_CODE.set("united kingdom", "UK");
LABEL_TO_CODE.set("usa", "US");
LABEL_TO_CODE.set("united states", "US");
LABEL_TO_CODE.set("uae", "AE");
LABEL_TO_CODE.set("south korea", "KR");

export function countryCodeToLabel(code: string | null | undefined): string | null {
  if (!code) return null;
  return CODE_TO_LABEL.get(code.trim().toUpperCase()) ?? null;
}

export function normalizeCountryCode(raw: string | null | undefined): string | null {
  if (raw == null || !String(raw).trim()) return null;
  const trimmed = String(raw).trim();
  const upper = trimmed.toUpperCase();
  if (CODE_TO_LABEL.has(upper)) return upper;
  return LABEL_TO_CODE.get(trimmed.toLowerCase()) ?? null;
}

export const DEFAULT_CURRENT_COUNTRY = "BD";
export const DEFAULT_DREAM_COUNTRY = "UK";
export const DEFAULT_DESIRED_BAND = 6.5;

export const SAME_COUNTRY_WARNING =
  "Please set two different countries to get the best experience.";
