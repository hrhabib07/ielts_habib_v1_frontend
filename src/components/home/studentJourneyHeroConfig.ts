/**
 * Defaults and map coordinates for the student "Travel & Achievement" band hero.
 * Coordinates match worldLandClipPath.generated (Natural Earth 110m, viewBox 0 0 1000 500).
 */

import {
  JOURNEY_COUNTRY_ANCHORS,
  JOURNEY_DEFAULT_FROM,
  JOURNEY_DEFAULT_TO,
} from "@/src/components/home/worldJourneyAnchors.generated";

export const STUDENT_JOURNEY_HERO_MOCK = {
  currentCountry: "Bangladesh",
  dreamCountry: "United Kingdom",
  moduleLabel: "Reading",
  profileHref: "/profile/reading",
} as const;

function normalizeCountryKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function resolveJourneyMapPoint(
  country: string | null | undefined,
  role: "from" | "to",
): { x: number; y: number } {
  if (!country?.trim()) {
    return role === "from"
      ? { ...JOURNEY_DEFAULT_FROM }
      : { ...JOURNEY_DEFAULT_TO };
  }
  const key = normalizeCountryKey(country);
  const hit = JOURNEY_COUNTRY_ANCHORS[key];
  if (hit) return { x: hit.x, y: hit.y };
  return role === "from"
    ? { ...JOURNEY_DEFAULT_FROM }
    : { ...JOURNEY_DEFAULT_TO };
}

export function buildQuadraticFlightPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  const midX = (from.x + to.x) / 2;
  const arcLift = Math.min(120, Math.abs(to.x - from.x) * 0.22 + 48);
  const midY = Math.min(from.y, to.y) - arcLift;
  return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
}
