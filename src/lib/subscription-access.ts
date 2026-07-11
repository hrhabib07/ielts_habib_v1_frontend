import type { ActiveSubscription } from "@/src/lib/api/subscription";

/** Purchased ACTIVE plan that has not expired (includes August pre-orders). */
export function hasPurchasedSubscription(
  subscription: ActiveSubscription | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!subscription || subscription.status !== "ACTIVE") return false;
  return new Date(subscription.endDate).getTime() > now.getTime();
}

/** Subscription window has started and is still valid (can play paid content). */
export function hasUsablePremiumAccess(
  subscription: ActiveSubscription | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!hasPurchasedSubscription(subscription, now)) return false;
  return new Date(subscription!.startDate).getTime() <= now.getTime();
}

/** Approved pre-order waiting for accessStartsAt / startDate. */
export function isPreorderAwaitingAccess(
  subscription: ActiveSubscription | null | undefined,
  now: Date = new Date(),
): boolean {
  return (
    hasPurchasedSubscription(subscription, now) &&
    !hasUsablePremiumAccess(subscription, now)
  );
}

export function formatAccessDate(iso: string, locale: string = "en-GB"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
