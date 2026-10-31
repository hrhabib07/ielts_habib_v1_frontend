"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getChatMissionState } from "@/src/lib/api/chatMission";
import { getDecodedTokenClient, hydrateAccessTokenFromCookie } from "@/src/lib/auth";

type Gate = "checking" | "legacy" | "moved";

/**
 * Old mission routes. While the new chat Mission 1 is live for this account, everyone goes to
 * /player instead (paid or not). If the rollout is off, or the check fails, the old page shows.
 */
export function LegacyMissionGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [gate, setGate] = useState<Gate>("checking");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getDecodedTokenClient()) await hydrateAccessTokenFromCookie();
      if (!getDecodedTokenClient()) return "legacy" as const;
      const state = await getChatMissionState();
      return state.enabled ? ("moved" as const) : ("legacy" as const);
    })()
      .catch(() => "legacy" as const)
      .then((next) => {
        if (cancelled) return;
        setGate(next);
        if (next === "moved") router.replace("/player");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (gate === "legacy") return <>{children}</>;
  return (
    <div className="flex min-h-[60dvh] items-center justify-center" aria-busy>
      <span className="size-9 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" aria-hidden />
    </div>
  );
}
