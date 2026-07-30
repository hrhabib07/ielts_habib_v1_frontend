import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "ielts_habib_token";
/** Blocks hydrate/sync while logout is in flight (persists across tabs). */
const LOGOUT_LOCK_KEY = "ielts_habib_logging_out";

export interface JwtPayload {
  userId: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  exp: number;
}

export function beginLogoutLock(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOGOUT_LOCK_KEY, String(Date.now()));
    sessionStorage.setItem(LOGOUT_LOCK_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function clearLogoutLock(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOGOUT_LOCK_KEY);
    sessionStorage.removeItem(LOGOUT_LOCK_KEY);
  } catch {
    /* private mode */
  }
}

export function isLogoutLocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(LOGOUT_LOCK_KEY) === "1") return true;
    const raw = localStorage.getItem(LOGOUT_LOCK_KEY);
    if (!raw) return false;
    const started = Number(raw);
    // Auto-expire client lock after 2 minutes.
    if (!Number.isFinite(started) || Date.now() - started > 2 * 60 * 1000) {
      localStorage.removeItem(LOGOUT_LOCK_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Persist Bearer token for API calls (localStorage only).
 * Do NOT mirror into document.cookie  -  that conflicts with the httpOnly
 * cookie set by POST /api/auth/sync and breaks production session recovery.
 */
export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  clearLogoutLock();
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new CustomEvent("auth-state-changed"));
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  // Clear legacy non-httpOnly cookie shapes from older clients (same name).
  const expire = `${TOKEN_KEY}=; path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = expire;
  document.cookie = `${expire}; Secure`;
  document.cookie = `${expire}; domain=.gamlish.com`;
  document.cookie = `${expire}; Secure; domain=.gamlish.com`;
  document.cookie = `${expire}; domain=www.gamlish.com`;
  document.cookie = `${expire}; Secure; domain=www.gamlish.com`;
}

export function logout(): void {
  if (typeof window === "undefined") return;
  beginLogoutLock();
  clearAuth();
  window.dispatchEvent(new CustomEvent("auth-state-changed"));
  // Navigate immediately so RSC/middleware cannot bounce to / or /player
  // while the logout request is still in flight.
  const go = () => {
    // Guest home — not /login — so users are never trapped on the login screen.
    window.location.replace("/?loggedOut=1");
  };
  const timer = window.setTimeout(go, 800);
  void fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
  })
    .catch(() => undefined)
    .finally(() => {
      window.clearTimeout(timer);
      go();
    });
}

export function getTokenFromClient(): string | null {
  return getAccessToken();
}

export function getDecodedTokenClient(): JwtPayload | null {
  const token = getTokenFromClient();
  if (!token) return null;

  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

export function getDecodedToken(): JwtPayload | null {
  return getDecodedTokenClient();
}

function isJwtPayloadUsable(p: JwtPayload | null): p is JwtPayload {
  if (!p || typeof p.exp !== "number") return false;
  return p.exp * 1000 >= Date.now();
}

/** Client-only: non-expired JWT in localStorage (API Bearer). */
export function hasUsableClientToken(): boolean {
  if (typeof window === "undefined") return false;
  return isJwtPayloadUsable(getDecodedTokenClient());
}

/**
 * Client-only: active STUDENT session from localStorage JWT.
 */
export function isActiveStudentSessionClient(): boolean {
  if (typeof window === "undefined") return false;
  const p = getDecodedTokenClient();
  if (!isJwtPayloadUsable(p)) return false;
  return String(p.role).toUpperCase() === "STUDENT";
}

/** Sync JWT into the Next.js httpOnly cookie. Returns false if sync failed. */
export async function syncAuthCookie(
  token: string,
  options?: { timeoutMs?: number },
): Promise<{
  ok: boolean;
  code?: string;
  hint?: string;
}> {
  if (isLogoutLocked()) {
    return { ok: false, code: "LOGOUT", hint: "Logout in progress." };
  }
  const timeoutMs = options?.timeoutMs ?? 2500;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch("/api/auth/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      credentials: "same-origin",
      signal: controller.signal,
    });
    if (res.ok) return { ok: true };
    const body = (await res.json().catch(() => null)) as {
      code?: string;
      hint?: string;
      error?: string;
    } | null;
    return {
      ok: false,
      code: body?.code,
      hint: body?.hint ?? body?.error,
    };
  } catch {
    return { ok: false, code: "NETWORK", hint: "Could not reach /api/auth/sync." };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Restore Bearer from httpOnly cookie when localStorage is empty
 * (e.g. private mode quirks, cleared storage, or older clients).
 */
export async function hydrateAccessTokenFromCookie(): Promise<string | null> {
  if (isLogoutLocked()) return null;
  try {
    const res = await fetch("/api/auth/bootstrap", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { token?: string | null };
    const token = typeof json.token === "string" ? json.token.trim() : null;
    if (!token) return null;
    setAccessToken(token);
    return token;
  } catch {
    return null;
  }
}
