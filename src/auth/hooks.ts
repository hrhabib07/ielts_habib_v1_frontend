import { useState } from "react";
import { login, register, verifyOtp } from "./api";
import { setAccessToken, syncAuthCookie } from "../lib/auth";
import {
  clearDemoSessionId,
  readDemoSessionId,
} from "@/src/lib/demo-session";
import { getStudentPostAuthHref } from "@/src/lib/auth-redirects";

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

      // Best-effort cookie sync — never block login if sync fails.
      await syncAuthCookie(token);

      if (role === "ADMIN") {
        window.location.href = "/dashboard/admin";
      } else if (role === "INSTRUCTOR") {
        window.location.href = "/dashboard/instructor";
      } else {
        // Home gate sends paid users without @username to /username first.
        window.location.href = getStudentPostAuthHref("/");
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
      const returnPath = getStudentPostAuthHref("");
      const redirectQuery =
        returnPath && returnPath.length > 0
          ? `&redirect=${encodeURIComponent(returnPath)}`
          : "";
      window.location.href = `/verify-otp?email=${encodeURIComponent(email)}${redirectQuery}`;
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
      const res = await verifyOtp({
        email,
        otp,
        password,
        demoSessionId: readDemoSessionId(),
      });
      const token = res?.data?.token;
      const role = res?.data?.user?.role;
      const continuePath = res?.data?.continuePath;

      if (token) {
        setAccessToken(token);
        await syncAuthCookie(token);
      }

      if (continuePath) {
        clearDemoSessionId();
      }

      if (role === "ADMIN") {
        window.location.href = "/dashboard/admin";
      } else if (role === "INSTRUCTOR") {
        window.location.href = "/dashboard/instructor";
      } else {
        window.location.href =
          continuePath || getStudentPostAuthHref("/player");
      }
    } catch (err: unknown) {
      const ax =
        err && typeof err === "object" && "response" in err
          ? (err as {
              response?: {
                data?: {
                  message?: string;
                  errorSources?: { message?: string }[];
                };
                status?: number;
              };
            })
          : null;
      const apiMessage =
        ax?.response?.data?.message ??
        ax?.response?.data?.errorSources?.[0]?.message ??
        null;
      if (apiMessage && apiMessage !== "Invalid ID") {
        setError(apiMessage);
      } else if (ax?.response?.status === 409) {
        setError("An account with this email already exists. Please sign in.");
      } else if (apiMessage === "Invalid ID") {
        setError(
          "Account setup failed. Please request a new code from Register and try again.",
        );
      } else {
        setError(apiMessage ?? "Invalid or expired OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { handleVerifyOtp, loading, error };
}
