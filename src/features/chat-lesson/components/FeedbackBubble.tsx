import { AlertTriangle, CheckCircle2, Lightbulb, XCircle } from "lucide-react";
import {
  BN_FACE,
  EN_FACE,
  GuideRow,
  SpeakButton,
  SpokenText,
} from "@/src/features/chat-lesson/components/ChatPrimitives";
import { Flaggable } from "@/src/features/chat-lesson/components/Flaggable";
import type { FlagTarget } from "@/src/features/chat-lesson/hooks/useLessonFlags";
import {
  answerLines,
  LANG_FACE,
  pick,
  UI,
  type LessonLanguage,
} from "@/src/features/chat-lesson/lib/uiCopy";
import type {
  Bilingual,
  FeedbackResult,
  LessonQuestion,
} from "@/src/features/chat-lesson/types";
import { useLearner } from "@/src/features/learner/LearnerContext";
import { addressed } from "@/src/features/learner/lib/personalize";
import { cn } from "@/lib/utils";

const TONE = {
  correct: {
    bubble: "border-emerald-200 bg-emerald-50",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    title: "text-emerald-800",
  },
  "correct-after-warning": {
    bubble: "border-emerald-200 bg-emerald-50",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    title: "text-emerald-800",
  },
  warning: {
    bubble: "border-amber-200 bg-amber-50",
    icon: AlertTriangle,
    iconClass: "text-amber-600",
    title: "text-amber-900",
  },
  revealed: {
    bubble: "border-rose-200 bg-rose-50",
    icon: XCircle,
    iconClass: "text-rose-600",
    title: "text-rose-800",
  },
} as const;

function titleFor(
  result: FeedbackResult,
  correctLabel: string | undefined,
  praise: Bilingual,
): Bilingual {
  switch (result) {
    case "correct":
      return UI.plusPoints(praise, "1");
    case "correct-after-warning":
      return UI.plusPoints(praise, "0.5");
    case "warning":
      return UI.warningTitle;
    case "revealed":
      return correctLabel ? UI.correctAnswerIs(correctLabel) : UI.correctAnswerHere;
  }
}

function SpokenLine({
  id,
  label,
  text,
  lang,
}: {
  id: string;
  label: Bilingual;
  text: Bilingual;
  lang: LessonLanguage;
}) {
  return (
    <div className="flex items-start gap-2">
      <p
        className={cn(
          LANG_FACE[lang],
          "min-w-0 flex-1 text-slate-800",
          lang === "en"
            ? "text-[14.5px] leading-relaxed"
            : "text-[15.5px] leading-[1.75]",
        )}
      >
        <span className="font-bold">{pick(label, lang)} </span>
        <SpokenText text={text[lang]} speechId={`${id}-${lang}`} />
      </p>
      <SpeakButton id={`${id}-${lang}`} text={text[lang]} lang={lang} />
    </div>
  );
}

export function FeedbackBubble({
  entryId,
  result,
  question,
  lang,
  flagTarget,
}: {
  entryId: number;
  result: FeedbackResult;
  question: LessonQuestion;
  lang: LessonLanguage;
  flagTarget: FlagTarget;
}) {
  const tone = TONE[result];
  const Icon = tone.icon;
  const face = LANG_FACE[lang];
  const learner = useLearner();
  const correctLines = answerLines(question, question.correctOptionId, lang);
  const named = titleFor(
    result,
    correctLines?.label,
    addressed(question.praise ?? UI.defaultPraise, learner),
  );
  const title = result === "warning" ? addressed(named, learner) : named;
  const speechId = `feedback-${entryId}`;

  return (
    <GuideRow>
      <Flaggable target={flagTarget}>
        <div
          className={cn(
            "rounded-2xl rounded-tl-md border py-3 pl-4 pr-2.5 shadow-sm",
            tone.bubble,
          )}
        >
          <div className="flex items-center gap-2">
            <Icon
              className={cn("size-5 shrink-0", tone.iconClass)}
              aria-hidden
            />
            <p className={cn(face, "text-[15.5px] font-black", tone.title)}>
              {pick(title, lang)}
            </p>
          </div>

          {result === "warning" ? (
            <>
              <div className="mt-3 flex gap-2 rounded-xl bg-white/70 py-2.5 pl-3 pr-2 ring-1 ring-amber-200/70">
                <Lightbulb
                  className="mt-1 size-4 shrink-0 text-amber-500"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <SpokenLine
                    id={`${speechId}-hint`}
                    label={UI.hint}
                    text={question.hint}
                    lang={lang}
                  />
                </div>
              </div>
              <p
                className={cn(
                  face,
                  "mt-2.5 text-[13.5px] font-semibold text-amber-900",
                )}
              >
                {pick(UI.tryOnceMore, lang)}
              </p>
            </>
          ) : (
            <>
              {result === "revealed" && correctLines ? (
                <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-white px-3 py-2.5 ring-2 ring-emerald-300">
                  {correctLines.label ? (
                    <span
                      className={cn(
                        EN_FACE,
                        "flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-xs font-black text-white",
                      )}
                    >
                      {correctLines.label}
                    </span>
                  ) : null}
                  <div className="min-w-0">
                    <p
                      className={cn(
                        LANG_FACE[correctLines.mainLang],
                        "text-[15px] font-bold text-slate-800",
                      )}
                    >
                      {correctLines.main}
                    </p>
                    {correctLines.meaning ? (
                      <p
                        className={cn(BN_FACE, "text-[13.5px] text-slate-500")}
                      >
                        {correctLines.meaning}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <div className="mt-3 border-t border-black/5 pt-2.5">
                <SpokenLine
                  id={`${speechId}-why`}
                  label={UI.why}
                  text={question.explanation}
                  lang={lang}
                />
              </div>
              {result === "revealed" ? (
                <p
                  className={cn(
                    face,
                    "mt-2.5 text-[13.5px] font-semibold text-rose-800",
                  )}
                >
                  {pick(UI.zeroPoints, lang)}
                </p>
              ) : null}
            </>
          )}
        </div>
      </Flaggable>
    </GuideRow>
  );
}
