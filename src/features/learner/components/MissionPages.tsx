"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LabStepPlayer } from "@/src/features/chat-lesson/components/LabStepPlayer";
import { LevelMap } from "@/src/features/chat-lesson/components/LevelMap";
import { STEP_AUDIO } from "@/src/features/chat-lesson/content/audio";
import { INTRO_STEP } from "@/src/features/chat-lesson/content/introStep";
import { LESSON_STEPS } from "@/src/features/chat-lesson/content/level1";
import { useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { useMissionStore } from "@/src/features/chat-lesson/hooks/useMissionStore";
import { builtInLevel } from "@/src/features/chat-lesson/lib/levelData";
import { FinalTestPlayer } from "@/src/features/final-test/components/FinalTestPlayer";
import { MISSION_1_FINAL_TEST } from "@/src/features/final-test/content/mission1FinalTest";
import { LearnerOnboarding } from "@/src/features/learner/components/LearnerOnboarding";
import { LearnerProfileHost } from "@/src/features/learner/components/LearnerProfileCard";
import { MISSION_BASE, MissionShell, missionHref, type MissionShellContext } from "@/src/features/learner/components/MissionShell";
import { PhotoPrompt } from "@/src/features/learner/components/PhotoPrompt";
import { UnlockChat } from "@/src/features/learner/components/UnlockChat";
import { UNLOCK_HREF } from "@/src/features/learner/lib/routes";
import { LabPlaygroundPlayer } from "@/src/features/playground/components/LabPlaygroundPlayer";
import { PLAYGROUNDS } from "@/src/features/playground/content";

const PHOTO_PROMPT_DELAY_MS = 2800;
const MAX_PHOTO_PROMPTS = 2;
/** The free trial ends with the Number game: the payment chat opens after its celebration. */
const LAST_FREE_GAME_ID = "level-1-playground-number";
const UNLOCK_DELAY_MS = 3400;

function Redirect({ href }: { href: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(href);
  }, [href, router]);
  return null;
}

function MapScreen({ ctx }: { ctx: MissionShellContext }) {
  const params = useSearchParams();
  const lang = useLessonLanguage();
  const completed = params.get("completed");
  const { level, summaries } = useMemo(() => builtInLevel(missionHref), []);
  const celebrateStepId = completed && summaries[completed] ? completed : null;
  const [promptOpen, setPromptOpen] = useState(false);

  const router = useRouter();
  const learnerData = ctx.state.learner;
  const wantsUnlock =
    celebrateStepId === LAST_FREE_GAME_ID &&
    !ctx.state.hasPaidAccess &&
    ctx.state.payment.latest?.status !== "PENDING";
  const wantsPhoto =
    !wantsUnlock &&
    Boolean(celebrateStepId && PLAYGROUNDS[celebrateStepId]) &&
    Boolean(learnerData) &&
    !learnerData?.photoUrl &&
    (learnerData?.photoPromptCount ?? 0) < MAX_PHOTO_PROMPTS;

  useEffect(() => {
    if (!wantsPhoto) return;
    const timer = window.setTimeout(() => setPromptOpen(true), PHOTO_PROMPT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [wantsPhoto]);

  useEffect(() => {
    if (!wantsUnlock) return;
    const timer = window.setTimeout(() => router.push(UNLOCK_HREF), UNLOCK_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [wantsUnlock, router]);

  if (!ctx.learner) return <Redirect href={missionHref(INTRO_STEP.id)} />;

  return (
    <>
      <LevelMap
        level={level}
        summaries={summaries}
        celebrateStepId={celebrateStepId}
        contentSource="built-in"
        backHref="/player"
      />
      <LearnerProfileHost />
      {promptOpen ? (
        <PhotoPrompt
          learner={ctx.learner}
          lang={lang}
          onUpload={ctx.uploadPhoto}
          onLater={() => {
            setPromptOpen(false);
            void ctx.dismissPhotoPrompt().catch(() => undefined);
          }}
          onClose={() => setPromptOpen(false)}
        />
      ) : null}
    </>
  );
}

function UnlockScreen({ ctx }: { ctx: MissionShellContext }) {
  // Decided once: claiming free access mid-chat must not bounce the learner away from the reply.
  const [alreadyUnlocked] = useState(ctx.state.hasPaidAccess);
  if (!ctx.learner) return <Redirect href={missionHref(INTRO_STEP.id)} />;
  if (alreadyUnlocked) return <Redirect href={MISSION_BASE} />;
  return <UnlockChat ctx={ctx} learner={ctx.learner} backHref={MISSION_BASE} />;
}

function StepScreen({ ctx, stepId }: { ctx: MissionShellContext; stepId: string }) {
  const { isPaywalled } = useMissionStore();
  const isIntro = stepId === INTRO_STEP.id;
  const [onboarding, setOnboarding] = useState(() => isIntro && !ctx.learner);

  if (onboarding) {
    const existing = ctx.state.learner;
    return (
      <LearnerOnboarding
        suggestedNameEn={ctx.state.suggestedNameEn}
        initial={
          existing
            ? {
                nicknameEn: existing.nicknameEn,
                nicknameBn: existing.nicknameBn,
                addressAs: existing.addressAs,
                district: existing.district,
                country: existing.country,
              }
            : null
        }
        onSave={ctx.saveProfile}
        onDone={() => setOnboarding(false)}
      />
    );
  }

  if (!ctx.learner) return <Redirect href={missionHref(INTRO_STEP.id)} />;
  if (isPaywalled(stepId)) return <UnlockChat ctx={ctx} learner={ctx.learner} backHref={MISSION_BASE} />;

  if (PLAYGROUNDS[stepId]) return <LabPlaygroundPlayer playgroundId={stepId} levelHref={MISSION_BASE} />;

  if (stepId === MISSION_1_FINAL_TEST.id) {
    return <FinalTestPlayer test={MISSION_1_FINAL_TEST} backHref={MISSION_BASE} practiceHref={missionHref} />;
  }

  const step = LESSON_STEPS[stepId];
  if (!step) return <Redirect href={MISSION_BASE} />;
  return <LabStepPlayer step={step} audio={STEP_AUDIO[step.id]} levelHref={MISSION_BASE} />;
}

export function MissionMapPage() {
  return <MissionShell>{(ctx) => <MapScreen ctx={ctx} />}</MissionShell>;
}

export function MissionStepPage({ stepId }: { stepId: string }) {
  return <MissionShell>{(ctx) => <StepScreen ctx={ctx} stepId={stepId} />}</MissionShell>;
}

export function MissionUnlockPage() {
  return <MissionShell>{(ctx) => <UnlockScreen ctx={ctx} />}</MissionShell>;
}
