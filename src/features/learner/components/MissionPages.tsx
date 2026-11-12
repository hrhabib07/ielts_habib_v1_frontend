"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LabStepPlayer } from "@/src/features/chat-lesson/components/LabStepPlayer";
import { LevelMap } from "@/src/features/chat-lesson/components/LevelMap";
import { STEP_AUDIO } from "@/src/features/chat-lesson/content/audio";
import { LESSON_STEPS } from "@/src/features/chat-lesson/content/level1";
import { useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { useMissionStore } from "@/src/features/chat-lesson/hooks/useMissionStore";
import { builtInLevel } from "@/src/features/chat-lesson/lib/levelData";
import { FinalTestPlayer } from "@/src/features/final-test/components/FinalTestPlayer";
import { MISSION_1_FINAL_TEST } from "@/src/features/final-test/content/mission1FinalTest";
import { AddressPrompt, NameStep } from "@/src/features/guest/components/GuestScreens";
import { LearnerProfileHost } from "@/src/features/learner/components/LearnerProfileCard";
import { MISSION_BASE, MissionShell, missionHref, type MissionShellContext } from "@/src/features/learner/components/MissionShell";
import { PhotoPrompt } from "@/src/features/learner/components/PhotoPrompt";
import { ApprovedSheet, LockScreen, OfferSheet } from "@/src/features/learner/components/OfferCards";
import { UnlockChat } from "@/src/features/learner/components/UnlockChat";
import { OFFER_UI } from "@/src/features/learner/lib/copy";
import { DEVICE_FLAGS, readFlag, writeFlag } from "@/src/features/learner/lib/deviceFlags";
import { PERSON_GAME_ID, PERSON_TASTE_ID } from "@/src/features/learner/lib/offer";
import { NOTES_HREF, UNLOCK_HREF } from "@/src/features/learner/lib/routes";
import { NotesLibrary } from "@/src/features/notes/components/NotesLibrary";
import { LabPlaygroundPlayer } from "@/src/features/playground/components/LabPlaygroundPlayer";
import { PLAYGROUNDS } from "@/src/features/playground/content";

const PHOTO_PROMPT_DELAY_MS = 2800;
const ADDRESS_PROMPT_DELAY_MS = 1600;
const MAX_PHOTO_PROMPTS = 2;
/** The soft offer comes back once the Number game's celebration has played. */
const REMINDER_GAME_ID = "level-1-playground-number";
const REMINDER_DELAY_MS = 3400;
const WELCOME_OFFER_DELAY_MS = 1200;
const APPROVED_DELAY_MS = 600;

function Redirect({ href }: { href: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(href);
  }, [href, router]);
  return null;
}

/** The only sign-up question. Shown wherever a new learner lands, then the page they wanted opens. */
function NameGate({ ctx }: { ctx: MissionShellContext }) {
  const lang = useLessonLanguage();
  return (
    <NameStep
      lang={lang}
      suggested={ctx.state.suggestedNameEn}
      onSave={async (nicknameEn) => {
        await ctx.saveProfile({ nicknameEn });
      }}
    />
  );
}

