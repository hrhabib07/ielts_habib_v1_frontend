"use client";

import { useEffect, useMemo } from "react";
import type { PlayerCourseMap, PlayerMapMission } from "@/src/lib/api/player";
import { PaidMissionUnlockFlow } from "@/src/components/player/PaidMissionUnlockFlow";

export function PlayerSubscribeModal({
  mission,
  map,
  onClose,
}: {
  mission: PlayerMapMission | null;
  /** When provided · avoids an extra map fetch for progress numbers. */
  map?: PlayerCourseMap | null;
  onClose: () => void;
}) {
  const open = mission !== null;

  const progress = useMemo(() => {
    if (!map) return null;
    const flat = map.camps.flatMap((camp) => camp.missions);
    const done = flat.filter((m) => m.status === "completed").length;
    return {
      missionsDone: Math.max(done, 1),
      missionsTotal: flat.length > 0 ? flat.length : 21,
    };
  }, [map]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mission) return null;

  return (
    <PaidMissionUnlockFlow
      onLater={onClose}
      missionsDone={progress?.missionsDone}
      missionsTotal={progress?.missionsTotal}
    />
  );
}
