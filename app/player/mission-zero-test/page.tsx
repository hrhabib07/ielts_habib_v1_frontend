"use client";

import { MissionZeroDemo } from "@/src/components/demo/MissionZeroDemo";

/** Authenticated play of the third-person singular demo test. */
export default function PlayerMissionZeroTestPage() {
  return <MissionZeroDemo mode="authenticated" variant="third-person" />;
}
