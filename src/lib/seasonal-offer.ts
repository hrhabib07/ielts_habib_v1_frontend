/**
 * Client-side mirror of backend seasonal windows for countdown UI.
 * Payable amount always comes from GET /pricing · never hardcode checkout amounts here.
 */

export type ClientOfferCohort =
  | "founder"
  | "first_week"
  | "first_month"
  | "standard_q4"
  | "standard";

export const FIRST_WEEK_END_ISO = "2026-08-07T17:59:59.999Z";
export const FIRST_MONTH_END_ISO = "2026-08-31T17:59:59.999Z";
export const FOUNDER_CUTOFF_ISO = "2026-07-31T17:59:59.999Z";

export function msUntilIso(iso: string | null | undefined, now = Date.now()): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.max(0, t - now);
}
