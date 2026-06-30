"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getMySquadStatus, type SquadStatus } from "@/src/lib/api/squad";
import { SQUAD_BADGE_LABELS, SQUAD_UI } from "@/src/lib/squad-ui-copy";

export function ProfileSquadSection() {
  const [status, setStatus] = useState<SquadStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMySquadStatus()
      .then(setStatus)
      .catch(() => setStatus({ inSquad: false }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-28 animate-pulse rounded-2xl bg-muted/40" />;
  }

  if (!status?.inSquad) {
    return (
      <Card className="border-dashed p-5 font-bengali">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-5 w-5 text-indigo-500" />
          <div className="flex-1">
            <h3 className="font-bold">{SQUAD_UI.profileSquad}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{SQUAD_UI.noSquadProfile}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm" className="rounded-xl">
                <Link href="/squad/create">{SQUAD_UI.createSquad}</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-xl">
                <Link href="/squad/join">{SQUAD_UI.joinSquad}</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 font-bengali">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-bold">
            <Shield className="h-4 w-4 text-indigo-500" />
            {SQUAD_UI.profileSquad}
          </h3>
          <p className="mt-1 text-lg font-black text-foreground">{status.squadName}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {status.highestBadge ? (
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 font-semibold text-indigo-700 dark:text-indigo-300">
                {SQUAD_BADGE_LABELS[status.highestBadge] ?? status.highestBadge}
              </span>
            ) : null}
            {status.weeklyRank ? (
              <span>র‍্যাঙ্ক #{status.weeklyRank}</span>
            ) : null}
            <span>
              {SQUAD_UI.yourWeekly}: {status.weeklyContribution ?? 0} XP
            </span>
            <span>
              {SQUAD_UI.yourLifetime}: {status.lifetimeContribution ?? 0} XP
            </span>
          </div>
        </div>
        <Button asChild size="sm" variant="outline" className="shrink-0 rounded-xl">
          <Link href="/squad">{SQUAD_UI.viewSquad}</Link>
        </Button>
      </div>
    </Card>
  );
}
