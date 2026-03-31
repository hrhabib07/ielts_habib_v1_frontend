import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "ielts_habib_token";

export interface JwtPayload {
  userId: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  exp: number;
}

export function setAccessToken(token: string): void {
  document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Lax`;

  // optional: localStorage (for client utilities)
  localStorage.setItem(TOKEN_KEY, token);
  
  // Dispatch custom event for auth state change
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth-state-changed"));
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuth(): void {
  // remove cookie
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;

  // remove localStorage
  localStorage.removeItem(TOKEN_KEY);
}

export function logout(): void {
  clearAuth();
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("auth-state-changed"));
  fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).finally(
    () => {
      window.location.href = "/login";
    }
  );
}

export function getTokenFromClient(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
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
  const token = getAccessToken();
  if (!token) return null;

  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

function isJwtPayloadUsable(p: JwtPayload | null): p is JwtPayload {
  if (!p || typeof p.exp !== "number") return false;
  return p.exp * 1000 >= Date.now();
}

/** Client-only: non-expired JWT in localStorage (API Bearer). Independent of server cookie verification. */
export function hasUsableClientToken(): boolean {
  if (typeof window === "undefined") return false;
  return isJwtPayloadUsable(getDecodedTokenClient());
}

/**
 * Client-only: session is an active STUDENT (for UI that cannot rely on RSC getCurrentUser(), e.g. missing JWT_SECRET on the host).
 */
export function isActiveStudentSessionClient(): boolean {
  if (typeof window === "undefined") return false;
  const p = getDecodedTokenClient();
  if (!isJwtPayloadUsable(p)) return false;
  return String(p.role).toUpperCase() === "STUDENT";
}
