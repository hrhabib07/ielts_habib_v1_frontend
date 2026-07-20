"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordWithToken } from "@/src/auth/api";
import { Lock, ArrowLeft } from "lucide-react";
import { useAuthRecoveryCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

const RESET_TOKEN_KEY = "gamlish_password_reset_token";

export function ResetPasswordForm() {
  const router = useRouter();
  const copy = useAuthRecoveryCopy();
  const { locale } = useUiLocale();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = sessionStorage.getItem(RESET_TOKEN_KEY);
    setToken(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError(copy.minLength);
      return;
    }
    if (password !== confirm) {
      setError(copy.mismatch);
      return;
    }
    const t = sessionStorage.getItem(RESET_TOKEN_KEY);
    if (!t) {
      setError(copy.sessionExpired);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resetPasswordWithToken(t, password);
      sessionStorage.removeItem(RESET_TOKEN_KEY);
      router.replace("/login?reset=1");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : copy.resetFailed;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (token === null) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
        <p className="text-muted-foreground">{copy.loading}</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div
        className={cn(
          "flex min-h-[calc(100vh-8rem)] items-center justify-center px-4",
          locale === "bn" && "font-bengali",
        )}
        lang={locale === "bn" ? "bn" : "en"}
      >
        <div className="max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
          <p className="text-muted-foreground">{copy.noSessionBody}</p>
          <Button asChild className="mt-6">
            <Link href="/forgot-password">{copy.forgotLink}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12",
        locale === "bn" && "font-bengali",
      )}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">{copy.resetTitle}</h1>
          <p className="text-muted-foreground">{copy.resetSub}</p>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="new-pass">{copy.newPassword}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="new-pass"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pass">{copy.confirmPassword}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirm-pass"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? copy.updating : copy.updatePassword}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link
              href="/login"
              className="inline-flex items-center font-medium text-primary hover:underline"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              {copy.backSignIn}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
