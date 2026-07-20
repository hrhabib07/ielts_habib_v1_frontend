"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordRequest } from "@/src/auth/api";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuthRecoveryCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm() {
  const copy = useAuthRecoveryCopy();
  const { locale } = useUiLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await forgotPasswordRequest(email.trim());
      setSent(true);
    } catch {
      setError(copy.sendError);
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
          <h1 className="text-3xl font-bold tracking-tight">{copy.forgotTitle}</h1>
          <p className="text-muted-foreground">{copy.forgotSub}</p>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {copy.sentBody(email)}
              </p>
              <p className="text-xs text-muted-foreground">{copy.sentSecurity}</p>
              <Button asChild className="w-full" variant="secondary">
                <Link href={`/verify-reset-otp?email=${encodeURIComponent(email)}`}>
                  {copy.enterCode}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="forgot-email">{copy.emailLabel}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={copy.emailPlaceholder}
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
                {loading ? copy.sending : copy.sendCode}
              </Button>
            </form>
          )}

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
