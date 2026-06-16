import type { ActiveSubscription } from "@/src/lib/api/subscription";

/** Inclusive cutoff — pay before 2 Aug 2026 (local) / end of 1 Aug 2026 UTC window. */
export const FOUNDING_MEMBER_CUTOFF_ISO = "2026-08-01T23:59:59.999Z";

export const FOUNDING_MEMBER_CUTOFF = new Date(FOUNDING_MEMBER_CUTOFF_ISO);

export const FOUNDING_MEMBER_TOOLTIP =
  "Founding Member: Granted for supporting Gamlish with premium access before 1 August 2026. This badge will never be obtainable again.";

export function isFoundingMemberWindowOpen(now: Date = new Date()): boolean {
  return now.getTime() <= FOUNDING_MEMBER_CUTOFF.getTime();
}

export function msUntilFoundingMemberCutoff(now: Date = new Date()): number {
  return Math.max(0, FOUNDING_MEMBER_CUTOFF.getTime() - now.getTime());
}

export function formatFoundingCountdown(ms: number): {
  days: number;
  hours: number;
  minutes: number;
} {
  const totalMinutes = Math.floor(ms / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return { days, hours, minutes };
}

export function isFoundingMemberEligible(
  subscription: ActiveSubscription | null | undefined,
): boolean {
  if (subscription?.isFoundingMember === true) return true;
  if (!subscription || subscription.status !== "ACTIVE") return false;
  if (new Date(subscription.endDate).getTime() <= Date.now()) return false;

  if (subscription.isFounderUser) return true;

  const paidAt = new Date(subscription.startDate ?? subscription.createdAt);
  if (Number.isNaN(paidAt.getTime())) return false;

  return paidAt.getTime() <= FOUNDING_MEMBER_CUTOFF.getTime();
}
