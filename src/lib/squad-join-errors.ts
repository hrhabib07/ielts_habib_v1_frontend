import { isAxiosError } from "axios";
import type { SquadUiCopy } from "@/src/lib/squad-ui-copy";

function apiMessage(err: unknown): string {
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
  }
  if (err instanceof Error) return err.message;
  return "";
}

/** Map join failures to clear EN/BN copy (never raw Axios status text). */
export function squadJoinErrorMessage(err: unknown, copy: SquadUiCopy): string {
  const status = isAxiosError(err) ? err.response?.status : undefined;
  const message = apiMessage(err).toLowerCase();

  if (
    status === 404 ||
    message.includes("not found") ||
    message.includes("invalid invite") ||
    message.includes("status code 404")
  ) {
    return copy.squadNotFound;
  }

  if (status === 409 || message.includes("full")) {
    if (message.includes("leave") || message.includes("before joining") || message.includes("already")) {
      return copy.alreadyInSquad;
    }
    return copy.squadFull;
  }

  if (message.includes("leave your current") || message.includes("already")) {
    return copy.alreadyInSquad;
  }

  if (message && !message.includes("request failed") && !message.includes("status code")) {
    return apiMessage(err);
  }

  return copy.joinFailed;
}
