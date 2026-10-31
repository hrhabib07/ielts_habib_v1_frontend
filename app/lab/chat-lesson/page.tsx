import type { Metadata } from "next";
import { LevelMap } from "@/src/features/chat-lesson/components/LevelMap";
import { LESSON_STEPS, LEVEL_1 } from "@/src/features/chat-lesson/content/level1";
import { loadLevel } from "@/src/features/chat-lesson/lib/loadChatLessons";

export const metadata: Metadata = {
  title: "Chat lesson lab",
  robots: { index: false, follow: false, nocache: true },
};

type Props = { searchParams: Promise<{ completed?: string | string[] }> };

/** Internal prototype of the Level 1 path. Not linked anywhere; no login needed. */
export default async function ChatLessonLevelPage({ searchParams }: Props) {
  const [{ completed }, { level, summaries, source }] = await Promise.all([
    searchParams,
    loadLevel(LEVEL_1.id),
  ]);
  const celebrateStepId =
    typeof completed === "string" && (summaries[completed] || LESSON_STEPS[completed]) ? completed : null;

  return (
    <LevelMap level={level} summaries={summaries} celebrateStepId={celebrateStepId} contentSource={source} />
  );
}