function MapScreen({ ctx }: { ctx: MissionShellContext }) {
  const params = useSearchParams();
  const lang = useLessonLanguage();
  const completed = params.get("completed");
  const { level, summaries } = useMemo(() => builtInLevel(missionHref), []);
  const celebrateStepId = completed && summaries[completed] ? completed : null;
  const [promptOpen, setPromptOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [offer, setOffer] = useState<"welcome" | "reminder" | null>(null);
  const [welcomeSeen, setWelcomeSeen] = useState(() => readFlag(DEVICE_FLAGS.welcomeOfferSeen));
  const [offerClosed, setOfferClosed] = useState(false);
  const [approvedOpen, setApprovedOpen] = useState(false);

  const router = useRouter();
  const learnerData = ctx.state.learner;
  const { hasPaidAccess } = ctx.state;
  const pending = ctx.state.payment.latest?.status === "PENDING";
  const canOffer = Boolean(learnerData) && !hasPaidAccess && !pending && !offerClosed;
  const wantsReminder = canOffer && celebrateStepId === REMINDER_GAME_ID;
  const wantsWelcome = canOffer && !welcomeSeen && !wantsReminder;
  /** Other prompts wait until the offer has been shown and closed. */
  const offerBusy = offer !== null || wantsWelcome || wantsReminder;
  const gamesDone = Object.keys(ctx.state.results).some((id) => PLAYGROUNDS[id]);
  const wantsAddress = Boolean(learnerData) && learnerData?.addressAs === null && gamesDone && !offerBusy;
  const wantsPhoto =
    !offerBusy &&
    !wantsAddress &&
    Boolean(celebrateStepId && PLAYGROUNDS[celebrateStepId]) &&
    Boolean(learnerData) &&
    !learnerData?.photoUrl &&
    (learnerData?.photoPromptCount ?? 0) < MAX_PHOTO_PROMPTS;

  useEffect(() => {
    if (!wantsWelcome && !wantsReminder) return;
    const timer = window.setTimeout(
      () => setOffer(wantsReminder ? "reminder" : "welcome"),
      wantsReminder ? REMINDER_DELAY_MS : WELCOME_OFFER_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [wantsWelcome, wantsReminder]);

  const closeOffer = () => {
    writeFlag(DEVICE_FLAGS.welcomeOfferSeen, true);
    setWelcomeSeen(true);
    setOfferClosed(true);
    setOffer(null);
  };

  useEffect(() => {
    if (pending) writeFlag(DEVICE_FLAGS.awaitingApproval, true);
  }, [pending]);

  useEffect(() => {
    if (!hasPaidAccess || !readFlag(DEVICE_FLAGS.awaitingApproval)) return;
    const timer = window.setTimeout(() => setApprovedOpen(true), APPROVED_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [hasPaidAccess]);

  useEffect(() => {
    if (!wantsAddress || readFlag(DEVICE_FLAGS.addressSkipped)) return;
    const timer = window.setTimeout(() => setAddressOpen(true), ADDRESS_PROMPT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [wantsAddress]);

  useEffect(() => {
    if (!wantsPhoto) return;
    const timer = window.setTimeout(() => setPromptOpen(true), PHOTO_PROMPT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [wantsPhoto]);

  const { learner: knownLearner, resumeStepId, clearResume } = ctx;
  useEffect(() => {
    if (!knownLearner || !resumeStepId) return;
    clearResume();
    router.replace(missionHref(resumeStepId));
  }, [knownLearner, resumeStepId, clearResume, router]);

  if (!ctx.learner) return <NameGate ctx={ctx} />;
  if (resumeStepId) return null;

  return (
    <>
      <LevelMap
        level={level}
        summaries={summaries}
        celebrateStepId={celebrateStepId}
        contentSource="built-in"
        backHref="/player"
        notesHref={NOTES_HREF}
      />
      <LearnerProfileHost />
      {addressOpen ? (
        <AddressPrompt
          lang={lang}
          name={ctx.learner.nicknameEn}
          onPick={async (addressAs) => {
            await ctx.saveProfile({ addressAs });
            setAddressOpen(false);
          }}
          onSkip={() => {
            writeFlag(DEVICE_FLAGS.addressSkipped, true);
            setAddressOpen(false);
          }}
        />
      ) : null}
      {offer ? (
        <OfferSheet
          payment={ctx.state.payment}
          lang={lang}
          kicker={offer === "reminder" ? OFFER_UI.reminderKicker : OFFER_UI.welcomeKicker}
          onGet={() => {
            closeOffer();
            router.push(UNLOCK_HREF);
          }}
          onClose={closeOffer}
        />
      ) : null}
      {approvedOpen ? (
        <ApprovedSheet
          lang={lang}
          legacy={ctx.state.earlyAdopter}
          onClose={() => {
            writeFlag(DEVICE_FLAGS.awaitingApproval, false);
            setApprovedOpen(false);
          }}
        />
      ) : null}
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
  if (!ctx.learner) return <NameGate ctx={ctx} />;
  if (alreadyUnlocked) return <Redirect href={MISSION_BASE} />;
  return <UnlockChat ctx={ctx} learner={ctx.learner} backHref={MISSION_BASE} />;
}

/** Paid steps before payment: the offer, or the payment chat while a payment is under review. */
function PaywallScreen({ ctx, won }: { ctx: MissionShellContext; won: boolean }) {
  const router = useRouter();
  const lang = useLessonLanguage();
  if (!ctx.learner) return <NameGate ctx={ctx} />;
  if (ctx.state.payment.latest?.status === "PENDING") {
    return <UnlockChat ctx={ctx} learner={ctx.learner} backHref={MISSION_BASE} />;
  }
  return (
    <LockScreen
      payment={ctx.state.payment}
      lang={lang}
      won={won}
      onPay={() => router.push(UNLOCK_HREF)}
      onReplay={() => router.push(MISSION_BASE)}
    />
  );
}

function StepScreen({ ctx, stepId }: { ctx: MissionShellContext; stepId: string }) {
  const { isPaywalled } = useMissionStore();
  const router = useRouter();
  // Decided on arrival: winning the taste saves a result, which must not swap the finish screen away.
  const [tasteOnArrival] = useState(() => stepId === PERSON_GAME_ID && !ctx.state.results[PERSON_TASTE_ID]);
  const [justWon, setJustWon] = useState(false);
  const taste = tasteOnArrival && !ctx.state.hasPaidAccess;

  if (!ctx.learner) return <NameGate ctx={ctx} />;
  if (justWon) return <PaywallScreen ctx={ctx} won />;
  if (taste) {
    return (
      <LabPlaygroundPlayer
        playgroundId={stepId}
        levelHref={MISSION_BASE}
        trackAnswers
        taste={{
          rounds: 1,
          resultId: PERSON_TASTE_ID,
          onContinue: (passed) => (passed ? setJustWon(true) : router.push(MISSION_BASE)),
        }}
      />
    );
  }
  if (isPaywalled(stepId)) return <PaywallScreen ctx={ctx} won={false} />;

  if (PLAYGROUNDS[stepId]) return <LabPlaygroundPlayer playgroundId={stepId} levelHref={MISSION_BASE} trackAnswers />;

  if (stepId === MISSION_1_FINAL_TEST.id) {
    return <FinalTestPlayer test={MISSION_1_FINAL_TEST} backHref={MISSION_BASE} practiceHref={missionHref} />;
  }

  const step = LESSON_STEPS[stepId];
  if (!step) return <Redirect href={MISSION_BASE} />;
  return <LabStepPlayer step={step} audio={STEP_AUDIO[step.id]} levelHref={MISSION_BASE} />;
}

function NotesScreen({ ctx }: { ctx: MissionShellContext }) {
  const { isPaywalled } = useMissionStore();
  if (!ctx.learner) return <NameGate ctx={ctx} />;
  return <NotesLibrary backHref={MISSION_BASE} isLocked={isPaywalled} unlockHref={UNLOCK_HREF} />;
}

export function MissionMapPage() {
  return <MissionShell>{(ctx) => <MapScreen ctx={ctx} />}</MissionShell>;
}

export function MissionStepPage({ stepId }: { stepId: string }) {
  return <MissionShell>{(ctx) => <StepScreen ctx={ctx} stepId={stepId} />}</MissionShell>;
}

export function MissionNotesPage() {
  return <MissionShell>{(ctx) => <NotesScreen ctx={ctx} />}</MissionShell>;
}

export function MissionUnlockPage() {
  return <MissionShell>{(ctx) => <UnlockScreen ctx={ctx} />}</MissionShell>;
}
