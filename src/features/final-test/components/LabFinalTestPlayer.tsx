"use client";

import { stepHref } from "@/src/features/chat-lesson/content/level1";
import { MISSION_1_FINAL_TEST } from "@/src/features/final-test/content/mission1FinalTest";
import { FinalTestPlayer } from "@/src/features/final-test/components/FinalTestPlayer";

export function LabFinalTestPlayer({ levelHref }: { levelHref: string }) {
  return <FinalTestPlayer test={MISSION_1_FINAL_TEST} backHref={levelHref} practiceHref={stepHref} />;
}
