"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Lock, PartyPopper, Sparkles } from "lucide-react";
import { GuideAvatarPreview } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { LANG_FACE, pick } from "@/src/features/chat-lesson/lib/uiCopy";
import { LearnerAvatarButton } from "@/src/features/learner/components/LearnerAvatar";
import { LearnerProfileHost } from "@/src/features/learner/components/LearnerProfileCard";
import { LearnerProvider, type LearnerActions } from "@/src/features/learner/LearnerContext";
import { learnerProgressOf } from "@/src/features/learner/lib/learnerProgress";
import { resizePhoto } from "@/src/features/learner/lib/resizePhoto";
import { NextLevelSoon } from "@/src/features/learner/components/NextLevelSoon";
import { HOME_UI } from "@/src/features/learner/lib/copy";
import { toLearner } from "@/src/features/learner/lib/fromApi";
import {
  FINAL_TEST_PASS_MARK,
  FINAL_TEST_STEP_ID,
  LEVEL_ONE_TITLE,
  LEVEL_ONE_TOPICS,
} from "@/src/features/learner/lib/levels";
import { personalizeText, type Learner } from "@/src/features/learner/lib/personalize";
import { MISSION_BASE, missionHref } from "@/src/features/learner/lib/routes";
import {
  saveChatMissionProfile,
  uploadChatMissionPhoto,
  type ChatMissionLearner,
  type ChatMissionState,
} from "@/src/lib/api/chatMission";
import { cn } from "@/lib/utils";

type EnabledState = Extract<ChatMissionState, { enabled: true }>;

const EN_FACE = LANG_FACE.en;
const RISE = { type: "spring", stiffness: 260, damping: 26 } as const;

function levelOneProgress(state: EnabledState) {
  const done = LEVEL_ONE_TOPICS.filter(({ stepId }) => {
    const result = state.results[stepId];
    if (!result) return false;
    if (stepId !== FINAL_TEST_STEP_ID) return true;
    return result.max > 0 && result.score / result.max >= FINAL_TEST_PASS_MARK;
  }).length;
  const next =
    LEVEL_ONE_TOPICS.find(({ stepId }) => {
      const result = state.results[stepId];
      if (!result) return true;
      return stepId === FINAL_TEST_STEP_ID && result.score / Math.max(result.max, 1) < FINAL_TEST_PASS_MARK;
    }) ?? null;
  return { done, next };
}

/** Same shape as the home, shown only on the very first visit before anything is cached. */
export function LevelsHomeSkeleton() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-sky-50 via-white to-white" aria-busy>
      <div className="mx-auto w-full max-w-md animate-pulse px-4 pb-16 pt-5">
        <div className="flex items-center gap-3">
          <span className="size-12 rounded-full bg-sky-100" />
          <div className="flex-1 space-y-2">
            <span className="block h-5 w-3/4 rounded-lg bg-slate-200/80" />
            <span className="block h-3.5 w-1/2 rounded-lg bg-slate-100" />
          </div>
        </div>
        <div className="mt-6 h-64 rounded-[1.75rem] bg-sky-200/70" />
      </div>
    </div>
  );
}

/** The /player home. One next step · one button. */
export function LevelsHome({ state }: { state: EnabledState }) {
  const [saved, setSaved] = useState<ChatMissionLearner | null>(null);
  const learnerData = saved ?? state.learner;
  const learner = useMemo(() => toLearner(learnerData), [learnerData]);
  const progress = useMemo(() => learnerProgressOf(state), [state]);
  const actions = useMemo<LearnerActions>(
    () => ({
      saveProfile: async (input) => setSaved(await saveChatMissionProfile(input)),
      uploadPhoto: async (file) => setSaved(await uploadChatMissionPhoto(await resizePhoto(file))),
    }),
    [],
  );

  if (!learner) return <LevelsHomeView state={state} learner={null} />;
  return (
    <LearnerProvider learner={learner} actions={actions} progress={progress}>
      <LevelsHomeView state={state} learner={learner} />
      <LearnerProfileHost />
    </LearnerProvider>
  );
}

