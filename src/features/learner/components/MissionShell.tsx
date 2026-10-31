"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MissionStoreProvider, type MissionStore } from "@/src/features/chat-lesson/hooks/useMissionStore";
import type { StepResult } from "@/src/features/chat-lesson/hooks/useLabProgress";
import { useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { FINAL_TEST_NODE_ID, LESSON_STEPS, LEVEL_1 } from "@/src/features/chat-lesson/content/level1";
import { LANG_FACE, pick } from "@/src/features/chat-lesson/lib/uiCopy";
import { MISSION_1_FINAL_TEST } from "@/src/features/final-test/content/mission1FinalTest";
import { FinalTestStoreProvider, type FinalTestStore } from "@/src/features/final-test/hooks/useFinalTestStore";
import type { FinalTestResult } from "@/src/features/final-test/types";
import { LearnerProvider, type LearnerActions, type LearnerProgress } from "@/src/features/learner/LearnerContext";
import { LEARNER_UI } from "@/src/features/learner/lib/copy";
import { toLearner } from "@/src/features/learner/lib/fromApi";
import { readMissionState, writeMissionState } from "@/src/features/learner/lib/stateCache";
import type { Learner } from "@/src/features/learner/lib/personalize";
import { resizePhoto } from "@/src/features/learner/lib/resizePhoto";
import { ALL_PLAYGROUNDS } from "@/src/features/playground/content";
import { getDecodedTokenClient, hydrateAccessTokenFromCookie } from "@/src/lib/auth";
import {
  getChatMissionState,
  saveChatMissionFinalTestAnswers,
  saveChatMissionProfile,
  saveChatMissionResult,
  startChatMissionFinalTest,
  submitChatMissionFinalTest,
  uploadChatMissionPhoto,
  dismissChatMissionPhotoPrompt,
  type ChatMissionPaymentStatus,
  type ChatMissionProfileInput,
  type ChatMissionState,
} from "@/src/lib/api/chatMission";
import { UNLOCK_HREF } from "@/src/features/learner/lib/routes";
import { cn } from "@/lib/utils";

export { MISSION_BASE, missionHref } from "@/src/features/learner/lib/routes";
const ANSWER_SAVE_DELAY_MS = 1500;

type EnabledState = Extract<ChatMissionState, { enabled: true }>;

export type MissionShellContext = {
  state: EnabledState;
  learner: Learner | null;
  saveProfile: (input: ChatMissionProfileInput) => Promise<Learner>;
  uploadPhoto: (file: File) => Promise<void>;
  dismissPhotoPrompt: () => Promise<void>;
  paymentSubmitted: (latest: ChatMissionPaymentStatus | null) => void;
  freeClaimed: (freeAccessUntil: number) => void;
};

/** Only shown during onboarding, before the learner has told us their name. */
const NOT_YET_KNOWN: Learner = {
  nicknameEn: "",
  nicknameBn: "",
  addressAs: "bhaiya",
  district: null,
  country: null,
  photoSrc: null,
};

const LESSON_IDS = Object.keys(LESSON_STEPS);
const LEVEL_NUMBER = Number(/\d+/.exec(LEVEL_1.id)?.[0] ?? 1);
const GAME_IDS = ALL_PLAYGROUNDS.map((p) => p.id);

/** Waits for a pause in typing before saving Final Test answers. */
function createDebouncer(ms: number) {
  let timer: number | null = null;
  return {
    run(task: () => void) {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(task, ms);
    },
    cancel() {
      if (timer !== null) window.clearTimeout(timer);
      timer = null;
    },
  };
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white px-6 text-center">
      <div className="flex w-full max-w-md flex-col items-center">{children}</div>
    </div>
  );
}

/**
 * Logged-in shell for the new Mission 1: checks the rollout switch, loads the learner, and connects
 * progress, the Final Test and the profile to the server.
 */
