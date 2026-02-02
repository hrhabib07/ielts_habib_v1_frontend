import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "ielts_habib_token";

export interface JwtPayload {
  userId: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  exp: number;
}

export function setAccessToken(token: string): void {
  // cookie (for middleware)
  document.cookie = `${TOKEN_KEY}=${token}; path=/`;

  // optional: localStorage (for client utilities)
  localStorage.setItem(TOKEN_KEY, token);
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
  window.location.href = "/login";
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
