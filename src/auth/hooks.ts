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
      const token = res.data.token;
      const role = res.data.user.role;

      setAccessToken(token);

      await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        credentials: "same-origin",
      });

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

  const handleRegister = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      await register({ email });
      window.location.href = `/verify-otp?email=${encodeURIComponent(email)}`;
    } catch (err: unknown) {
      const ax = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string; errorSources?: { message?: string }[] }; status?: number } })
        : null;
      const msg =
        ax?.response?.data?.message ??
        ax?.response?.data?.errorSources?.[0]?.message ??
        null;
      if (msg) {
        setError(msg);
      } else if (ax?.response) {
        setError(ax.response.status === 409
          ? "An account with this email already exists. Please sign in."
          : "Something went wrong. Please try again.");
      } else {
        setError(
          "Could not reach the server. Check your connection and that the app is running.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return { handleRegister, loading, error };
}

export function useVerifyOtp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyOtp = async (
    email: string,
    otp: string,
    password: string,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const res = await verifyOtp({ email, otp, password });
      const token = res?.data?.token;
      const role = res?.data?.user?.role;

      if (token) {
        setAccessToken(token);
        await fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          credentials: "same-origin",
        });
      }

      if (role === "ADMIN") {
        window.location.href = "/dashboard/admin";
      } else if (role === "INSTRUCTOR") {
        window.location.href = "/dashboard/instructor";
      } else {
        window.location.href = "/onboarding";
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg ?? "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { handleVerifyOtp, loading, error };
}
