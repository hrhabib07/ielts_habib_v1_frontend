import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  clearAuth,
  getAccessToken,
  hydrateAccessTokenFromCookie,
} from "./auth";
import { getApiBaseUrl } from "./api-base-url";

let handlingUnauthorized = false;
let bootstrapAttempted = false;

const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 20_000,
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
  const path = window.location.pathname;
  if (path.startsWith("/login") || path.startsWith("/register")) return false;

  const url = String(error.config?.url ?? "");
  // Public pricing / health should never nuke the session
  if (url.includes("/pricing") && !url.includes("/admin")) return false;

  return true;
}

async function forceClientLogout(): Promise<void> {
  clearAuth();
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
  }).catch(() => undefined);
  const path = window.location.pathname;
  if (!path.startsWith("/login") && !path.startsWith("/register")) {
    window.location.href = "/login";
  } else {
    handlingUnauthorized = false;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status !== 401 || typeof window === "undefined") {
      return Promise.reject(error);
    }

    const original = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;

    // No Bearer was sent — guest request, do not clear session
    const hadToken = Boolean(getAccessToken() || original?.headers?.Authorization);
    if (!hadToken) {
      return Promise.reject(error);
    }

    // One recovery: hydrate from httpOnly cookie then retry
    if (original && !original._retried && !bootstrapAttempted) {
      bootstrapAttempted = true;
      original._retried = true;
      const restored = await hydrateAccessTokenFromCookie();
      if (restored) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${restored}`;
        return apiClient.request(original);
      }
    }

    if (!handlingUnauthorized && shouldForceLogout(error)) {
      handlingUnauthorized = true;
      await forceClientLogout();
    }

    return Promise.reject(error);
  },
);

export default apiClient;