function LevelsHomeView({ state, learner }: { state: EnabledState; learner: Learner | null }) {
  const lang = useLessonLanguage();
  const face = LANG_FACE[lang];
  const reduceMotion = useReducedMotion();
  const { done, next } = levelOneProgress(state);
  const total = LEVEL_ONE_TOPICS.length;
  const pct = Math.round((done / total) * 100);
  const complete = next === null;
  const started = done > 0;

  const greeting = learner ? personalizeText(HOME_UI.greetKnown, learner) : HOME_UI.greetNew;
  const cta = complete ? HOME_UI.review : started ? HOME_UI.continue : HOME_UI.start;
  const ctaHref = complete ? MISSION_BASE : next ? missionHref(next.stepId) : MISSION_BASE;
  const enter = (delay: number) =>
    reduceMotion
      ? {}
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { ...RISE, delay } };

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-sky-50 via-white to-white">
      <div className="mx-auto w-full max-w-md px-4 pb-16 pt-5">
        <motion.header className="flex items-start gap-3" {...enter(0)}>
          {learner ? <LearnerAvatarButton size="md" className="mt-0" /> : <GuideAvatarPreview />}
          <div className="min-w-0 flex-1 pt-0.5">
            <h1 className={cn(face, "text-[1.35rem] font-black leading-snug text-slate-900")}>
              {pick(greeting, lang)}
            </h1>
            <p className={cn(face, "mt-0.5 text-sm font-semibold leading-snug text-slate-500")}>
              {pick(HOME_UI.sub, lang)}
            </p>
          </div>
        </motion.header>

        <motion.section
          className="relative mt-6 overflow-hidden rounded-[1.75rem] border-b-[6px] border-sky-800 bg-sky-600 p-5 text-white shadow-[0_18px_40px_-18px_rgba(2,132,199,0.55)]"
          {...enter(0.06)}
        >
          <div className="relative flex flex-wrap items-center gap-2">
            <span
              className={cn(
                face,
                "rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider",
              )}
            >
              {pick(HOME_UI.levelOneTag, lang)}
            </span>
            {!state.hasPaidAccess ? (
              <span
                className={cn(
                  face,
                  "flex items-center gap-1 rounded-full bg-emerald-400 px-2.5 py-1 text-[11px] font-black text-emerald-950",
                )}
              >
                <Sparkles className="size-3" aria-hidden />
                {pick(HOME_UI.freeStart, lang)}
              </span>
            ) : null}
          </div>

          <h2 className={cn(face, "relative mt-3 text-[1.55rem] font-black leading-tight")}>
            {pick(LEVEL_ONE_TITLE, lang)}
          </h2>
          <p className={cn(face, "relative mt-2 text-sm font-semibold text-sky-100")}>
            {pick(HOME_UI.howItWorks, lang)}
          </p>

          {!complete ? (
            <div className="relative mt-5 rounded-2xl bg-white px-4 py-3.5 text-slate-900">
              <p
                className={cn(
                  face,
                  "text-[11px] font-black uppercase tracking-[0.14em] text-sky-700",
                )}
              >
                {pick(HOME_UI.nextLabel, lang)}
              </p>
              <p className={cn(face, "mt-1 text-xl font-black leading-snug")}>
                {next ? pick(next.title, lang) : pick(LEVEL_ONE_TITLE, lang)}
              </p>
              <p className={cn(EN_FACE, "mt-1 text-xs font-bold text-slate-500")}>
                {pick(HOME_UI.progress(done, total), lang)} · {pct}%
              </p>
            </div>
          ) : (
            <div className="relative mt-5 flex items-center gap-3 rounded-2xl bg-white/15 px-3.5 py-3">
              <PartyPopper className="size-6 shrink-0 text-amber-200" aria-hidden />
              <p className={cn(face, "text-base font-black")}>{pick(HOME_UI.complete, lang)}</p>
            </div>
          )}

          <Link
            href={ctaHref}
            className={cn(
              face,
              "relative mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-sky-200 bg-white text-lg font-black text-sky-800 transition-transform hover:bg-sky-50 active:translate-y-0.5 active:border-b-2",
            )}
          >
            {pick(cta, lang)}
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        </motion.section>

        {state.finalTest.official ? (
          <motion.div className="mt-6" {...enter(0.09)}>
            <NextLevelSoon learner={learner} lang={lang} />
          </motion.div>
        ) : null}

        <motion.p
          className={cn(
            face,
            "mt-8 flex items-center justify-center gap-1.5 text-center text-xs font-semibold text-slate-400",
          )}
          {...enter(0.12)}
        >
          <Lock className="size-3.5 shrink-0" aria-hidden />
          {pick(HOME_UI.upcomingHint, lang)}
        </motion.p>
      </div>
    </div>
  );
}
