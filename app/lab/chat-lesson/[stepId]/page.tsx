import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LabStepPlayer } from "@/src/features/chat-lesson/components/LabStepPlayer";
import { LEVEL_HREF } from "@/src/features/chat-lesson/content/level1";
import { loadStep } from "@/src/features/chat-lesson/lib/loadChatLessons";
import { LabFinalTestPlayer } from "@/src/features/final-test/components/LabFinalTestPlayer";
import { MISSION_1_FINAL_TEST } from "@/src/features/final-test/content/mission1FinalTest";
import { LabPlaygroundPlayer } from "@/src/features/playground/components/LabPlaygroundPlayer";
import { PLAYGROUNDS } from "@/src/features/playground/content";

type Params = { params: Promise<{ stepId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { stepId } = await params;
  const robots = { index: false, follow: false, nocache: true };
  const playground = PLAYGROUNDS[stepId]?.playground;
  if (playground) return { title: `${playground.title.en} · Chat lesson lab`, robots };
  if (stepId === MISSION_1_FINAL_TEST.id) return { title: `${MISSION_1_FINAL_TEST.title.en} · Chat lesson lab`, robots };
  const loaded = await loadStep(stepId);
  return {
    title: loaded ? `${loaded.step.stepLabel} · ${loaded.step.title.en} · Chat lesson lab` : "Chat lesson lab",
    robots,
  };
}

/** Plays the current published version from the database, or the built-in copy if it is unreachable. */
export default async function ChatLessonStepPage({ params }: Params) {
  const { stepId } = await params;
  if (PLAYGROUNDS[stepId]) return <LabPlaygroundPlayer playgroundId={stepId} levelHref={LEVEL_HREF} />;
  if (stepId === MISSION_1_FINAL_TEST.id) return <LabFinalTestPlayer levelHref={LEVEL_HREF} />;

  const loaded = await loadStep(stepId);
  if (!loaded) notFound();

  return <LabStepPlayer step={loaded.step} audio={loaded.audio} levelHref={LEVEL_HREF} />;
}
