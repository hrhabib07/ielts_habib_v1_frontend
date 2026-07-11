import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "ielts_habib_token";

export interface JwtPayload {
  userId: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  exp: number;
}

/**
 * Persist Bearer token for API calls (localStorage only).
 * Do NOT mirror into document.cookie — that conflicts with the httpOnly
 * cookie set by POST /api/auth/sync and breaks production session recovery.
 */
export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
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
  // Clear legacy non-httpOnly cookie from older clients (same name).
  document.cookie = `${TOKEN_KEY}=; path=/; Max-Age=0; SameSite=Lax`;
}

export function logout(): void {
  clearAuth();
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("auth-state-changed"));
  fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).finally(
    () => {
      window.location.href = "/login";
    },
  );
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
export async function syncAuthCookie(token: string): Promise<{
  ok: boolean;
  code?: string;
  hint?: string;
}> {
  try {
    const res = await fetch("/api/auth/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      credentials: "same-origin",
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
  }
}

/**
 * Restore Bearer from httpOnly cookie when localStorage is empty
 * (e.g. private mode quirks, cleared storage, or older clients).
 */
export async function hydrateAccessTokenFromCookie(): Promise<string | null> {
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
