"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getTokenFromClient } from "@/src/lib/auth";
import type { CurrentUser } from "@/src/lib/auth-server";

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
