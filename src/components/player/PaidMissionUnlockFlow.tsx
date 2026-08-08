"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MissionOnePaywallFlow } from "@/src/components/player/MissionOnePaywallFlow";
import { getPlayerCourseMap } from "@/src/lib/api/player";
import {
  MISSION_ONE_PAYWALL_COPY,
  readMissionCompletionScore,
  type MissionOnePaywallScore,
} from "@/src/lib/mission-one-paywall";

const FREE_MISSION_SLUG = "mission-01-word-order";
const DEFAULT_MISSIONS_TOTAL = 21;

/**
 * Same multi-step unlock journey used after Mission 01 · reused when
 * existing free users open a paid mission from the map or a deep link.
 */
export function PaidMissionUnlockFlow({
  onLater,
  missionsDone: missionsDoneProp,
  missionsTotal: missionsTotalProp,
  score: scoreProp,
}: {
  onLater: () => void;
  missionsDone?: number;
  missionsTotal?: number;
  score?: MissionOnePaywallScore | null;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(
    missionsDoneProp != null && missionsTotalProp != null,
  );
  const [missionsDone, setMissionsDone] = useState(missionsDoneProp ?? 1);
  const [missionsTotal, setMissionsTotal] = useState(
    missionsTotalProp ?? DEFAULT_MISSIONS_TOTAL,
  );
  const [score, setScore] = useState<MissionOnePaywallScore | null>(
    scoreProp ?? null,
  );

  useEffect(() => {
    if (scoreProp !== undefined) {
      setScore(scoreProp);
      return;
    }
    setScore(readMissionCompletionScore(FREE_MISSION_SLUG));
  }, [scoreProp]);

  useEffect(() => {
    if (missionsDoneProp != null && missionsTotalProp != null) {
      setMissionsDone(missionsDoneProp);
      setMissionsTotal(missionsTotalProp);
      setReady(true);
      return;
    }

    let cancelled = false;
    void getPlayerCourseMap()
      .then((map) => {
        if (cancelled) return;
        const flat = map.camps.flatMap((camp) => camp.missions);
        const done = flat.filter((m) => m.status === "completed").length;
        setMissionsDone(Math.max(done, 1));
        setMissionsTotal(flat.length > 0 ? flat.length : DEFAULT_MISSIONS_TOTAL);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setMissionsDone(1);
        setMissionsTotal(DEFAULT_MISSIONS_TOTAL);
        setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [missionsDoneProp, missionsTotalProp]);

  const handleLater = () => {
    onLater();
    if (typeof window !== "undefined" && window.location.pathname !== "/player") {
      router.push("/player");
    }
  };

  if (!ready) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/25 border-t-amber-300" />
      </div>
    );
  }

  return (
    <MissionOnePaywallFlow
      score={score}
      missionsDone={missionsDone}
      missionsTotal={missionsTotal}
      onLater={handleLater}
      checkoutHref={MISSION_ONE_PAYWALL_COPY.gateCheckoutHref}
    />
  );
}