export function MissionShell({ children }: { children: (ctx: MissionShellContext) => ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lang = useLessonLanguage();
  const face = LANG_FACE[lang];
  const [state, setState] = useState<ChatMissionState | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [answerSaver] = useState(() => createDebouncer(ANSWER_SAVE_DELAY_MS));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let token = getDecodedTokenClient();
      if (!token) {
        await hydrateAccessTokenFromCookie();
        token = getDecodedTokenClient();
      }
      if (!token) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      if (cancelled) return;
      setUserId(token.userId);
      const cached = readMissionState(token.userId);
      if (cached) setState((current) => current ?? cached);
      try {
        const data = await getChatMissionState();
        if (!cancelled) {
          setState(data);
          setFailed(false);
        }
      } catch {
        if (!cancelled && !cached) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, retry, router]);

  useEffect(() => {
    if (userId && state) writeMissionState(userId, state);
  }, [userId, state]);

  useEffect(() => () => answerSaver.cancel(), [answerSaver]);

  const enabled = state?.enabled ? state : null;

  const patch = useCallback((update: (current: EnabledState) => EnabledState) => {
    setState((current) => (current?.enabled ? update(current) : current));
  }, []);

  const learner = useMemo(
    () => (enabled ? toLearner(enabled.learner) : null),
    [enabled],
  );

  const saveProfile = useCallback(
    async (input: ChatMissionProfileInput): Promise<Learner> => {
      const saved = await saveChatMissionProfile(input);
      patch((current) => ({ ...current, learner: saved }));
      const next = toLearner(saved);
      if (!next) throw new Error("Profile not saved");
      return next;
    },
    [patch],
  );

  const uploadPhoto = useCallback(
    async (file: File) => {
      const dataUrl = await resizePhoto(file);
      const saved = await uploadChatMissionPhoto(dataUrl);
      patch((current) => ({ ...current, learner: saved }));
    },
    [patch],
  );

  const dismissPhotoPrompt = useCallback(async () => {
    const saved = await dismissChatMissionPhotoPrompt();
    patch((current) => ({ ...current, learner: saved }));
  }, [patch]);

  const paymentSubmitted = useCallback(
    (latest: ChatMissionPaymentStatus | null) =>
      patch((current) => ({ ...current, payment: { ...current.payment, latest } })),
    [patch],
  );

  const freeClaimed = useCallback(
    (freeAccessUntil: number) =>
      patch((current) => ({
        ...current,
        hasPaidAccess: true,
        earlyAdopter: true,
        payment: { ...current.payment, latest: null, freeClaimable: false, freeAccessUntil },
      })),
    [patch],
  );

  const missionStore = useMemo<MissionStore | null>(() => {
    if (!enabled) return null;
    const free = new Set(enabled.freeStepIds);
    const results: Record<string, StepResult> = enabled.results;
    return {
      results,
      unlockAll: false,
      testingTools: false,
      checkoutHref: UNLOCK_HREF,
      paymentPending: enabled.payment.latest?.status === "PENDING",
      isPaywalled: (stepId) => !enabled.hasPaidAccess && !free.has(stepId),
      saveResult: (stepId, score, max) => {
        patch((current) => {
          const previous = current.results[stepId];
          if (previous && previous.score >= score) return current;
          return { ...current, results: { ...current.results, [stepId]: { score, max, completedAt: Date.now() } } };
        });
        void saveChatMissionResult(stepId, score, max)
          .then((saved) => patch((current) => ({ ...current, results: saved })))
          .catch(() => undefined);
      },
    };
  }, [enabled, patch]);

  const finalTestStore = useMemo<FinalTestStore | null>(() => {
    if (!enabled) return null;
    const testId = MISSION_1_FINAL_TEST.id;
    return {
      record: {
        official: enabled.finalTest.official as FinalTestResult | null,
        inProgress: enabled.finalTest.inProgress,
        practiceBest: enabled.finalTest.practiceBest,
        practiceCount: enabled.finalTest.practiceCount,
      },
      startOfficial: async (attempt) => {
        const started = await startChatMissionFinalTest({
          testId,
          order: attempt.order,
          optionOrder: attempt.optionOrder,
        });
        patch((current) => ({ ...current, finalTest: { ...current.finalTest, inProgress: started } }));
        return started;
      },
      saveOfficialAnswers: (answers) => {
        patch((current) =>
          current.finalTest.inProgress
            ? { ...current, finalTest: { ...current.finalTest, inProgress: { ...current.finalTest.inProgress, answers } } }
            : current,
        );
        answerSaver.run(() => {
          void saveChatMissionFinalTestAnswers(testId, answers).catch(() => undefined);
        });
      },
      submitOfficial: async (result) => {
        answerSaver.cancel();
        const saved = await submitChatMissionFinalTest({
          testId,
          official: true,
          result: {
            score: result.score,
            max: result.max,
            sections: result.sections as Record<string, { score: number; max: number }>,
            answers: result.answers,
            timedOut: result.timedOut,
          },
        });
        patch((current) => ({
          ...current,
          finalTest: { ...current.finalTest, official: saved.official, inProgress: null },
          results: saved.official
            ? { ...current.results, [testId]: { score: saved.official.score, max: saved.official.max, completedAt: saved.official.submittedAt } }
            : current.results,
        }));
        return (saved.official ?? result) as FinalTestResult;
      },
      recordPractice: (result) => {
        void submitChatMissionFinalTest({
          testId,
          official: false,
          result: {
            score: result.score,
            max: result.max,
            sections: result.sections as Record<string, { score: number; max: number }>,
            answers: result.answers,
            timedOut: result.timedOut,
          },
        })
          .then((saved) =>
            patch((current) => ({
              ...current,
              finalTest: { ...current.finalTest, practiceBest: saved.practiceBest, practiceCount: saved.practiceCount },
            })),
          )
          .catch(() => undefined);
      },
    };
  }, [enabled, patch, answerSaver]);

  const progress = useMemo<LearnerProgress | null>(() => {
    if (!enabled) return null;
    const official = enabled.finalTest.official;
    const stops = LEVEL_1.nodes;
    const current = stops.findIndex((node) =>
      node.id === FINAL_TEST_NODE_ID ? !official : !(node.stepId && enabled.results[node.stepId]),
    );
    const currentStop = current === -1 ? undefined : stops[current];
    return {
      level: {
        number: LEVEL_NUMBER,
        stop: currentStop ? { index: current + 1, total: stops.length, title: currentStop.title } : null,
      },
      lessonsDone: LESSON_IDS.filter((id) => enabled.results[id]).length,
      lessonsTotal: LESSON_IDS.length,
      gamesDone: GAME_IDS.filter((id) => enabled.results[id]).length,
      gamesTotal: GAME_IDS.length,
      finalTestScore: official ? { score: official.score, max: official.max } : null,
      earlyAdopter: enabled.earlyAdopter,
    };
  }, [enabled]);

  const actions = useMemo<LearnerActions>(() => ({ uploadPhoto, saveProfile: async (input) => void (await saveProfile(input)) }), [
    uploadPhoto,
    saveProfile,
  ]);

  if (failed) {
    return (
      <Centered>
        <p className={cn(face, "text-sm font-semibold text-rose-600")}>{pick(LEARNER_UI.loadFailed, lang)}</p>
        <button
          type="button"
          onClick={() => setRetry((n) => n + 1)}
          className={cn(face, "mt-4 rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white")}
        >
          {pick(LEARNER_UI.retry, lang)}
        </button>
      </Centered>
    );
  }

  if (!state) {
    return (
      <Centered>
        <span className="size-10 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" aria-hidden />
      </Centered>
    );
  }

  if (!enabled || !missionStore || !finalTestStore) {
    return (
      <Centered>
        <h1 className={cn(face, "text-2xl font-black text-slate-900")}>{pick(LEARNER_UI.notOpenTitle, lang)}</h1>
        <p className={cn(face, "mt-2 text-sm font-semibold text-slate-500")}>{pick(LEARNER_UI.notOpenBody, lang)}</p>
        <Link href="/player" className={cn(face, "mt-5 rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white")}>
          {pick(LEARNER_UI.backToGame, lang)}
        </Link>
      </Centered>
    );
  }

  const ctx: MissionShellContext = {
    state: enabled,
    learner,
    saveProfile,
    uploadPhoto,
    dismissPhotoPrompt,
    paymentSubmitted,
    freeClaimed,
  };

  return (
    <MissionStoreProvider store={missionStore}>
      <FinalTestStoreProvider store={finalTestStore}>
        {/* Same tree before and after onboarding, so saving the profile never remounts the page. */}
        <LearnerProvider learner={learner ?? NOT_YET_KNOWN} actions={learner ? actions : null} progress={progress}>
          {children(ctx)}
        </LearnerProvider>
      </FinalTestStoreProvider>
    </MissionStoreProvider>
  );
}
