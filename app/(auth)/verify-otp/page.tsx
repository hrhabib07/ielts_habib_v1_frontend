"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVerifyOtp } from "@/src/auth/hooks";
import { register } from "@/src/auth/api";
import { Shield, ArrowRight, Mail, Lock, CheckCircle2 } from "lucide-react";

export default function VerifyOtpPage() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  const email = emailParam ? decodeURIComponent(emailParam) : "";

  const { handleVerifyOtp, loading, error } = useVerifyOtp();
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const passwordMatch = password === confirmPassword;
  const passwordValid = password.length >= 6;
  const canSubmit =
    email &&
    otp.length >= 1 &&
    passwordValid &&
    passwordMatch &&
    !loading;

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
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="rounded-lg border bg-destructive/10 p-6">
            <p className="text-destructive font-medium">
              Missing email
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please start from the registration page and enter your email
              first.
            </p>
          </div>
          <Link href="/register">
            <Button variant="outline">Back to registration</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Verify & set password
          </h1>
          <p className="text-muted-foreground">
            Enter the code we sent to
          </p>
          <p className="font-medium flex items-center justify-center gap-2">
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
              <Label htmlFor="otp">Verification code</Label>
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
                className="text-center text-2xl tracking-widest font-mono"
                maxLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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
                  placeholder="At least 6 characters"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum 6 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
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
                  placeholder="Repeat password"
                  className="pl-10"
                />
              </div>
              {confirmPassword && !passwordMatch && (
                <p className="text-xs text-destructive">
                  Passwords do not match
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full"
              size="lg"
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                className="font-medium text-primary hover:underline disabled:opacity-50"
                onClick={handleResend}
                disabled={resendLoading}
              >
                {resendLoading ? "Sending..." : "Resend code"}
              </button>
            </p>
            {resendSuccess && (
              <p className="mt-2 text-success text-sm">
                A new code has been sent to your email.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
