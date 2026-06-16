const DAYS_PER_MONTH = 30;

export function formatSubscriptionDuration(days: number): string {
  if (!Number.isFinite(days) || days <= 0) return "6 months";

  if (days >= 360 && days % 180 === 0) {
    const halfYears = days / 180;
    if (halfYears === 2) return "12 months";
    if (halfYears === 1) return "6 months";
    return `${halfYears * 6} months`;
  }

  const months = Math.round(days / DAYS_PER_MONTH);
  if (months >= 12 && months % 12 === 0) {
    const years = months / 12;
    return years === 1 ? "12 months" : `${years} years`;
  }
  if (months >= 6 && months % 6 === 0) {
    return `${months} months`;
  }
  if (months === 1) return "1 month";
  return `${months} months`;
}
