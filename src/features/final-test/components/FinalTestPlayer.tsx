"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Award, CheckCircle2, ClipboardCheck, GraduationCap, Info, X, XCircle } from "lucide-react";
import { BN_FACE, EN_FACE } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LanguageSwitch } from "@/src/features/chat-lesson/components/LessonChrome";
import { setLessonLanguage, useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import { TestRunner } from "@/src/features/final-test/components/TestRunner";
import { useFinalTestStore } from "@/src/features/final-test/hooks/useFinalTestStore";
import { FT_UI } from "@/src/features/final-test/lib/copy";
import { useLearner } from "@/src/features/learner/LearnerContext";
import { NextLevelSoon } from "@/src/features/learner/components/NextLevelSoon";
import { addressed, personalizeText } from "@/src/features/learner/lib/personalize";
import { arrangedText, gradeFor, isAnswerCorrect, newAttempt, scoreAttempt } from "@/src/features/final-test/lib/scoring";
import type { FinalTest, FinalTestAttempt, FinalTestQuestion, FinalTestResult } from "@/src/features/final-test/types";
import { playCelebrateSfx, playThinkAgainEvalSfx } from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";

type Screen =
  | { name: "intro" }
  | { name: "test"; official: boolean; attempt: FinalTestAttempt }
  | { name: "result"; official: boolean; result: FinalTestResult };

type Props = {
  test: FinalTest;
  backHref: string;
  /** Builds the link to a playground or step, for the "Practise" buttons. */
  practiceHref: (id: string) => string;
};

/** FT_UI text with the learner's name filled in. */
function useSay(lang: LessonLanguage) {
  const learner = useLearner();
  return (text: Bilingual, l: LessonLanguage = lang) => pick(personalizeText(text, learner), l);
}

export function FinalTestPlayer({ test, backHref, practiceHref }: Props) {
  const lang = useLessonLanguage();
  const say = useSay(lang);
  const store = useFinalTestStore(test.id);
  const { record } = store;
  const [screen, setScreen] = useState<Screen>({ name: "intro" });
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const expired = record.inProgress && !record.official && Date.now() >= record.inProgress.deadline ? record.inProgress : null;
  useEffect(() => {
    if (screen.name !== "intro" || !expired) return;
    void store.submitOfficial(scoreAttempt(test, expired.answers, expired.deadline, true)).catch(() => undefined);
  }, [screen.name, expired, store, test]);

  const startOfficial = async () => {
    if (busy) return;
    setBusy(true);
    setConfirming(false);
    try {
      const attempt = await store.startOfficial(newAttempt(test, Date.now()));
      setScreen({ name: "test", official: true, attempt });
    } finally {
      setBusy(false);
    }
  };

  const resumeOfficial = () => {
    if (record.inProgress) setScreen({ name: "test", official: true, attempt: record.inProgress });
  };

  const startPractice = () => setScreen({ name: "test", official: false, attempt: newAttempt(test, Date.now()) });

  const finish = async (official: boolean, answers: Record<string, string>, timedOut: boolean) => {
    const result = scoreAttempt(test, answers, Date.now(), timedOut);
    let saved = result;
    if (official) {
      saved = await store.submitOfficial(result).catch(() => result);
    } else {
      store.recordPractice(result);
    }
    if (saved.score / saved.max >= test.passMark) void playCelebrateSfx();
    else void playThinkAgainEvalSfx();
    setScreen({ name: "result", official, result: saved });
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-slate-50 bg-gradient-to-b from-indigo-50 via-slate-50 to-slate-50">
      <header className="shrink-0 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            href={backHref}
            aria-label={say(FT_UI.backToMap, lang)}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="size-5" aria-hidden />
          </Link>
          <p className={cn(LANG_FACE[lang], "min-w-0 flex-1 truncate text-base font-black text-slate-900")}>{pick(test.title, lang)}</p>
          <LanguageSwitch lang={lang} onChange={setLessonLanguage} />
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {screen.name === "intro" ? (
          <Intro
            test={test}
            lang={lang}
            official={record.official}
            running={Boolean(record.inProgress && !record.official)}
            practiceBest={record.practiceBest}
            confirming={confirming}
            onAskStart={() => setConfirming(true)}
            onCancelStart={() => setConfirming(false)}
            onStartOfficial={() => void startOfficial()}
            onResume={resumeOfficial}
            onPractice={startPractice}
            onViewResult={() => record.official && setScreen({ name: "result", official: true, result: record.official })}
          />
        ) : null}

        {screen.name === "test" ? (
          <TestRunner
            key={screen.attempt.startedAt}
            test={test}
            attempt={screen.attempt}
            official={screen.official}
            lang={lang}
            onAnswersChange={(answers) => {
              if (screen.official) store.saveOfficialAnswers(answers);
            }}
            onSubmit={(answers, timedOut) => void finish(screen.official, answers, timedOut)}
          />
        ) : null}

        {screen.name === "result" ? (
          <ResultView
            test={test}
            result={screen.result}
            official={screen.official}
            officialScore={record.official}
            lang={lang}
            backHref={backHref}
            practiceHref={practiceHref}
            onPractice={startPractice}
          />
        ) : null}
      </main>
    </div>
  );
}

function Intro({
  test,
  lang,
  official,
  running,
  practiceBest,
  confirming,
  onAskStart,
  onCancelStart,
  onStartOfficial,
  onResume,
  onPractice,
  onViewResult,
}: {
  test: FinalTest;
  lang: LessonLanguage;
  official: FinalTestResult | null;
  running: boolean;
  practiceBest: number | null;
  confirming: boolean;
  onAskStart: () => void;
  onCancelStart: () => void;
  onStartOfficial: () => void;
  onResume: () => void;
  onPractice: () => void;
  onViewResult: () => void;
}) {
  const say = useSay(lang);
  const face = LANG_FACE[lang];
  const max = test.questions.length;
  const facts = FT_UI.facts(max, test.minutes, Math.round(test.passMark * 100));

  return (
    <div className="mx-auto w-full max-w-md space-y-5 px-4 pb-12 pt-8 text-center">
      <motion.span
        className="mx-auto flex size-20 items-center justify-center rounded-3xl border-b-[6px] border-indigo-700 bg-indigo-500 text-white shadow-lg"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 16 }}
      >
        <ClipboardCheck className="size-10" strokeWidth={2.5} aria-hidden />
      </motion.span>
      <div>
        <h1 className={cn(face, "text-3xl font-black text-slate-900")}>{pick(test.title, lang)}</h1>
        <p className={cn(face, "mt-2 text-sm font-semibold text-slate-600")}>{say(FT_UI.intro, lang)}</p>
      </div>

      {official ? (
        <div className="rounded-3xl bg-white p-4 text-left ring-1 ring-slate-200">
          <p className={cn(face, "text-xs font-black uppercase tracking-wider text-indigo-600")}>{say(FT_UI.officialScore, lang)}</p>
          <p className={cn(EN_FACE, "mt-1 text-3xl font-black text-slate-900")}>
            {official.score} / {official.max}
            <span className="ml-2 text-base font-bold text-slate-500">{Math.round((official.score / official.max) * 100)}%</span>
          </p>
          {practiceBest !== null ? (
            <p className={cn(face, "mt-1 text-xs font-semibold text-slate-500")}>{say(FT_UI.practiceBest(practiceBest, max), lang)}</p>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-2 rounded-3xl bg-white p-4 text-left ring-1 ring-slate-200">
          {facts.map((fact) => (
            <li key={fact.en} className={cn(face, "flex items-start gap-2 text-sm font-semibold text-slate-700")}>
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-indigo-500" aria-hidden />
              {pick(fact, lang)}
            </li>
          ))}
        </ul>
      )}

      {!official ? (
        <div className="rounded-2xl bg-amber-50 p-3.5 text-left ring-1 ring-amber-200">
          <p className={cn(face, "flex items-start gap-2 text-sm font-bold text-amber-900")}>
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            {say(FT_UI.firstCounts, lang)}
          </p>
          <p className={cn(face, "mt-1 pl-6 text-xs font-semibold text-amber-800")}>{say(FT_UI.practiceNote, lang)}</p>
        </div>
      ) : null}

      <div className="space-y-2.5">
        {official ? (
          <>
            <BigButton tone="indigo" label={say(FT_UI.viewResult, lang)} lang={lang} onClick={onViewResult} />
            <BigButton tone="white" label={say(FT_UI.startPractice, lang)} lang={lang} onClick={onPractice} />
          </>
        ) : running ? (
          <BigButton tone="indigo" label={say(FT_UI.resume, lang)} lang={lang} onClick={onResume} />
        ) : confirming ? (
          <div className="rounded-3xl bg-white p-4 text-left shadow-lg ring-2 ring-indigo-200">
            <p className={cn(face, "text-base font-black text-slate-900")}>{say(FT_UI.confirmTitle, lang)}</p>
            <p className={cn(face, "mt-1 text-sm font-semibold text-slate-600")}>{say(FT_UI.confirmBody, lang)}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <BigButton tone="white" label={say(FT_UI.confirmNo, lang)} lang={lang} onClick={onCancelStart} />
              <BigButton tone="indigo" label={say(FT_UI.confirmYes, lang)} lang={lang} onClick={onStartOfficial} />
            </div>
          </div>
        ) : (
          <BigButton tone="indigo" label={say(FT_UI.startOfficial, lang)} lang={lang} onClick={onAskStart} />
        )}
      </div>
      <p className={cn(face, "text-[11px] font-semibold text-slate-400")}>{say(FT_UI.labNote, lang)}</p>
    </div>
  );
}

function BigButton({
  label,
  tone,
  lang,
  onClick,
}: {
  label: string;
  tone: "indigo" | "white";
  lang: LessonLanguage;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        LANG_FACE[lang],
        "flex h-12 w-full items-center justify-center rounded-2xl border-b-4 px-4 text-base font-extrabold transition-all active:translate-y-0.5 active:border-b-2",
        tone === "indigo"
          ? "border-indigo-700 bg-indigo-500 text-white hover:bg-indigo-500/90"
          : "border-slate-200 bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50",
      )}
    >
      {label}
    </button>
  );
}

