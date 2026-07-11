import { useState } from "react";
import { login, register, verifyOtp } from "./api";
import { setAccessToken, syncAuthCookie } from "../lib/auth";

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

      const synced = await syncAuthCookie(token);
      if (!synced) {
        setError(
          "Signed in, but session cookie could not be saved. Check that JWT_SECRET on Vercel matches Railway, then try again.",
        );
        return;
      }

      if (role === "ADMIN") {
        window.location.href = "/dashboard/admin";
      } else if (role === "INSTRUCTOR") {
        window.location.href = "/dashboard/instructor";
      } else {
        window.location.href = "/";
      }
    } catch (err: unknown) {
      const ax =
        err && typeof err === "object" && "response" in err
          ? (err as {
              response?: {
                data?: { message?: string; errorSources?: { message?: string }[] };
                status?: number;
              };
            })
          : null;
      const msg =
        ax?.response?.data?.message ??
        ax?.response?.data?.errorSources?.[0]?.message ??
        null;
      if (msg) {
        setError(msg);
      } else if (ax?.response?.status === 404) {
        setError(
          "API not found. Set NEXT_PUBLIC_API_BASE_URL on Vercel to your Railway URL ending in /api.",
        );
      } else if (ax?.response) {
        setError("Invalid email or password");
      } else if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        String((err as { message?: string }).message).includes("Network Error")
      ) {
        setError(
          "Cannot reach the API. On Railway set FRONTEND_ORIGIN to https://gamlish.com,https://www.gamlish.com and redeploy the API.",
        );
      } else {
        setError(
          "Could not reach the server. Check your connection and try again.",
        );
      }
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
      const ax =
        err && typeof err === "object" && "response" in err
          ? (err as {
              response?: {
                data?: { message?: string; errorSources?: { message?: string }[] };
                status?: number;
              };
            })
          : null;
      const msg =
        ax?.response?.data?.message ??
        ax?.response?.data?.errorSources?.[0]?.message ??
        null;
      if (msg) {
        setError(msg);
      } else if (ax?.response) {
        const st = ax.response.status;
        if (st === 409) {
          setError("An account with this email already exists. Please sign in.");
        } else if (st === 404) {
          setError(
            "API not found. Set NEXT_PUBLIC_API_BASE_URL on Vercel to your Railway URL ending in /api.",
          );
        } else {
          setError("Something went wrong. Please try again.");
        }
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
        const synced = await syncAuthCookie(token);
        if (!synced) {
          setError(
            "Account created, but session cookie could not be saved. Check JWT_SECRET on Vercel matches Railway, then sign in.",
          );
          return;
        }
      }

      if (role === "ADMIN") {
        window.location.href = "/dashboard/admin";
      } else if (role === "INSTRUCTOR") {
        window.location.href = "/dashboard/instructor";
      } else {
        window.location.href = "/";
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : null;
      setError(msg ?? "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { handleVerifyOtp, loading, error };
}
