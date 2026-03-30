import { JOURNEY_COUNTRY_ANCHORS } from "@/src/components/home/worldJourneyAnchors.generated";

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Every anchor key maps to one canonical display label (for DB + hero + map). */
const ANCHOR_KEY_TO_LABEL: Record<string, string> = {
  bangladesh: "Bangladesh",
  india: "India",
  pakistan: "Pakistan",
  nepal: "Nepal",
  "sri lanka": "Sri Lanka",
  "united kingdom": "United Kingdom",
  uk: "United Kingdom",
  england: "England",
  ireland: "Ireland",
  "united states": "United States",
  usa: "United States",
  canada: "Canada",
  australia: "Australia",
  germany: "Germany",
  france: "France",
  denmark: "Denmark",
  netherlands: "Netherlands",
  sweden: "Sweden",
  norway: "Norway",
  japan: "Japan",
  "new zealand": "New Zealand",
  malaysia: "Malaysia",
  singapore: "Singapore",
  china: "China",
  "south korea": "South Korea",
  uae: "UAE",
  "saudi arabia": "Saudi Arabia",
  egypt: "Egypt",
  nigeria: "Nigeria",
  "south africa": "South Africa",
  brazil: "Brazil",
  mexico: "Mexico",
};

/** Dropdown keys: one row per map destination (omit pure aliases uk / usa). */
const DROPDOWN_KEYS = Object.keys(JOURNEY_COUNTRY_ANCHORS).filter(
  (k) => k !== "uk" && k !== "usa",
);

const LABELS_SORTED: string[] = Array.from(
  new Set(
    DROPDOWN_KEYS.map((k) => {
      const label = ANCHOR_KEY_TO_LABEL[k];
      if (!label) {
        throw new Error(
          `journeyCountries: add ANCHOR_KEY_TO_LABEL entry for "${k}" (sync with worldJourneyAnchors.generated)`,
        );
      }
      return label;
    }),
  ),
).sort((a, b) => a.localeCompare(b));

/** Labels shown in country selects (matches hero map anchors). */
export const JOURNEY_COUNTRY_SELECT_LABELS: readonly string[] = LABELS_SORTED;

const LABEL_TO_CANONICAL = new Map<string, string>();
for (const label of JOURNEY_COUNTRY_SELECT_LABELS) {
  LABEL_TO_CANONICAL.set(norm(label), label);
}

/**
 * Returns canonical label if `raw` matches any allowed anchor key or label, else null.
 */
export function normalizeJourneyCountryLabel(
  raw: string | null | undefined,
): string | null {
  if (raw == null || !String(raw).trim()) return null;
  const n = norm(String(raw));
  if (n in JOURNEY_COUNTRY_ANCHORS) {
    return ANCHOR_KEY_TO_LABEL[n] ?? null;
  }
  return LABEL_TO_CANONICAL.get(n) ?? null;
}

export function isAllowedJourneyCountryLabel(raw: string | null | undefined): boolean {
  return normalizeJourneyCountryLabel(raw) != null;
}
