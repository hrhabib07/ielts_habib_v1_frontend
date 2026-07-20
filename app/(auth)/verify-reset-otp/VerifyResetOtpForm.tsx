"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyResetOtpRequest } from "@/src/auth/api";
import { KeyRound, ArrowLeft } from "lucide-react";
import { useAuthRecoveryCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

const RESET_TOKEN_KEY = "gamlish_password_reset_token";

function VerifyResetOtpInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const copy = useAuthRecoveryCopy();
  const { locale } = useUiLocale();
  const emailParam = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const resetToken = await verifyResetOtpRequest(email.trim(), otp.trim());
      sessionStorage.setItem(RESET_TOKEN_KEY, resetToken);
      router.push("/reset-password");
    } catch {
      setError(copy.invalidCode);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">{copy.verifyResetTitle}</h1>
          <p className="text-muted-foreground">{copy.verifyResetSub}</p>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="reset-email">{copy.emailLabel}</Label>
              <Input
                id="reset-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-otp">{copy.otpLabel}</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reset-otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="pl-10"
                  placeholder={copy.otpPlaceholder}
                />
              </div>
            </div>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? copy.checking : copy.continue}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-2 text-center text-sm">
            <Link href="/forgot-password" className="font-medium text-primary hover:underline">
              {copy.requestNewCode}
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center font-medium text-muted-foreground hover:text-foreground"
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

export function VerifyResetOtpForm() {
  const copy = useAuthRecoveryCopy();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
          <p className="text-muted-foreground">{copy.loading}</p>
        </div>
      }
    >
      <VerifyResetOtpInner />
    </Suspense>
  );
}
