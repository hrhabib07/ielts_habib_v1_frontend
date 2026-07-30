import {
  getAccessToken,
  hydrateAccessTokenFromCookie,
  setAccessToken,
  syncAuthCookie,
} from "@/src/lib/auth";

/**
 * Persist JWT for phone (and any) login:
 * 1) localStorage Bearer (API calls)
 * 2) Next.js httpOnly cookie (RSC / checkout page access)
 *
 * Phone OTP previously raced past sync and let users open checkout before the
 * cookie was ready  -  submit failed for ~30–90s, then worked on retry.
 */
export async function persistSessionToken(token: string): Promise<{
  ok: boolean;
  code?: string;
}> {
  const trimmed = token.trim();
  if (!trimmed) return { ok: false, code: "EMPTY_TOKEN" };

  setAccessToken(trimmed);

  let lastCode: string | undefined;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const synced = await syncAuthCookie(trimmed, { timeoutMs: 5000 });
    if (synced.ok) {
      // Confirm cookie round-trip works (mobile Safari / FB in-app quirks).
      const fromCookie = await hydrateAccessTokenFromCookie();
      if (fromCookie) {
        setAccessToken(fromCookie);
        return { ok: true };
      }
      lastCode = "COOKIE_ROUNDTRIP_FAILED";
    } else {
      lastCode = synced.code ?? "SYNC_FAILED";
    }
    await sleep(400 * (attempt + 1));
  }

  return { ok: false, code: lastCode ?? "SYNC_FAILED" };
}

/**
 * Wait until Bearer is available (localStorage or cookie hydrate).
 * Used on checkout so phone users cannot submit while session is still settling.
 */
export async function waitForClientAuthReady(options?: {
  timeoutMs?: number;
}): Promise<string | null> {
  const timeoutMs = options?.timeoutMs ?? 12_000;
  const started = Date.now();
  let attempt = 0;

  while (Date.now() - started < timeoutMs) {
    const existing = getAccessToken()?.trim() ?? null;
    if (existing) return existing;

    const hydrated = await hydrateAccessTokenFromCookie();
    if (hydrated?.trim()) return hydrated.trim();

    attempt += 1;
    await sleep(Math.min(250 * attempt, 1000));
  }

  return getAccessToken()?.trim() ?? null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
