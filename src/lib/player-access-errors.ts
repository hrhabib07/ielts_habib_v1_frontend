import { isAxiosError } from "axios";

/** True when API blocked a paid mission for a user without English access. */
export function isPlayerSubscriptionRequiredError(err: unknown): boolean {
  if (!isAxiosError(err)) return false;
  if (err.response?.status !== 403) return false;

  const data = err.response.data;
  const message =
    typeof data === "object" &&
    data &&
    "message" in data &&
    typeof (data as { message?: unknown }).message === "string"
      ? (data as { message: string }).message
      : err.message;

  const lower = message.toLowerCase();
  return (
    lower.includes("subscription") ||
    lower.includes("english foundations") ||
    lower.includes("forbidden") ||
    err.response.status === 403
  );
}

export function playerApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const data = err.response?.data;
    if (
      typeof data === "object" &&
      data &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
    ) {
      return (data as { message: string }).message;
    }
    if (err.message) return err.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
