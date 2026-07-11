"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMySquadStatus } from "@/src/lib/api/squad";
import { useSquadUiCopy } from "@/src/hooks/useLocalizedCopy";
import { brandSurfaces } from "@/src/lib/brand-theme";
import { cn } from "@/lib/utils";

export function SquadPlayerPromo() {
  const SQUAD_UI = useSquadUiCopy();
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
    <div className={cn("overflow-hidden rounded-2xl p-5", brandSurfaces.premiumBanner)}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">
            {SQUAD_UI.playerPromoTitle}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {SQUAD_UI.playerPromoBody}
          </p>
          <Button asChild size="sm" variant="outline" className="mt-3 rounded-xl border-primary/25">
            <Link href="/squad">{SQUAD_UI.viewSquad}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
