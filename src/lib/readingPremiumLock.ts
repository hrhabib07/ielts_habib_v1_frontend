/**
 * Backend copy lives in `readingAccessGuard.service.ts` (403 subscription / PT2+ gates).
 */

export function isReadingPremiumLockMessage(
  message: string | undefined | null,
): boolean {
  if (!message || typeof message !== "string") return false;
  const m = message.toLowerCase();
  return (
    m.includes("paid reading module") ||
    m.includes("subscribe to continue") ||
    m.includes("active reading subscription") ||
    m.includes("levels 2 and above require") ||
    m.includes("practice test 2 onward")
  );
}

export function isReadingPremiumLockResponse(
  status: number | undefined,
  message: string | undefined | null,
): boolean {
  return status === 403 && isReadingPremiumLockMessage(message);
}
