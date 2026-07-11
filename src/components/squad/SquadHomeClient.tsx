"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMySquadDetail } from "@/src/lib/api/squad";
import { useSquadUiCopy } from "@/src/hooks/useLocalizedCopy";
import { SquadDetailView } from "@/src/components/squad/SquadDetailView";
import { getDecodedTokenClient } from "@/src/lib/auth";

export function SquadHomeClient() {
  const SQUAD_UI = useSquadUiCopy();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [squad, setSquad] = useState<Awaited<ReturnType<typeof getMySquadDetail>>>(null);

  const load = useCallback(async () => {
    const token = getDecodedTokenClient();
    if (!token || token.role !== "STUDENT") {
      router.replace("/login?next=/squad");
      return;
    }
    setLoading(true);
    try {
      const data = await getMySquadDetail();
      setSquad(data);
    } catch {
      setSquad(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 font-bengali">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="mt-4 h-40 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!squad) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center font-bengali sm:py-16">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Users className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black text-foreground">{SQUAD_UI.emptyTitle}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{SQUAD_UI.emptyBody}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="rounded-2xl font-bold">
            <Link href="/squad/create">{SQUAD_UI.createSquad}</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-2xl font-bold">
            <Link href="/squad/join">{SQUAD_UI.joinSquad}</Link>
          </Button>
        </div>
        <Button asChild variant="ghost" className="mt-4">
          <Link href="/squad/leaderboard">{SQUAD_UI.weeklyLeaderboard}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 font-bengali sm:max-w-2xl sm:py-10">
      <SquadDetailView squad={squad} showManage onRefresh={load} />
    </div>
  );
}
