"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, getDecodedTokenClient, getTokenFromClient } from "@/src/lib/auth";
import type { CurrentUser } from "@/src/lib/auth-server";

function isClientTokenUsable(): boolean {
  const decoded = getDecodedTokenClient();
  if (!decoded || typeof decoded.exp !== "number") return false;
  return decoded.exp * 1000 >= Date.now();
}

/**
 * If the server didn't see a user but the client has a token (e.g. old session without httpOnly cookie),
 * sync the token to the server cookie and refresh so layout gets initialUser.
 */
export function SyncAuthCookie({ initialUser }: { initialUser: CurrentUser | null }) {
  const router = useRouter();
  const synced = useRef(false);

  useEffect(() => {
    if (initialUser != null || synced.current) return;
    const token = getTokenFromClient();
    if (!token) return;

    if (!isClientTokenUsable()) {
      clearAuth();
      void fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      return;
    }

    synced.current = true;
    fetch("/api/auth/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      credentials: "same-origin",
    }).then(() => {
      router.refresh();
    });
  }, [initialUser, router]);

  return null;
}
