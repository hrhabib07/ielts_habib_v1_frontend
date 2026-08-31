import { isAxiosError } from "axios";

type ErrorPayload = {
  message?: unknown;
  errorSources?: Array<{ message?: unknown }>;
};

function readPayload(err: unknown): ErrorPayload | null {
  if (!isAxiosError(err)) return null;
  const data = err.response?.data;
  if (typeof data !== "object" || data == null) return null;
  return data as ErrorPayload;
}

/** User-facing API error. Prefers backend field messages over Axios status text. */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const payload = readPayload(err);
  const field =
    payload?.errorSources?.find(
      (item) => typeof item.message === "string" && item.message.trim(),
    )?.message;
  if (typeof field === "string" && field.trim()) return field.trim();

  if (typeof payload?.message === "string" && payload.message.trim()) {
    const msg = payload.message.trim();
    if (msg.toLowerCase() !== "validation error") return msg;
  }

  if (err instanceof Error && err.message && !err.message.startsWith("Request failed")) {
    return err.message;
  }

  return fallback;
}

export function throwApiError(err: unknown, fallback: string): never {
  throw new Error(getApiErrorMessage(err, fallback));
}
