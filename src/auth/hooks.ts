import { useState } from "react";
import { login, register, verifyOtp } from "./api";
import { setAccessToken } from "../lib/auth";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await login({ email, password });

      // ✅ EXACT PATH FROM BACKEND
      setAccessToken(res.data.token);

      // ✅ role-based redirect (optional improvement)
      const role = res.data.user.role;

      if (role === "ADMIN") {
        window.location.href = "/dashboard/admin";
      } else if (role === "INSTRUCTOR") {
        window.location.href = "/dashboard/instructor";
      } else {
        window.location.href = "/dashboard/student";
      }
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error };
}

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      await register({ email, password });
      window.location.href = `/verify-otp?email=${encodeURIComponent(email)}`;
    } catch {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return { handleRegister, loading, error };
}

export function useVerifyOtp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyOtp = async (email: string, otp: string) => {
    setLoading(true);
    setError(null);

    try {
      await verifyOtp({ email, otp });
      window.location.href = "/login";
    } catch {
      setError("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return { handleVerifyOtp, loading, error };
}
