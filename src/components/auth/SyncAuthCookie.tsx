"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  clearAuth,
  getDecodedTokenClient,
  getTokenFromClient,
  hasUsableClientToken,
  hydrateAccessTokenFromCookie,
  syncAuthCookie,
} from "@/src/lib/auth";
import type { CurrentUser } from "@/src/lib/auth-server";

function isClientTokenUsable(): boolean {
  const decoded = getDecodedTokenClient();
  if (!decoded || typeof decoded.exp !== "number") return false;
  return decoded.exp * 1000 >= Date.now();
}

/**
 * Keeps localStorage Bearer and httpOnly cookie in sync after login / tab return.
 * 1) Client token, no server user → sync cookie + refresh
 * 2) Server user, no client token → hydrate Bearer from cookie
 * 3) Expired client token → clear both stores
 */
export function SyncAuthCookie({ initialUser }: { initialUser: CurrentUser | null }) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    let cancelled = false;

    async function alignSession() {
      const clientToken = getTokenFromClient();

      if (clientToken && !isClientTokenUsable()) {
        clearAuth();
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "same-origin",
        }).catch(() => undefined);
        return;
      }

      if (initialUser == null && hasUsableClientToken() && clientToken) {
        const synced = await syncAuthCookie(clientToken);
        if (!cancelled && synced.ok) {
          router.refresh();
        }
        return;
      }

      if (initialUser != null && !hasUsableClientToken()) {
        const token = await hydrateAccessTokenFromCookie();
        if (!cancelled && !token) {
          // Server thought we were logged in but cookie is invalid
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "same-origin",
          }).catch(() => undefined);
          router.refresh();
        }
      }
    }

    void alignSession();
    return () => {
      cancelled = true;
    };
  }, [initialUser, router]);

  return null;
}