function shownAnswer(question: FinalTestQuestion, answer: string | undefined): string | null {
  if (!answer || !answer.trim()) return null;
  return question.kind === "arrange" ? arrangedText(answer) : answer;
}

function ResultView({
  test,
  result,
  official,
  officialScore,
  lang,
  backHref,
  practiceHref,
  onPractice,
}: {
  test: FinalTest;
  result: FinalTestResult;
  official: boolean;
  officialScore: FinalTestResult | null;
  lang: LessonLanguage;
  backHref: string;
  practiceHref: (id: string) => string;
  onPractice: () => void;
}) {
  const say = useSay(lang);
  const learner = useLearner();
  const face = LANG_FACE[lang];
  const pct = Math.round((result.score / result.max) * 100);
  const passed = result.score / result.max >= test.passMark;
  const grade = gradeFor(result.score, result.max, test.passMark);
  const mistakes = test.questions.filter((q) => !isAnswerCorrect(q, result.answers[q.id]));

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-4 pb-12 pt-6">
      <motion.section
        className={cn(
          "rounded-3xl border-b-[6px] p-5 text-center text-white shadow-lg",
          passed ? "border-emerald-700 bg-emerald-500" : "border-slate-600 bg-slate-500",
        )}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      >
        <p className={cn(face, "text-xs font-black uppercase tracking-[0.16em] text-white/80")}>
          {pick(official ? FT_UI.officialScore : FT_UI.practiceScore, lang)}
        </p>
        <p className={cn(EN_FACE, "mt-1 text-5xl font-black")}>
          {result.score} / {result.max}
        </p>
        <p className={cn(face, "mt-1 text-lg font-bold")}>
          {pct}% · {say(FT_UI.grades[grade], lang)}
        </p>
        <p className={cn(face, "mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-black")}>
          {passed ? <GraduationCap className="size-4" aria-hidden /> : <Award className="size-4" aria-hidden />}
          {say(passed ? FT_UI.graduate : FT_UI.notPassed, lang)}
        </p>
        <p className={cn(face, "mt-2 text-sm font-bold text-white/90")}>
          {pick(
            addressed(passed ? { en: "Congratulations!", bn: "অভিনন্দন!" } : { en: "Keep going!", bn: "এগিয়ে চলুন!" }, learner),
            lang,
          )}
        </p>
        {result.timedOut ? <p className={cn(face, "mt-2 text-xs font-semibold text-white/85")}>{say(FT_UI.timedOut, lang)}</p> : null}
        {!official && officialScore ? (
          <p className={cn(face, "mt-2 text-xs font-semibold text-white/85")}>
            {say(FT_UI.officialScore, lang)}: {officialScore.score} / {officialScore.max}
          </p>
        ) : null}
      </motion.section>

      {!passed ? <p className={cn(face, "text-center text-sm font-semibold text-slate-600")}>{say(FT_UI.notYetNote, lang)}</p> : null}

      {official || officialScore ? <NextLevelSoon learner={learner} lang={lang} /> : null}

      <section className="rounded-3xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
        <h2 className={cn(face, "text-base font-black text-slate-900")}>{say(FT_UI.byTopic, lang)}</h2>
        <ul className="mt-3 space-y-3">
          {test.sections.map((section) => {
            const s = result.sections[section.key];
            if (!s) return null;
            const ratio = s.max > 0 ? s.score / s.max : 0;
            return (
              <li key={section.key} className="flex items-center gap-3">
                <span className={cn(face, "w-32 shrink-0 text-sm font-bold text-slate-700")}>{pick(section.title, lang)}</span>
                <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      ratio >= 0.8 ? "bg-emerald-500" : ratio >= 0.6 ? "bg-amber-400" : "bg-rose-400",
                      ratio >= 1 ? "w-full" : ratio >= 0.8 ? "w-4/5" : ratio >= 0.6 ? "w-3/5" : ratio >= 0.4 ? "w-2/5" : ratio > 0 ? "w-1/5" : "w-0",
                    )}
                  />
                </div>
                <span className={cn(EN_FACE, "w-10 shrink-0 text-right text-sm font-black text-slate-700")}>
                  {s.score}/{s.max}
                </span>
                {ratio < 1 ? (
                  <Link
                    href={practiceHref(section.practiceId)}
                    className={cn(face, "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold text-violet-700 ring-1 ring-violet-200 hover:bg-violet-50")}
                  >
                    {say(FT_UI.practise, lang)}
                  </Link>
                ) : (
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-500" aria-hidden />
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className={cn(face, "text-base font-black text-slate-900")}>
          {mistakes.length > 0 ? say(FT_UI.reviewTitle(mistakes.length), lang) : say(FT_UI.noMistakes, lang)}
        </h2>
        {mistakes.map((question) => {
          const yours = shownAnswer(question, result.answers[question.id]);
          return (
            <article key={question.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <p className={cn(face, "text-sm font-bold text-slate-900")}>{pick(question.prompt, lang)}</p>
              {question.sentence ? <p className={cn(EN_FACE, "mt-1 text-sm font-semibold text-slate-600")}>{question.sentence}</p> : null}
              {question.sourceBn ? <p className={cn(BN_FACE, "mt-1 text-sm font-semibold text-emerald-800")}>{question.sourceBn}</p> : null}
              <p className={cn(face, "mt-2 flex items-start gap-1.5 text-sm text-rose-700")}>
                <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  <span className="font-bold">{say(FT_UI.yourAnswer, lang)}:</span>{" "}
                  <span className={EN_FACE}>{yours ?? say(FT_UI.noAnswer, lang)}</span>
                </span>
              </p>
              <p className={cn(face, "mt-1 flex items-start gap-1.5 text-sm text-emerald-700")}>
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  <span className="font-bold">{say(FT_UI.correctAnswer, lang)}:</span>{" "}
                  <span className={EN_FACE}>{question.answer}</span>
                </span>
              </p>
              <p className={cn(face, "mt-1.5 text-sm text-slate-600")}>
                <span className="font-bold">{say(FT_UI.why, lang)}:</span> {pick(question.why, lang)}
              </p>
            </article>
          );
        })}
      </section>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <Link
          href={official ? `${backHref}?completed=${encodeURIComponent(test.id)}` : backHref}
          className={cn(face, "flex h-12 items-center justify-center rounded-2xl border-b-4 border-indigo-700 bg-indigo-500 text-base font-extrabold text-white")}
        >
          {say(FT_UI.backToMap, lang)}
        </Link>
        <BigButton tone="white" label={say(FT_UI.startPractice, lang)} lang={lang} onClick={onPractice} />
      </div>
    </div>
  );
}
