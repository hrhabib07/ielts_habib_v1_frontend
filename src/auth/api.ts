import apiClient from "../lib/api-client";
import { getApiBaseUrl } from "../lib/api-base-url";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "./types";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
  return data;
}

export async function register(
  payload: RegisterRequest,
): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>(
    "/auth/register",
    payload,
  );
  return data;
}

export async function verifyOtp(
  payload: VerifyOtpRequest,
): Promise<VerifyOtpResponse> {
  const { data } = await apiClient.post<VerifyOtpResponse>(
    "/auth/verify-otp",
    payload,
  );
  return data;
}

export async function forgotPasswordRequest(email: string): Promise<void> {
  await apiClient.post("/auth/forgot-password", { email });
}

export async function verifyResetOtpRequest(
  email: string,
  otp: string,
): Promise<string> {
  const res = await apiClient.post<{
    success: boolean;
    data: { resetToken: string };
  }>("/auth/verify-reset-otp", { email, otp });
  const resetToken = res.data.data?.resetToken;
  if (!resetToken) {
    throw new Error("Invalid response from server");
  }
  return resetToken;
}

export async function resetPasswordWithToken(
  resetToken: string,
  newPassword: string,
): Promise<void> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resetToken}`,
    },
    body: JSON.stringify({ newPassword }),
  });
  if (!res.ok) {
    let message = "Could not reset password";
    try {
      const j = (await res.json()) as { message?: string };
      if (j.message) message = j.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
}

export async function updatePasswordRequest(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await apiClient.patch("/auth/update-password", {
    currentPassword,
    newPassword,
  });
}

export async function setPasswordRequest(newPassword: string): Promise<void> {
  await apiClient.post("/auth/set-password", { newPassword });
}
