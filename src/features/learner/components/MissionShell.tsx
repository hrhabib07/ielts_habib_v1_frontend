"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MissionStoreProvider, type MissionStore } from "@/src/features/chat-lesson/hooks/useMissionStore";
import type { StepResult } from "@/src/features/chat-lesson/hooks/useLabProgress";
import { useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { LANG_FACE, pick } from "@/src/features/chat-lesson/lib/uiCopy";
import { MISSION_1_FINAL_TEST } from "@/src/features/final-test/content/mission1FinalTest";
import { FinalTestStoreProvider, type FinalTestStore } from "@/src/features/final-test/hooks/useFinalTestStore";
import type { FinalTestResult } from "@/src/features/final-test/types";
import { LearnerProvider, type LearnerActions, type LearnerProgress } from "@/src/features/learner/LearnerContext";
import { LEARNER_UI } from "@/src/features/learner/lib/copy";
import { learnerProgressOf } from "@/src/features/learner/lib/learnerProgress";
import { toLearner } from "@/src/features/learner/lib/fromApi";
import { readMissionState, writeMissionState } from "@/src/features/learner/lib/stateCache";
import type { Learner } from "@/src/features/learner/lib/personalize";
import { resizePhoto } from "@/src/features/learner/lib/resizePhoto";
import { getDecodedTokenClient, hydrateAccessTokenFromCookie } from "@/src/lib/auth";
import { clearGuestProgress, guestProgress } from "@/src/features/guest/guestProgress";
import {
  claimChatMissionGuestResults,
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
import { PERSON_GAME_ID, PERSON_TASTE_ID } from "@/src/features/learner/lib/offer";
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
  /** A playground the learner started as a guest: right after sign-up the map opens it at the next game. */
  resumeStepId: string | null;
  clearResume: () => void;
};

/** Only shown during onboarding, before the learner has told us their name. */
const NOT_YET_KNOWN: Learner = {
  nicknameEn: "",
  nicknameBn: "",
  addressAs: null,
  district: null,
  country: null,
  photoSrc: null,
};

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
export function MissionShell({
  children,
  fallback,
}: {
  children: (ctx: MissionShellContext) => ReactNode;
  /** Shown instead of "Coming soon" when the new Mission 1 is not open for this account. */
  fallback?: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const lang = useLessonLanguage();
  const face = LANG_FACE[lang];
  const [state, setState] = useState<ChatMissionState | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [fresh, setFresh] = useState(false);
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
          setFresh(true);
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

  const serverLoaded = fresh && state?.enabled === true;
  const [resumeStepId, setResumeStepId] = useState<string | null>(null);
  useEffect(() => {
    if (!serverLoaded) return;
    const progress = guestProgress();
    const partials = Object.fromEntries(Object.entries(progress).map(([id, p]) => [id, p.rounds]));
    if (Object.keys(partials).length === 0) return;
    clearGuestProgress();
    void claimChatMissionGuestResults({ results: {}, partials })
      .then((saved) => {
        setState((current) =>
          current?.enabled ? { ...current, results: saved.results, partials: saved.partials } : current,
        );
        const next = Object.keys(saved.partials).find((id) => !saved.results[id] && partials[id]);
        if (next) setResumeStepId(next);
      })
      .catch(() => undefined);
  }, [serverLoaded]);
  const clearResume = useCallback(() => setResumeStepId(null), []);

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
        legacy: current.legacy?.state === "permanent" ? current.legacy : { state: "pending", deadline: freeAccessUntil },
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
      partials: enabled.partials ?? {},
      unlockAll: false,
      testingTools: false,
      checkoutHref: UNLOCK_HREF,
      paymentPending: enabled.payment.latest?.status === "PENDING",
      isPaywalled: (stepId) => {
        if (enabled.hasPaidAccess || free.has(stepId)) return false;
        return stepId !== PERSON_GAME_ID || Boolean(enabled.results[PERSON_TASTE_ID]);
      },
      saveResult: (stepId, score, max) => {
        patch((current) => {
          const { [stepId]: finishedPartial, ...partials } = current.partials ?? {};
          const previous = current.results[stepId];
          if (previous && previous.score >= score) return finishedPartial ? { ...current, partials } : current;
          return {
            ...current,
            partials,
            results: { ...current.results, [stepId]: { score, max, completedAt: Date.now() } },
          };
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

  const progress = useMemo<LearnerProgress | null>(() => (enabled ? learnerProgressOf(enabled) : null), [enabled]);

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
    if (fallback && state.enabled === false) return fallback;
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
    resumeStepId,
    clearResume,
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
