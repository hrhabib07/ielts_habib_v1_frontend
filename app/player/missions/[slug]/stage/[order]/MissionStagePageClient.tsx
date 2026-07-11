"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPlayerStage, type PlayerStageContent } from "@/src/lib/api/player";
import { MissionStageRunner } from "@/src/components/player/MissionStageRunner";
import { PlayerSubscriptionGate } from "@/src/components/player/PlayerSubscriptionGate";
import { usePlayerUiCopy } from "@/src/hooks/useLocalizedCopy";
import { getDecodedTokenClient } from "@/src/lib/auth";
import { Button } from "@/components/ui/button";
import {
  isPlayerSubscriptionRequiredError,
  playerApiErrorMessage,
} from "@/src/lib/player-access-errors";

export default function MissionStagePageClient({
  missionSlug,
  stageOrder,
}: {
  missionSlug: string;
  stageOrder: number;
}) {
  const PLAYER_UI = usePlayerUiCopy();
  const router = useRouter();
  const [content, setContent] = useState<PlayerStageContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getDecodedTokenClient();
    if (!token || token.role !== "STUDENT") {
      router.replace(
        `/login?next=/player/missions/${missionSlug}/stage/${stageOrder}`,
      );
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setNeedsSubscription(false);
    setContent(null);

    getPlayerStage(missionSlug, stageOrder)
      .then((data) => {
        if (!cancelled) setContent(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (isPlayerSubscriptionRequiredError(err)) {
          setNeedsSubscription(true);
          return;
        }
        setError(playerApiErrorMessage(err, PLAYER_UI.couldNotContinue));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [missionSlug, stageOrder, router, PLAYER_UI.couldNotContinue]);

  if (needsSubscription) {
    return <PlayerSubscriptionGate />;
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/player">{PLAYER_UI.backToMap}</Link>
        </Button>
      </div>
    );
  }

  if (loading || !content) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        {PLAYER_UI.loadingStage}
      </div>
    );
  }

  return <MissionStageRunner content={content} />;
}
