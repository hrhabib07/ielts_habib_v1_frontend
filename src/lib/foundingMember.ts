import type { ActiveSubscription } from "@/src/lib/api/subscription";

/** Inclusive cutoff — last moment to earn Founding pricing (ends before 1 Aug 2026). */
export const FOUNDING_MEMBER_CUTOFF_ISO = "2026-07-31T23:59:59.999Z";

export const FOUNDING_MEMBER_CUTOFF = new Date(FOUNDING_MEMBER_CUTOFF_ISO);

export const FOUNDING_MEMBER_TOOLTIP =
  "Founding Member: One of the first 100 approved buyers before launch. Your Founder Number, Tier, and Badge are permanent.";

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
  profile?: { isFoundingMember?: boolean } | null,
): boolean {
  // Permanent founder flag on the user wins (count-based Founding Member program).
  if (profile?.isFoundingMember === true) return true;
  if (subscription?.isFoundingMember === true) return true;
  if (!subscription || subscription.status !== "ACTIVE") return false;
  if (new Date(subscription.endDate).getTime() <= Date.now()) return false;
  return subscription.isFounderUser === true;
}
