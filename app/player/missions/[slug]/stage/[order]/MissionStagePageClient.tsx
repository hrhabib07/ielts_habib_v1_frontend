"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPlayerStage, type PlayerStageContent } from "@/src/lib/api/player";
import { MissionStageRunner } from "@/src/components/player/MissionStageRunner";
import { PLAYER_UI } from "@/src/lib/player-ui-copy";
import { getDecodedTokenClient } from "@/src/lib/auth";

export default function MissionStagePageClient({
  missionSlug,
  stageOrder,
}: {
  missionSlug: string;
  stageOrder: number;
}) {
  const router = useRouter();
  const [content, setContent] = useState<PlayerStageContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getDecodedTokenClient();
    if (!token || token.role !== "STUDENT") {
      router.replace(`/login?next=/player/missions/${missionSlug}/stage/${stageOrder}`);
      return;
    }
    let cancelled = false;
    getPlayerStage(missionSlug, stageOrder)
      .then((data) => {
        if (!cancelled) setContent(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "ধাপ লোড করা যায়নি");
      });
    return () => {
      cancelled = true;
    };
  }, [missionSlug, stageOrder, router]);

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 text-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        {PLAYER_UI.loadingStage}
      </div>
    );
  }

  return <MissionStageRunner content={content} />;
}
