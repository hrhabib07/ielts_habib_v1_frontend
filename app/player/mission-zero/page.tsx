"use client";

import { MissionZeroDemo } from "@/src/components/demo/MissionZeroDemo";
import { LegacyMissionGate } from "@/src/features/learner/components/LegacyMissionGate";

export default function PlayerMissionZeroPage() {
  return (
    <LegacyMissionGate>
      <MissionZeroDemo mode="authenticated" />
    </LegacyMissionGate>
  );
}
