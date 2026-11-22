"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Check,
  Home,
  KeyRound,
  Loader2,
  Lock,
  Phone,
  Play,
  Pointer,
  ShieldCheck,
} from "lucide-react";
import { DEVICE_FLAGS, readFlag, writeFlag } from "@/src/features/learner/lib/deviceFlags";
import { ContinueWithGoogleButton } from "@/src/components/auth/ContinueWithGoogleButton";
import { PaidLearnersProofChip } from "@/src/components/pricing/PaidLearnersProofChip";
import { PlayALittleCtaContent } from "@/src/components/shared/PlayALittleCtaContent";
import { setLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { EN_FACE } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import { GUEST_UI } from "@/src/features/guest/copy";
import { GamlishMascot } from "@/src/features/playground/components/GamlishMascot";
import type { RoundWinExtras } from "@/src/features/playground/components/RoundWinCard";
import {
  playCelebrateSfx,
  playUiClickSfx,
  primeEvalSfx,
} from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";

const PRIMARY =
  "flex h-13 w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-primary bg-accent text-base font-extrabold text-accent-foreground transition-all hover:bg-accent/90 active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-60";
const SECONDARY =
  "flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-slate-200 bg-white text-base font-bold text-slate-700 transition-all hover:bg-slate-50 active:translate-y-0.5 active:border-b-2";
export { PRIMARY as PRIMARY_BUTTON, SECONDARY as SECONDARY_BUTTON };

/** Full-screen shell shared by the guest screens: content and buttons sit near the thumb on phones. */
export function GuestScreen({ children, actions, top }: { children: ReactNode; actions: ReactNode; top?: ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background">
      {top ? (
        <div className="absolute inset-x-0 top-0 z-10 mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 pt-[max(env(safe-area-inset-top),0.75rem)]">
          {top}
        </div>
      ) : null}
      <main className="relative isolate flex min-h-0 flex-1 flex-col overflow-y-auto bg-gradient-to-b from-accent/[0.08] via-background to-background px-5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_1px_1px,rgba(30,58,138,0.1)_1px,transparent_0)] bg-[length:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <motion.div
          className={cn("mx-auto my-auto w-full max-w-md pb-6 text-center", top ? "pt-16" : "pt-8")}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {children}
        </motion.div>
      </main>
      <div className="shrink-0 border-t-2 border-slate-100 bg-white px-5 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3">
        <div className="mx-auto flex w-full max-w-md flex-col gap-2">{actions}</div>
      </div>
    </div>
  );
}

/** What the guest sees of Level 1: its topics, the first topic's games, and how far they got. */
export type GuestPath = {
  levelTitle: Bilingual;
  /** Every topic of the level in map order; the first is the one the guest plays. */
  topics: readonly Bilingual[];
  topic: Bilingual;
  /** All games of the first topic, including the ones that need an account. */
  games: number;
  freeGames: number;
  done: number;
  /** The first game that needs an account. */
  lockedTitle: Bilingual | null;
  nextTopic: Bilingual;
};

/** Topic chips on the welcome card before "+N", so they stay on one line on phones. */
const SHOWN_TOPICS = 2;

const noSubscribe = () => () => undefined;
const languageHintUnseen = () => !readFlag(DEVICE_FLAGS.languageHintSeen);

/**
 * Bangla or English, always in the top corner. On the first visit a tapping hand points at it until the
 * guest switches language or starts playing.
 */
function LanguagePill({ lang, hint, onSeen }: { lang: LessonLanguage; hint: boolean; onSeen: () => void }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="relative">
      <div role="group" aria-label={pick(GUEST_UI.languageQuestion, lang)} className="flex rounded-full bg-white p-0.5 shadow-sm ring-1 ring-slate-200">
        {(["bn", "en"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setLessonLanguage(option);
              onSeen();
            }}
            aria-pressed={lang === option}
            className={cn(
              LANG_FACE[option],
              "h-8 rounded-full px-3 font-bold transition-colors",
              option === "bn" ? "text-[15px]" : "text-sm",
              lang === option ? "bg-accent text-white shadow-sm" : "text-slate-500 hover:text-slate-800",
            )}
          >
            {option === "bn" ? "বাংলা" : "EN"}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {hint ? (
          <motion.div
            key="hint"
            aria-hidden
            className="pointer-events-none absolute right-2 top-full mt-1 flex flex-col items-end"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.span
              className="mr-3 text-slate-700 drop-shadow"
              animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            >
              <Pointer className="size-6 fill-white" />
            </motion.span>
            <span className={cn(LANG_FACE[lang], "mt-0.5 whitespace-nowrap rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white shadow-lg")}>
              {pick(GUEST_UI.languageHint, lang)}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function HomePill({
  lang,
  onNavigate,
}: {
  lang: LessonLanguage;
  /** When set, intercept home tap (e.g. exit confirm on value screen). */
  onNavigate?: () => void;
}) {
  const className = cn(
    LANG_FACE[lang],
    "flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur transition-colors hover:bg-white hover:text-accent",
  );
  if (onNavigate) {
    return (
      <button
        type="button"
        onClick={() => {
          void playUiClickSfx();
          onNavigate();
        }}
        className={className}
      >
        <Home className="size-4" aria-hidden />
        {pick(GUEST_UI.home, lang)}
      </button>
    );
  }
  return (
    <Link
      href="/"
      onClick={() => void playUiClickSfx()}
      className={className}
    >
      <Home className="size-4" aria-hidden />
      {pick(GUEST_UI.home, lang)}
    </Link>
  );
}

/** Larger Bangla on big buttons, so it weighs the same as the English. */
const bigText = (lang: LessonLanguage) => (lang === "en" ? "uppercase tracking-wide" : "text-[17px]");

function GameNode({ n, path, lang }: { n: number; path: GuestPath; lang: LessonLanguage }) {
  const face = LANG_FACE[lang];
  const index = n - 1;
  const done = index < path.done;
  const current = index === path.done && index < path.freeGames;
  const needsLogin = index >= path.freeGames;
  return (
    <div className="relative flex w-16 flex-col items-center gap-1">
      {done ? (
        <span className="flex size-10 items-center justify-center rounded-full border-b-4 border-emerald-700 bg-emerald-500 text-white">
          <Check className="size-5" strokeWidth={3.5} aria-hidden />
        </span>
      ) : current ? (
        <motion.span
          className="flex size-10 items-center justify-center rounded-full border-b-4 border-primary bg-accent text-white shadow-lg shadow-accent/30"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Play className="size-4 translate-x-0.5 fill-current" aria-hidden />
        </motion.span>
      ) : needsLogin ? (
        <span className="flex size-10 items-center justify-center rounded-full border-2 border-dashed border-amber-400 bg-amber-50 text-amber-600">
          <KeyRound className="size-4" aria-hidden />
        </span>
      ) : (
        <span className="flex size-10 items-center justify-center rounded-full border-b-4 border-slate-300 bg-slate-100 text-slate-400">
          <Lock className="size-4" aria-hidden />
        </span>
      )}
      <span
        className={cn(
          face,
          "text-xs font-black",
          done ? "text-emerald-700" : current ? "text-accent" : needsLogin ? "text-amber-700" : "text-slate-400",
        )}
      >
        {pick(GUEST_UI.gameLabel(n), lang)}
      </span>
      {needsLogin ? (
        <span className={cn(face, "-mt-1 rounded-full bg-amber-100 px-1.5 text-[10px] font-black text-amber-800")}>
          {pick(GUEST_UI.loginTag, lang)}
        </span>
      ) : null}
    </div>
  );
}

/** Level 1 is many topics; the guest starts with the first one and its games, getting harder left to right. */
export function LevelPreview({ path, lang }: { path: GuestPath; lang: LessonLanguage }) {
  const face = LANG_FACE[lang];
  return (
    <div className="rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-2">
        <span className={cn(face, "shrink-0 rounded-full bg-accent px-2.5 py-0.5 text-xs font-black text-white")}>
          {pick(GUEST_UI.welcomeLevel, lang)}
        </span>
        <p className={cn(face, "pt-0.5 text-sm font-black leading-snug text-slate-800")}>{pick(path.levelTitle, lang)}</p>
      </div>

      <ul className="mt-2.5 flex items-center gap-1 overflow-hidden whitespace-nowrap">
        {path.topics.slice(0, SHOWN_TOPICS).map((topic, i) => (
          <li
            key={topic.en}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-black",
              i === 0 ? "bg-accent text-white shadow-sm shadow-accent/30" : "bg-slate-100 text-slate-400",
            )}
          >
            {i === 0 ? <Play className="size-3 fill-current" aria-hidden /> : <Lock className="size-3" aria-hidden />}
            <span className={EN_FACE}>{topic.en}</span>
            {i === 0 ? <span className={cn(face, "font-bold text-white/85")}>· {pick(GUEST_UI.startHere, lang)}</span> : null}
          </li>
        ))}
        {path.topics.length > SHOWN_TOPICS ? (
          <li className={cn(EN_FACE, "shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-400")}>
            {pick(GUEST_UI.moreTopics(path.topics.length - SHOWN_TOPICS), lang)}
          </li>
        ) : null}
      </ul>

      <div className="mt-3 border-t-2 border-dashed border-slate-100 pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className={cn(face, "text-sm font-black text-slate-800")}>{pick(GUEST_UI.firstTopic(path.topic, path.games), lang)}</p>
          <span className={cn(face, "flex shrink-0 items-center gap-1 text-[11px] font-bold text-slate-400")}>
            {pick(GUEST_UI.easy, lang)}
            <span className="flex items-end gap-0.5" aria-hidden>
              <span className="h-1.5 w-1.5 rounded-sm bg-emerald-400" />
              <span className="h-2.5 w-1.5 rounded-sm bg-amber-400" />
              <span className="h-3.5 w-1.5 rounded-sm bg-orange-500" />
            </span>
            {pick(GUEST_UI.harder, lang)}
          </span>
        </div>
        <div className="relative mt-3 flex items-start justify-between">
          <span aria-hidden className="absolute inset-x-8 top-5 border-t-[3px] border-dashed border-slate-200" />
          {Array.from({ length: path.games }, (_, i) => (
            <GameNode key={i} n={i + 1} path={path} lang={lang} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniLessonPreview({ lang }: { lang: LessonLanguage }) {
  const face = LANG_FACE[lang];
  const steps = [
    { label: GUEST_UI.miniPathNote, icon: BookOpen },
    { label: GUEST_UI.miniPathGame, icon: Play },
  ] as const;
  return (
    <div className="rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white p-4 shadow-sm">
      <p className={cn(face, "text-sm font-black text-slate-800")}>{pick(GUEST_UI.miniPathLine, lang)}</p>
      <div className="relative mt-4 flex items-start justify-between px-1">
        <span aria-hidden className="absolute inset-x-8 top-5 border-t-[3px] border-dashed border-slate-200" />
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.label.en} className="relative flex w-20 flex-col items-center gap-1">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-b-4",
                  i === 0
                    ? "border-primary bg-accent text-white shadow-lg shadow-accent/30"
                    : "border-slate-300 bg-slate-200 text-slate-500",
                )}
              >
                <Icon className={cn("size-4", step.icon === Play && "translate-x-0.5 fill-current")} aria-hidden />
              </span>
              <span className={cn(face, "text-xs font-black", i === 0 ? "text-accent" : "text-slate-400")}>
                {pick(step.label, lang)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WelcomeCard({
  lang,
  path,
  onStart,
  continuing = false,
}: {
  lang: LessonLanguage;
  path: GuestPath;
  /** Start the forced mini-lesson: in-chat note + questions → one game. */
  onStart: () => void;
  /** Returning guest mid-funnel (lesson/game already started). */
  continuing?: boolean;
}) {
  const face = LANG_FACE[lang];
  const resuming = continuing || (path.done > 0 && path.done < path.freeGames);
  const unseen = useSyncExternalStore(noSubscribe, languageHintUnseen, () => false);
  const [dismissed, setDismissed] = useState(false);
  const hint = unseen && !dismissed;
  const hintSeen = () => {
    writeFlag(DEVICE_FLAGS.languageHintSeen, true);
    setDismissed(true);
  };
  return (
    <GuestScreen
      top={
        <>
          <div className="flex items-center gap-2">
            <HomePill lang={lang} />
            <Link
              href="/login?next=%2Fplayer%2Fmission-1"
              className={cn(
                face,
                "rounded-full bg-white/90 px-3 py-1.5 text-sm font-bold text-accent shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-white",
              )}
            >
              {pick(GUEST_UI.login, lang)}
            </Link>
          </div>
          <LanguagePill lang={lang} hint={hint} onSeen={hintSeen} />
        </>
      }
      actions={
        <motion.button
          type="button"
          onClick={() => {
            if (hint) hintSeen();
            onStart();
          }}
          className={cn(face, PRIMARY, "shadow-lg shadow-accent/25", bigText(lang))}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          {resuming ? (
            <>
              <Play className="size-5 fill-current" aria-hidden />
              {pick(GUEST_UI.continueMini, lang)}
            </>
          ) : (
            <PlayALittleCtaContent label={pick(GUEST_UI.play, lang)} size="md" badge={false} />
          )}
        </motion.button>
      }
    >
      <GamlishMascot size="lg" className="mx-auto size-20 sm:size-24" />
      <h1 className={cn(face, "mt-4 text-3xl font-black text-slate-900")}>{pick(GUEST_UI.welcomeTitle, lang)}</h1>
      <p className={cn(face, "mt-0.5 text-base font-bold text-accent")}>{pick(GUEST_UI.welcomeTag, lang)}</p>

      <ul className="mt-4 flex flex-wrap justify-center gap-1.5">
        {GUEST_UI.quickFacts().map((fact) => (
          <li
            key={fact.text.en}
            className={cn(face, "flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200")}
          >
            <span aria-hidden>{fact.emoji}</span>
            {pick(fact.text, lang)}
          </li>
        ))}
      </ul>

      <div className="mt-4 text-left">
        <MiniLessonPreview lang={lang} />
      </div>
    </GuestScreen>
  );
}

/** The soft save prompt on a guest's win card: one tap to save with Google, or keep playing. */
export function guestSaveExtras({
  lang,
  gamesDone,
  returnTo,
  onKeepPlaying,
}: {
  lang: LessonLanguage;
  gamesDone: number;
  returnTo: string;
  onKeepPlaying: () => void;
}): RoundWinExtras {
  const face = LANG_FACE[lang];
  return {
    note: (
      <p className={cn(face, "flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-[15px] font-bold text-slate-700 shadow-sm ring-1 ring-slate-200")}>
        <ShieldCheck className="size-5 shrink-0 text-emerald-500" aria-hidden />
        {pick(gamesDone >= 2 ? GUEST_UI.softSaveAgain : GUEST_UI.softSave, lang)}
      </p>
    ),
    actions: (
      <>
        <ContinueWithGoogleButton
          returnTo={returnTo}
          label={pick(GUEST_UI.saveWithGoogle, lang)}
          className={cn(face, "h-13 rounded-2xl border-2 border-b-4 border-slate-200 text-base font-bold")}
        />
        <button type="button" onClick={onKeepPlaying} autoFocus className={cn(face, PRIMARY, lang === "en" && "uppercase tracking-wide")}>
          {pick(GUEST_UI.keepPlaying, lang)}
        </button>
      </>
    ),
  };
}

/**
 * After the free mini-lesson game: persuasive signup gate (progress + locked next + dual CTAs).
 * Progress stays in this browser until claim-guest copies it into the new account.
 */
export function GuestValueCard({
  lang,
  path,
  returnTo,
  onSignupStart,
}: {
  lang: LessonLanguage;
  path: GuestPath;
  returnTo: string;
  onSignupStart?: () => void;
}) {
  const face = LANG_FACE[lang];
  const [exitOpen, setExitOpen] = useState(false);
  const gamesTotal = Math.max(path.games, 1);
  const gamesDone = Math.min(path.done, gamesTotal);
  const progressPct = Math.max(8, Math.round((gamesDone / gamesTotal) * 100));
  /** Prefer the next Subject round title; fall back to a clear Subject teaser. */
  const nextTitle = path.lockedTitle ?? GUEST_UI.valueNextFallback;

  useEffect(() => {
    void primeEvalSfx();
    void playCelebrateSfx();
  }, []);

  const phoneHref = `/register?next=${encodeURIComponent(returnTo)}`;
  const startSignup = () => {
    void playUiClickSfx();
    onSignupStart?.();
  };

  return (
    <>
      <GuestScreen
        top={<HomePill lang={lang} onNavigate={() => setExitOpen(true)} />}
        actions={
          <>
            <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
              <ContinueWithGoogleButton
                returnTo={returnTo}
                label={pick(GUEST_UI.valueCta, lang)}
                onNavigate={startSignup}
                className={cn(
                  face,
                  "h-14 w-full rounded-2xl border-2 border-b-4 border-accent/40 text-base font-black shadow-lg shadow-accent/15",
                  lang === "bn" && "text-[16px] leading-snug",
                )}
              />
            </motion.div>
            <Link
              href={phoneHref}
              onClick={startSignup}
              className={cn(face, SECONDARY, "h-13", lang === "bn" && "text-[16px]")}
            >
              <Phone className="size-4" aria-hidden />
              {pick(GUEST_UI.valuePhoneCta, lang)}
            </Link>
            <ul className={cn(face, "mt-1 grid gap-1.5 text-left text-[12px] font-bold text-slate-600")}>
              {[GUEST_UI.valueTrustFree, GUEST_UI.valueTrustFast, GUEST_UI.valueTrustSave].map((line) => (
                <li key={line.en} className="flex items-center gap-2">
                  <Check className="size-3.5 shrink-0 text-emerald-600" strokeWidth={3} aria-hidden />
                  {pick(line, lang)}
                </li>
              ))}
            </ul>
          </>
        }
      >
        <GamlishMascot mood="happy" size="md" className="mx-auto" />
        <span className={cn(face, "mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700")}>
          <Check className="size-3.5" strokeWidth={3} aria-hidden />
          {pick(GUEST_UI.valueBadge, lang)}
        </span>
        <h1 className={cn(face, "mt-2 text-[1.55rem] font-black leading-snug text-slate-900 sm:text-[1.7rem]")}>
          {pick(GUEST_UI.valueTitle, lang)}
        </h1>

        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-3 text-left shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-2">
            <p className={cn(face, "text-xs font-black text-accent")}>{pick(GUEST_UI.valueLevelLabel, lang)}</p>
            <p className={cn(face, "text-xs font-bold text-slate-500")}>
              {pick(GUEST_UI.valueProgress(gamesDone, gamesTotal), lang)}
            </p>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent to-sky-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          </div>
        </div>

        <p className={cn(face, "mt-3 text-[15px] font-bold leading-snug text-slate-600")}>
          {pick(GUEST_UI.valueBody, lang)}
        </p>

        <div className="mt-4 overflow-hidden rounded-2xl border-2 border-dashed border-amber-300/80 bg-amber-50/80 p-3.5 text-left">
          <p className={cn(face, "flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-amber-800")}>
            <Lock className="size-3.5" aria-hidden />
            {pick(GUEST_UI.valueNextLabel, lang)}
          </p>
          <p className={cn(face, "mt-1.5 text-base font-black text-slate-900")}>
            {pick(nextTitle, lang) || pick(GUEST_UI.valueNextFallback, lang)}
          </p>
          <div className="relative mt-3 h-16 overflow-hidden rounded-xl bg-white/70 ring-1 ring-amber-200/80">
            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.65)_50%,transparent_80%)] opacity-80" aria-hidden />
            <div className="flex h-full items-center justify-center gap-2 blur-[2px]">
              <span className="h-8 w-16 rounded-lg bg-slate-200" />
              <span className="h-8 w-20 rounded-lg bg-accent/20" />
              <span className="h-8 w-14 rounded-lg bg-slate-200" />
            </div>
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-9 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-lg">
                <Lock className="size-4" aria-hidden />
              </span>
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <PaidLearnersProofChip variant="plain" className="justify-center" />
        </div>
      </GuestScreen>

      {/* Outside GuestScreen: main uses `isolate`, which trapped the old dialog under the footer CTA. */}
      <AnimatePresence>
        {exitOpen ? (
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/50 p-4 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="guest-exit-title"
            onClick={() => setExitOpen(false)}
          >
            <motion.div
              className="w-full max-w-sm rounded-3xl bg-white p-5 text-center shadow-2xl"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Lock className="size-5" aria-hidden />
              </span>
              <h2 id="guest-exit-title" className={cn(face, "mt-3 text-lg font-black text-slate-900")}>
                {pick(GUEST_UI.valueExitTitle, lang)}
              </h2>
              <p className={cn(face, "mt-2 text-sm font-semibold leading-snug text-slate-600")}>
                {pick(GUEST_UI.valueExitBody, lang)}
              </p>
              <ContinueWithGoogleButton
                returnTo={returnTo}
                label={pick(GUEST_UI.valueExitSave, lang)}
                onNavigate={startSignup}
                className={cn(face, "mt-4 h-12 w-full rounded-2xl border-2 border-b-4 border-accent/40 text-sm font-black")}
              />
              <Link
                href="/"
                onClick={() => void playUiClickSfx()}
                className={cn(face, "mt-3 block py-2 text-sm font-bold text-slate-500")}
              >
                {pick(GUEST_UI.valueExitLater, lang)}
              </Link>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

/** The guest's finished games, ticked, then the topic's next game waiting, plus why saving is worth it. */
function SavedPath({ lang, path }: { lang: LessonLanguage; path: GuestPath }) {
  const face = LANG_FACE[lang];
  const nextGame = path.done + 1;
  return (
    <div className="mt-5 rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white p-4 text-left shadow-sm">
      <div className="relative flex items-start justify-between px-1">
        <span aria-hidden className="absolute inset-x-8 top-5 border-t-[3px] border-dashed border-slate-200" />
        {Array.from({ length: path.done }, (_, i) => (
          <motion.div
            key={i}
            className="relative flex w-14 flex-col items-center gap-1"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 18, delay: 0.3 + i * 0.15 }}
          >
            <span className="flex size-10 items-center justify-center rounded-full border-b-4 border-emerald-700 bg-emerald-500 text-white">
              <Check className="size-5" strokeWidth={3.5} aria-hidden />
            </span>
            <span className={cn(face, "text-[11px] font-black text-emerald-700")}>{pick(GUEST_UI.gameLabel(i + 1), lang)}</span>
          </motion.div>
        ))}
        <div className="relative flex w-14 flex-col items-center gap-1">
          <motion.span
            className="flex size-10 items-center justify-center rounded-full border-b-4 border-primary bg-accent text-white shadow-lg shadow-accent/30"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Play className="size-4 translate-x-px fill-current" aria-hidden />
          </motion.span>
          <span className={cn(face, "text-[11px] font-black text-accent")}>{pick(GUEST_UI.gameLabel(nextGame), lang)}</span>
          <span className={cn(EN_FACE, "-mt-1 text-[10px] font-black text-slate-400")}>{path.topic.en}</span>
        </div>
      </div>
      <ul className="mt-4 space-y-1.5">
        {GUEST_UI.saveBenefits(path.topic, nextGame, path.nextTopic).map((benefit) => (
          <li key={benefit.en} className={cn(face, "flex items-center gap-2 text-sm font-bold text-slate-700")}>
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="size-3.5" strokeWidth={3} aria-hidden />
            </span>
            {pick(benefit, lang)}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * After the last free game (and on every later visit to /play): the topic's next game is one Google
 * tap away. The wins stay in this browser until then and are copied into the account on sign-in.
 */
export function GuestContinueCard({ lang, path, returnTo }: { lang: LessonLanguage; path: GuestPath; returnTo: string }) {
  const face = LANG_FACE[lang];
  const nextGame = path.done + 1;
  return (
    <GuestScreen
      top={<HomePill lang={lang} />}
      actions={
        <>
          <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
            <ContinueWithGoogleButton
              returnTo={returnTo}
              label={pick(GUEST_UI.playGameWithGoogle(nextGame), lang)}
              className={cn(
                face,
                "h-14 w-full rounded-2xl border-2 border-b-4 border-accent/40 text-base font-black shadow-lg shadow-accent/15",
                lang === "bn" && "text-[17px]",
              )}
            />
          </motion.div>
          <Link
            href={`/register?next=${encodeURIComponent(returnTo)}`}
            className={cn(face, "flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-accent")}
          >
            <Phone className="size-4" aria-hidden />
            {pick(GUEST_UI.usePhone, lang)}
          </Link>
        </>
      }
    >
      <GamlishMascot mood="happy" size="lg" className="mx-auto" />
      <span className={cn(face, "mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700")}>
        <Check className="size-3.5" strokeWidth={3} aria-hidden />
        {pick(GUEST_UI.winsSaved(path.done), lang)}
      </span>
      <h1 className={cn(face, "mt-2 text-3xl font-black text-slate-900")}>{pick(GUEST_UI.gamesDoneOf(path.done, path.games), lang)}</h1>
      <p className={cn(face, "mt-1.5 text-base font-bold leading-snug text-slate-600")}>
        {pick(path.lockedTitle ? GUEST_UI.lastGameLine(path.topic, path.lockedTitle) : GUEST_UI.continueLine, lang)}
      </p>
      <SavedPath lang={lang} path={path} />
      <p className={cn(face, "mt-4 text-xs font-semibold leading-relaxed text-slate-500")}>{pick(GUEST_UI.comeBackLater, lang)}</p>
    </GuestScreen>
  );
}

const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]{0,39}$/;

/** The only sign-up question: the name, filled from the Google account when possible. */
export function NameStep({
  lang,
  suggested,
  onSave,
}: {
  lang: LessonLanguage;
  suggested: string | null;
  onSave: (name: string) => Promise<void>;
}) {
  const face = LANG_FACE[lang];
  const [name, setName] = useState(suggested ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const cleanName = name.trim().replace(/\s+/g, " ");
  const validName = NAME_PATTERN.test(cleanName);
  const firstName = cleanName.split(" ")[0] ?? cleanName;

  const submit = async () => {
    const clean = cleanName;
    if (!NAME_PATTERN.test(clean)) {
      setError(pick(GUEST_UI.nameInvalid, lang));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(clean);
    } catch {
      setError(pick(GUEST_UI.saveFailed, lang));
      setSaving(false);
    }
  };

  return (
    <GuestScreen
      actions={
        <button
          type="button"
          onClick={() => void submit()}
          disabled={saving || !name.trim()}
          className={cn(face, PRIMARY, lang === "en" && "uppercase tracking-wide")}
        >
          {saving ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
          {pick(saving ? GUEST_UI.saving : GUEST_UI.saveAndPlay, lang)}
        </button>
      }
    >
      <GamlishMascot mood={validName ? "happy" : "idle"} size="lg" className="mx-auto mb-4" />
      <h1 className={cn(face, "text-2xl font-black text-slate-900")}>{pick(GUEST_UI.nameQuestion, lang)}</h1>
      <input
        value={name}
        onChange={(event) => setName(event.target.value.slice(0, 40))}
        onKeyDown={(event) => {
          if (event.key === "Enter") void submit();
        }}
        autoFocus
        autoComplete="given-name"
        aria-label={pick(GUEST_UI.nameHint, lang)}
        placeholder={pick(GUEST_UI.nameHint, lang)}
        className={cn(
          EN_FACE,
          "mt-5 h-14 w-full rounded-2xl border-2 border-b-4 border-accent/35 bg-white px-4 text-center text-2xl font-bold text-slate-900 outline-none focus:border-accent",
        )}
      />
      {error ? (
        <p className={cn(face, "mt-2 text-sm font-semibold text-rose-600")}>{error}</p>
      ) : validName ? (
        <motion.p
          key={firstName}
          className={cn(face, "mt-3 text-base font-bold text-accent")}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {pick(GUEST_UI.nameGreeting(firstName), lang)}
        </motion.p>
      ) : null}
    </GuestScreen>
  );
}

/** Asked once on the map after the first games, never at sign-up. */
export function AddressPrompt({
  lang,
  name,
  onPick,
  onSkip,
}: {
  lang: LessonLanguage;
  name: string;
  onPick: (addressAs: "bhaiya" | "apu") => Promise<void>;
  onSkip: () => void;
}) {
  const face = LANG_FACE[lang];
  const [saving, setSaving] = useState(false);
  const choose = async (addressAs: "bhaiya" | "apu") => {
    setSaving(true);
    try {
      await onPick(addressAs);
    } catch {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center bg-slate-900/40 p-4 sm:items-center" role="dialog" aria-modal="true">
      <motion.div
        className="w-full max-w-sm rounded-3xl bg-white p-5 text-center shadow-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        <p className={cn(face, "text-lg font-black text-slate-900")}>{pick(GUEST_UI.addressQuestion(name), lang)}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {(["bhaiya", "apu"] as const).map((option) => (
            <button
              key={option}
              type="button"
              disabled={saving}
              onClick={() => void choose(option)}
              className={cn(face, SECONDARY, "h-13 text-lg")}
            >
              {pick(GUEST_UI[option], lang)}
            </button>
          ))}
        </div>
        <button type="button" onClick={onSkip} disabled={saving} className={cn(face, "mt-3 text-sm font-semibold text-slate-500")}>
          {pick(GUEST_UI.justName, lang)}
        </button>
      </motion.div>
    </div>
  );
}
