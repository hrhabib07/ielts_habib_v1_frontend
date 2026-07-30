import type { ActiveSubscription } from "@/src/lib/api/subscription";

/**
 * Wall / Founding Member offer closes at 31 July 2026, 11:59 PM Bangladesh time
 * (Asia/Dhaka). From that instant, new Founder numbers are not issued.
 */
export const FOUNDING_MEMBER_CUTOFF_ISO = "2026-07-31T17:59:59.999Z";

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
  seconds: number;
} {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export function isFoundingMemberEligible(
  subscription: ActiveSubscription | null | undefined,
  profile?: { isFoundingMember?: boolean } | null,
): boolean {
  // Permanent founder flag on the user wins (count-based Founding Member program).
  if (profile?.isFoundingMember === true) return true;
  if (subscription?.isFoundingMember === true) return true;
  return Boolean(subscription?.isFounderUser);
}
