import apiClient from "../lib/api-client";
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
