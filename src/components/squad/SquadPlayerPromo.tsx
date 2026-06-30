"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMySquadStatus } from "@/src/lib/api/squad";
import { SQUAD_UI } from "@/src/lib/squad-ui-copy";

export function SquadPlayerPromo() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMySquadStatus()
      .then((status) => {
        if (!cancelled) setShow(!status.inSquad);
      })
      .catch(() => {
        if (!cancelled) setShow(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!show) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-300/40 bg-gradient-to-br from-indigo-50 to-violet-50 p-5 dark:border-indigo-800/40 dark:from-indigo-950/50 dark:to-violet-950/30">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/15">
          <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-indigo-950 dark:text-indigo-100">
            {SQUAD_UI.playerPromoTitle}
          </p>
          <p className="mt-1 text-xs text-indigo-800/80 dark:text-indigo-200/80">
            {SQUAD_UI.playerPromoBody}
          </p>
          <Button asChild size="sm" className="mt-3 rounded-xl">
            <Link href="/squad">{SQUAD_UI.viewSquad}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
