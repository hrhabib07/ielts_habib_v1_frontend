"use client";

import { useState } from "react";
import { BookOpen, Check, CheckCircle2, ChevronDown, EyeOff, X } from "lucide-react";
import {
  BN_FACE,
  EN_FACE,
  GuideMessageBubble,
  GuideRow,
  UserBubble,
  UserRow,
} from "@/src/features/chat-lesson/components/ChatPrimitives";
import { Flaggable } from "@/src/features/chat-lesson/components/Flaggable";
import type { ChatEntry } from "@/src/features/chat-lesson/lib/chatLessonReducer";
import { answerTarget, messageTarget } from "@/src/features/chat-lesson/lib/flagTargets";
import { formatPoints } from "@/src/features/chat-lesson/lib/format";
import {
  LANG_FACE,
  answerLines,
  pick,
  UI,
  type LessonLanguage,
} from "@/src/features/chat-lesson/lib/uiCopy";
import type { LessonChunk, LessonQuestion } from "@/src/features/chat-lesson/types";
import { cn } from "@/lib/utils";

export function PartDivider({
  chunk,
  partNumber,
  partCount,
  lang,
}: {
  chunk: LessonChunk;
  partNumber: number;
  partCount: number;
  lang: LessonLanguage;
}) {
  const face = LANG_FACE[lang];
  return (
    <div className="flex flex-col items-center gap-1.5 py-2 text-center animate-in fade-in duration-500">
      <span
        className={cn(
          face,
          "rounded-full bg-accent/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-accent",
        )}
      >
        {pick(UI.partOf(partNumber, partCount), lang)}
      </span>
      <h2 className={cn(face, "text-lg font-black text-slate-900")}>{chunk.title[lang]}</h2>
    </div>
  );
}

export function LessonHiddenCard({
  lang,
  canReread,
  onReread,
}: {
  lang: LessonLanguage;
  canReread: boolean;
  onReread: () => void;
}) {
  const face = LANG_FACE[lang];
  return (
    <GuideRow>
      <button
        type="button"
        disabled={!canReread}
        onClick={onReread}
        className={cn(
          "group block w-full rounded-2xl rounded-tl-md border-2 border-dashed border-slate-300 bg-slate-50/80 px-4 py-3 text-left transition-colors",
          canReread && "hover:border-accent/30 hover:bg-accent/5",
        )}
      >
        <span className={cn(face, "flex items-center gap-2 text-sm font-bold text-slate-600")}>
          <EyeOff className="size-4 shrink-0" aria-hidden />
          {pick(UI.lessonHidden, lang)}
        </span>
        {canReread ? (
          <span
            className={cn(
              face,
              "mt-2 ml-6 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-accent ring-1 ring-accent/20 group-hover:ring-accent/40",
            )}
          >
            <BookOpen className="size-3.5" aria-hidden />
            {pick(UI.readAgainClose, lang)}
          </span>
        ) : null}
      </button>
    </GuideRow>
  );
}

export function CompletedPartCard({
  chunk,
  partNumber,
  score,
  max,
  lang,
}: {
  chunk: LessonChunk;
  partNumber: number;
  score: number;
  max: number;
  lang: LessonLanguage;
}) {
  const [open, setOpen] = useState(false);
  const perfect = score === max;
  const face = LANG_FACE[lang];

  return (
    <div className="mx-auto w-full max-w-md">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 text-left transition-colors hover:bg-emerald-50"
      >
        <CheckCircle2 className="size-5 shrink-0 text-emerald-600" aria-hidden />
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              face,
              "block text-[10.5px] font-black uppercase tracking-[0.14em] text-emerald-700",
            )}
          >
            {pick(UI.partDone(partNumber), lang)}
          </span>
          <span className={cn(face, "block truncate text-sm font-bold text-slate-800")}>
            {chunk.title[lang]}
          </span>
        </span>
        {max > 0 ? (
          <span
            className={cn(
              EN_FACE,
              "rounded-full bg-white px-2.5 py-1 text-xs font-black ring-1",
              perfect ? "text-emerald-700 ring-emerald-200" : "text-amber-700 ring-amber-200",
            )}
          >
            {formatPoints(score)} / {max}
          </span>
        ) : null}
        <ChevronDown
          className={cn("size-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="mt-3 space-y-2.5 animate-in fade-in duration-200">
          {chunk.messages.map((message, i) => (
            <GuideRow key={i} showAvatar={i === 0}>
              <Flaggable target={messageTarget(chunk, i, message, lang)}>
                <GuideMessageBubble speechId={`review-${chunk.id}-${i}`} message={message} lang={lang} />
              </Flaggable>
            </GuideRow>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function OptionLine({
  question,
  optionId,
  lang,
}: {
  question: LessonQuestion;
  optionId: string;
  lang: LessonLanguage;
}) {
  const lines = answerLines(question, optionId, lang);
  if (!lines) return null;
  return (
    <>
      <p className={cn(LANG_FACE[lines.mainLang], "text-[15px] font-semibold leading-snug")}>
        {lines.label ? `${lines.label}. ` : null}
        {lines.main}
      </p>
      {lines.meaning ? (
        <p className={cn(BN_FACE, "mt-0.5 text-[13.5px] text-white/85")}>{lines.meaning}</p>
      ) : null}
    </>
  );
}

export function UserEntry({
  entry,
  question,
  pending,
  lang,
  partTitle,
}: {
  entry: Exclude<ChatEntry, { kind: "guide-feedback" }>;
  question: LessonQuestion | undefined;
  pending: boolean;
  lang: LessonLanguage;
  partTitle: string;
}) {
  const face = LANG_FACE[lang];

  if (entry.kind === "user-ready") {
    return (
      <UserRow>
        <UserBubble lang={lang}>
          <p className={cn(face, "text-[15px] font-semibold")}>
            {pick(entry.resumed ? UI.readyAgain : UI.ready, lang)}
          </p>
        </UserBubble>
      </UserRow>
    );
  }

  if (!question) return null;

  if (entry.kind === "user-ack") {
    return (
      <UserRow>
        <Flaggable target={answerTarget(question, question.correctOptionId, entry.id, partTitle, lang)}>
          <UserBubble
            tone="correct"
            lang={lang}
            caption={pick(UI.ackCaption, lang)}
            footer={
              <span className="inline-flex items-center gap-1">
                <Check className="size-3.5" aria-hidden /> {pick(UI.learned, lang)}
              </span>
            }
          >
            <OptionLine question={question} optionId={question.correctOptionId} lang={lang} />
          </UserBubble>
        </Flaggable>
      </UserRow>
    );
  }

  const tone = pending ? "pending" : entry.correct ? "correct" : "wrong";
  const prompt = question.prompt[lang];
  return (
    <UserRow>
      <Flaggable target={answerTarget(question, entry.optionId, entry.id, partTitle, lang)}>
        <UserBubble
          tone={tone}
          lang={lang}
          caption={question.sentence ? `${prompt} ${question.sentence}` : prompt}
          footer={
            pending ? null : entry.correct ? (
              <span className="inline-flex items-center gap-1">
                <Check className="size-3.5" aria-hidden /> {pick(UI.correct, lang)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <X className="size-3.5" aria-hidden /> {pick(UI.wrong, lang)}
              </span>
            )
          }
        >
          <OptionLine question={question} optionId={entry.optionId} lang={lang} />
        </UserBubble>
      </Flaggable>
    </UserRow>
  );
}
