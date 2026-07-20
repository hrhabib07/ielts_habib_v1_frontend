"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVerifyOtp } from "@/src/auth/hooks";
import { register } from "@/src/auth/api";
import { Shield, ArrowRight, Mail, Lock, CheckCircle2 } from "lucide-react";
import { useAuthRecoveryCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

interface VerifyOtpFormProps {
  email: string;
}

export function VerifyOtpForm({ email }: VerifyOtpFormProps) {
  const { handleVerifyOtp, loading, error } = useVerifyOtp();
  const copy = useAuthRecoveryCopy();
  const { locale } = useUiLocale();
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const passwordMatch = password === confirmPassword;
  const passwordValid = password.length >= 6;
  const canSubmit =
    email && otp.length >= 1 && passwordValid && passwordMatch && !loading;

  const handleResend = async () => {
    if (!email || resendLoading) return;
    setResendLoading(true);
    setResendSuccess(false);
    try {
      await register({ email });
      setResendSuccess(true);
    } catch {
      // Error handled by toast or inline message if needed
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <div
        className={cn(
          "flex min-h-[calc(100vh-8rem)] items-center justify-center px-4",
          locale === "bn" && "font-bengali",
        )}
        lang={locale === "bn" ? "bn" : "en"}
      >
        <div className="w-full max-w-md space-y-4 text-center">
          <div className="rounded-lg border bg-destructive/10 p-6">
            <p className="font-medium text-destructive">{copy.missingEmailTitle}</p>
            <p className="mt-2 text-sm text-muted-foreground">{copy.missingEmailBody}</p>
          </div>
          <Link href="/register">
            <Button variant="outline">{copy.backRegister}</Button>
          </Link>
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
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{copy.verifyRegTitle}</h1>
          <p className="text-muted-foreground">{copy.verifyRegSub}</p>
          <p className="flex items-center justify-center gap-2 font-medium">
            <Mail className="h-4 w-4" />
            {email}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (!canSubmit) return;
              handleVerifyOtp(email, otp, password);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="otp">{copy.otpLabel}</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="text-center font-mono text-2xl tracking-widest"
                maxLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{copy.passwordLabel}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={copy.passwordHint}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">{copy.passwordHint}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{copy.confirmLabel}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={copy.confirmPlaceholder}
                  className="pl-10"
                />
              </div>
              {confirmPassword && !passwordMatch && (
                <p className="text-xs text-destructive">{copy.passwordMismatch}</p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" disabled={!canSubmit} className="w-full" size="lg">
              {loading ? (
                copy.creating
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {copy.createAccount}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              {copy.didntReceive}{" "}
              <button
                type="button"
                className="font-medium text-primary hover:underline disabled:opacity-50"
                onClick={handleResend}
                disabled={resendLoading}
              >
                {resendLoading ? copy.resending : copy.resend}
              </button>
            </p>
            {resendSuccess && (
              <p className="text-success mt-2 text-sm">{copy.resent}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
