"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/src/auth/hooks";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { brandSurfaces } from "@/src/lib/brand-theme";
import { useFounderLaunchCopy } from "@/src/hooks/useLocalizedCopy";
import { cn } from "@/lib/utils";

const DevQuickLogin =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () => import("@/src/components/dev/DevQuickLogin").then((m) => m.default),
        { ssr: false },
      )
    : () => null;

export function LoginForm({ resetSuccess = false }: { resetSuccess?: boolean }) {
  const founderCopy = useFounderLaunchCopy();
  const { handleLogin, loading, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-10 sm:py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to your GAMLISH account
          </p>
        </div>

        <Link
          href="/pricing"
          className={cn("block rounded-2xl border p-4 text-center font-bengali text-sm shadow-sm transition hover:border-primary/40", brandSurfaces.midnightCard)}
        >
          <p className="font-semibold text-primary-foreground/90">{founderCopy.eyebrow}</p>
          <p className="mt-1 text-primary-foreground/75">{founderCopy.trust}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Founder Launch দেখুন
          </span>
        </Link>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          {resetSuccess ? (
            <div
              className="mb-6 rounded-md border border-primary/25 bg-primary/10 p-3 text-sm text-primary"
              role="status"
            >
              Your password was reset. Sign in with your new password.
            </div>
          ) : null}
          <DevQuickLogin setEmail={setEmail} setPassword={setPassword} />
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin(email, password);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10"
                />
              </div>
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
