import axios from "axios";
import { clearAuth, getAccessToken } from "./auth";
import { getApiBaseUrl } from "./api-base-url";

let handlingUnauthorized = false;

const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined" && !handlingUnauthorized) {
      handlingUnauthorized = true;
      clearAuth();
      fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" })
        .catch(() => undefined)
        .finally(() => {
          const path = window.location.pathname;
          if (!path.startsWith("/login") && !path.startsWith("/register")) {
            window.location.href = "/login";
          } else {
            handlingUnauthorized = false;
          }
        });
    }
    return Promise.reject(error);
  },
);

export default apiClient;
