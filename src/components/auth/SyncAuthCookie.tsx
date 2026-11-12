"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearAuth,
  getDecodedTokenClient,
  getTokenFromClient,
  hasUsableClientToken,
  hydrateAccessTokenFromCookie,
  isLogoutLocked,
} from "@/src/lib/auth";
import { persistSessionToken } from "@/src/lib/auth-session-ready";
import type { CurrentUser } from "@/src/lib/auth-server";

const AUTH_PATH_PREFIXES = [
  "/login",
  "/register",
  "/verify-otp",
  "/forgot-password",
  "/verify-reset-otp",
  "/reset-password",
  "/auth/",
];

function isClientTokenUsable(): boolean {
  const decoded = getDecodedTokenClient();
  if (!decoded || typeof decoded.exp !== "number") return false;
  return decoded.exp * 1000 >= Date.now();
}

/**
 * Keeps localStorage Bearer and httpOnly cookie in sync after login / tab return.
 * 1) Client token, no server user → sync cookie (with retries) + refresh
 * 2) Server user, no client token → hydrate Bearer from cookie
 * 3) Expired client token → clear both stores
 * Re-runs on navigation until the cookie is confirmed, so a missed sync at
 * login does not lock the user out of cookie-gated routes like /profile.
 */
export function SyncAuthCookie({ initialUser }: { initialUser: CurrentUser | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const inFlight = useRef(false);
  const settledToken = useRef<string | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (inFlight.current) return;

    async function alignSession() {
      if (isLogoutLocked()) return;
      // /login owns recovery (useLoginSessionRecovery); a parallel refresh here
      // would race it and drop the ?next= destination.
      if (AUTH_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return;

      const clientToken = getTokenFromClient();

      if (clientToken && !isClientTokenUsable()) {
        clearAuth();
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
        }).catch(() => undefined);
        return;
      }

      if (initialUser == null && hasUsableClientToken() && clientToken) {
        if (settledToken.current === clientToken) return;
        const synced = await persistSessionToken(clientToken, {
          attempts: 3,
          timeoutMs: 5000,
        });
        if (synced.ok) {
          settledToken.current = clientToken;
          router.refresh();
        } else if (synced.code === "TOKEN_REJECTED") {
          settledToken.current = clientToken;
        }
        return;
      }

      if (initialUser != null && !hasUsableClientToken()) {
        if (hydrated.current) return;
        hydrated.current = true;
        const token = await hydrateAccessTokenFromCookie();
        if (!token) {
          // Server thought we were logged in but cookie is invalid
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "same-origin",
            cache: "no-store",
          }).catch(() => undefined);
          router.refresh();
        }
      }
    }

    inFlight.current = true;
    void alignSession().finally(() => {
      inFlight.current = false;
    });
  }, [initialUser, router, pathname]);

  return null;
}
