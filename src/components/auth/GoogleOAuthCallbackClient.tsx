"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { setAccessToken, syncAuthCookie } from "@/src/lib/auth";
import {
  clearDemoSessionId,
  readDemoSessionId,
} from "@/src/lib/demo-session";
import { decodeJwtUser } from "@/src/lib/jwt-verify";
import { GOOGLE_CALLBACK_COPY } from "@/src/lib/auth-recovery-copy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

function sanitizeInternalPath(raw: string | null): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return null;
  }
  return value;
}

function resolveDestination(
  token: string,
  continuePath: string | null,
  returnTo: string | null,
): string {
  const claims = decodeJwtUser(token);
  const role = claims?.role;
  if (role === "ADMIN") return "/dashboard/admin";
  if (role === "INSTRUCTOR") return "/dashboard/instructor";
  return continuePath || returnTo || "/player";
}

/**
 * Completes Google OAuth after the API redirects here with ?token=…
 * Priority: navigate instantly. Cookie sync runs with a short timeout and
 * continues in the background — /player is not middleware-gated on the cookie.
 */
export function GoogleOAuthCallbackClient() {
  const searchParams = useSearchParams();
  const { locale } = useUiLocale();
  const copy = GOOGLE_CALLBACK_COPY[locale];
  const [message, setMessage] = useState(copy.signingIn);
  const [phase, setPhase] = useState<"working" | "error">("working");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let cancelled = false;

    const fail = (text: string, loginError: string) => {
      if (cancelled) return;
      setPhase("error");
      setMessage(text);
      window.setTimeout(() => {
        window.location.replace(`/login?error=${encodeURIComponent(loginError)}`);
      }, 600);
    };

    const run = async () => {
      const error = searchParams.get("error");
      if (error) {
        fail(decodeURIComponent(error), decodeURIComponent(error));
        return;
      }

      const token = searchParams.get("token")?.trim();
      if (!token) {
        fail(copy.missingToken, "google_missing_token");
        return;
      }

      const continuePath = sanitizeInternalPath(searchParams.get("continuePath"));
      const returnTo = sanitizeInternalPath(searchParams.get("returnTo"));
      const destination = resolveDestination(token, continuePath, returnTo);

      setAccessToken(token);

      if (continuePath || readDemoSessionId()) {
        clearDemoSessionId();
      }

      // Best-effort cookie sync — never block entry more than ~400ms.
      await Promise.race([
        syncAuthCookie(token, { timeoutMs: 400 }),
        new Promise<{ ok: false }>((resolve) => {
          window.setTimeout(() => resolve({ ok: false }), 400);
        }),
      ]);

      // Keep syncing in background so middleware/RSC catch up.
      void syncAuthCookie(token, { timeoutMs: 2500 });

      if (cancelled) return;

      try {
        window.history.replaceState({}, "", destination);
      } catch {
        /* ignore */
      }

      window.location.replace(destination);
    };

    void run().catch(() => {
      fail(copy.syncFailed, "google_sync_failed");
    });

    return () => {
      cancelled = true;
    };
  }, [searchParams, copy.missingToken, copy.syncFailed]);

  return (
    <div
      className={cn(
        "flex min-h-dvh items-center justify-center bg-background px-4",
        locale === "bn" && "font-bengali",
      )}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <div className="w-full max-w-sm rounded-2xl border border-border/70 bg-card p-8 text-center shadow-sm">
        {phase === "working" ? (
          <div
            className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-sky-500/25 border-t-sky-500"
            aria-hidden
          />
        ) : null}
        <p className="text-sm font-semibold text-foreground">{message}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {phase === "working" ? copy.almostThere : copy.redirectLogin}
        </p>
      </div>
    </div>
  );
}
