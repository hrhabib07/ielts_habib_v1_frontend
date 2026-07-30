import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  beginLogoutLock,
  clearAuth,
  getAccessToken,
  hydrateAccessTokenFromCookie,
  isLogoutLocked,
} from "./auth";
import { getApiBaseUrl } from "./api-base-url";

let handlingUnauthorized = false;

const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30_000,
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

function shouldForceLogout(error: AxiosError): boolean {
  if (typeof window === "undefined") return false;
  if (isLogoutLocked()) return false;
  const path = window.location.pathname;
  if (path.startsWith("/login") || path.startsWith("/register")) return false;
  // Never kick buyers off checkout mid-payment  -  show an inline re-login prompt instead.
  if (path.startsWith("/checkout") || path.startsWith("/pricing")) return false;

  const url = String(error.config?.url ?? "");
  // Public pricing / health should never nuke the session
  if (url.includes("/pricing") && !url.includes("/admin")) return false;

  return true;
}

async function forceClientLogout(): Promise<void> {
  beginLogoutLock();
  clearAuth();
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
  }).catch(() => undefined);
  const path = window.location.pathname;
  if (path.startsWith("/login") || path.startsWith("/register")) {
    handlingUnauthorized = false;
    return;
  }
  window.location.replace("/login?loggedOut=1");
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status !== 401 || typeof window === "undefined") {
      return Promise.reject(error);
    }

    if (isLogoutLocked()) {
      return Promise.reject(error);
    }

    const original = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;

    // Always try cookie → Bearer recovery once, even when localStorage was empty.
    // Checkout can load via httpOnly cookie while localStorage token is missing.
    if (original && !original._retried) {
      original._retried = true;
      const restored = await hydrateAccessTokenFromCookie();
      if (restored) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${restored}`;
        return apiClient.request(original);
      }
    }

    const hadToken = Boolean(
      getAccessToken() || original?.headers?.Authorization,
    );

    if (hadToken && !handlingUnauthorized && shouldForceLogout(error)) {
      handlingUnauthorized = true;
      await forceClientLogout();
    }

    return Promise.reject(error);
  },
);

export default apiClient;
