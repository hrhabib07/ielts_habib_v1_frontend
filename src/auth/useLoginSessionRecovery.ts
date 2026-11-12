"use client";

import { useEffect, useState } from "react";
import {
  getDecodedTokenClient,
  getTokenFromClient,
  hasUsableClientToken,
  isLogoutLocked,
} from "@/src/lib/auth";
import { persistSessionToken } from "@/src/lib/auth-session-ready";
import {
  getRedirectPathForRole,
  readAuthReturnPathFromSearch,
} from "@/src/lib/auth-redirects";

import type { UserRole } from "@/src/lib/constants";

const RECOVERY_GUARD_KEY = "gamlish_login_recovery_at";
const RECOVERY_COOLDOWN_MS = 20_000;

function isUserRole(value: string): value is UserRole {
  return value === "STUDENT" || value === "INSTRUCTOR" || value === "ADMIN";
}

function recoveredRecently(): boolean {
  try {
    const at = Number(sessionStorage.getItem(RECOVERY_GUARD_KEY) ?? 0);
    return Date.now() - at < RECOVERY_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function markRecoveryAttempt(): void {
  try {
    sessionStorage.setItem(RECOVERY_GUARD_KEY, String(Date.now()));
  } catch {
    /* private mode */
  }
}

/**
 * Middleware gates /profile, /certification, /onboarding and /dashboard on the
 * httpOnly cookie, while the rest of the app uses the localStorage Bearer. When a
 * signed-in user lands on /login only because the cookie is missing, restore it
 * and send them back instead of showing the login form.
 * The cooldown stops a redirect loop if the server keeps rejecting the cookie.
 */
let recoveryInFlight: Promise<string | null> | null = null;

function startRecovery(): Promise<string | null> | null {
  const params = new URLSearchParams(window.location.search);
  if (params.get("loggedOut") === "1" || params.get("error")) return null;
  if (isLogoutLocked() || !hasUsableClientToken()) return null;
  if (recoveredRecently()) return null;

  const token = getTokenFromClient();
  const role = String(getDecodedTokenClient()?.role ?? "").toUpperCase();
  if (!token || !isUserRole(role)) return null;

  markRecoveryAttempt();
  return persistSessionToken(token, { attempts: 3, timeoutMs: 5000 }).then(
    (result) =>
      result.ok
        ? (readAuthReturnPathFromSearch(params) ?? getRedirectPathForRole(role))
        : null,
  );
}

export function useLoginSessionRecovery(): boolean {
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    // Shared across Strict Mode remounts so one attempt drives the redirect.
    recoveryInFlight ??= startRecovery();
    const pending = recoveryInFlight;
    if (!pending) return;

    let active = true;
    setRecovering(true);
    void pending.then((destination) => {
      if (recoveryInFlight === pending) recoveryInFlight = null;
      if (destination) {
        window.location.replace(destination);
        return;
      }
      if (active) setRecovering(false);
    });

    return () => {
      active = false;
    };
  }, []);

  return recovering;
}
