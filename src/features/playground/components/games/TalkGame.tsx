"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle, Keyboard } from "lucide-react";
import { EN_FACE } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { spokenWords } from "@/src/features/chat-lesson/lib/speechText";
import { LANG_FACE, pick } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import {
  BanglaLine,
  ListenButtons,
  useActiveWord,
  WordChip,
} from "@/src/features/playground/components/PlaygroundParts";
import { isDone, type GameProps } from "@/src/features/playground/components/games/gameProps";
import { checkSubjectAnswer } from "@/src/features/playground/lib/checkSubjectApi";
import { PG_UI } from "@/src/features/playground/lib/copy";
import {
  buildSentence,
  checkTalkLocally,
  displaySubject,
  exampleSentence,
  guessPlural,
  looksLikeSubject,
  MAX_ANSWER_LENGTH,
  normalizeAnswer,
  REASON_HINTS,
  talkSuggestions,
} from "@/src/features/playground/lib/talkCheck";
import type { BuiltSentence, TalkItem } from "@/src/features/playground/types";
import { playUiClickSfx } from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";

const NOT_SUBJECT = REASON_HINTS.not_subject ?? { en: "Who or what does it?", bn: "কাজটা কে বা কী করে?" };

function joinNotes(notes: (Bilingual | null)[]): Bilingual | undefined {
  const present = notes.filter((note): note is Bilingual => note !== null);
  if (present.length === 0) return undefined;
  return { en: present.map((n) => n.en).join(" "), bn: present.map((n) => n.bn).join(" ") };
}

function SentenceLine({ sentence, verbChanged }: { sentence: BuiltSentence; verbChanged: boolean }) {
  const [verb, ...rest] = sentence.rest.split(" ");
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-4 pt-2">
      <WordChip tone="subject" disabled tag="Subject">
        {sentence.subject}
      </WordChip>
      <span className={cn(EN_FACE, "text-lg font-bold text-slate-800 sm:text-2xl")}>
        <motion.span
          className={cn("inline-block rounded-lg", verbChanged && "bg-accent/10 px-1 text-accent")}
          initial={verbChanged ? { scale: 0.6, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 14, delay: 0.25 }}
        >
          {verb}
        </motion.span>{" "}
        {rest.join(" ")}
      </span>
    </div>
  );
}

export function TalkGame({
  item,
  itemKey,
  lang,
  status,
  attempt,
  onReady,
  onAnswer,
  onChecking,
  playgroundId,
}: GameProps<TalkItem> & { onChecking: () => void; playgroundId: string }) {
  const [text, setText] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [built, setBuilt] = useState<{ sentence: BuiltSentence; verbChanged: boolean } | null>(null);
  const [helped, setHelped] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const done = isDone(status);
  const locked = status !== "answering";
  const spoken = useActiveWord(`${itemKey}:s:`);
  const { subjectTail, verb, after } = item.frame;
  const suggestions = locked ? [] : talkSuggestions(item, text);

  useEffect(() => {
    if (status !== "answering") return;
    if (window.matchMedia("(pointer: fine)").matches || attempt > 0) inputRef.current?.focus();
  }, [status, attempt]);

  const accept = (subject: string, plural: boolean, brave: boolean, fixedFrom?: string) => {
    const sentence = buildSentence(item, subject, plural);
    const verbChanged = Boolean(verb) && (plural || Boolean(subjectTail));
    setBuilt({ sentence, verbChanged });
    onAnswer({
      correct: true,
      body: {
        en: `Nice! **${sentence.subject}** is the Subject.`,
        bn: `সুন্দর! এখানে **${sentence.subject}** হলো Subject।`,
      },
      note: joinNotes([
        fixedFrom && normalizeAnswer(fixedFrom) !== normalizeAnswer(subject) ? PG_UI.spellingFixed(subject) : null,
        verbChanged ? PG_UI.verbChanged : null,
      ]),
      brave,
      collect: { highlight: sentence.subject, after: sentence.rest },
    });
  };

  const reveal = (): Bilingual => {
    const example = exampleSentence(item);
    return {
      en: `One good answer: **${example.subject}** ${example.rest}`,
      bn: `একটি ভালো উত্তর: **${example.subject}** ${example.rest}`,
    };
  };

  const check = async (value: string, brave: boolean) => {
    const verdict = checkTalkLocally(item, value);
    if (verdict.kind === "reject") {
      onAnswer({ correct: false, hint: verdict.hint, reveal: reveal() });
      return;
    }
    if (verdict.kind === "accept") {
      accept(verdict.subject, verdict.plural, brave, verdict.fixedFrom);
      return;
    }
    onChecking();
    const res = await checkSubjectAnswer(playgroundId, item, verdict.cleaned);
    if (res.verdict === "accepted") {
      accept(displaySubject(res.subject), res.plural, brave, verdict.cleaned);
    } else if (res.verdict === "rejected") {
      onAnswer({ correct: false, hint: REASON_HINTS[res.reason] ?? NOT_SUBJECT, reveal: reveal() });
    } else if (looksLikeSubject(verdict.cleaned)) {
      accept(displaySubject(verdict.cleaned), guessPlural(verdict.cleaned), brave);
    } else {
      onAnswer({ correct: false, hint: NOT_SUBJECT, reveal: reveal() });
    }
  };

  const update = (value: string, usedHelp = helped) => {
    const next = value.slice(0, MAX_ANSWER_LENGTH);
    setText(next);
    const trimmed = next.trim();
    onReady(trimmed ? () => void check(trimmed, !usedHelp) : null);
  };

  const pickCard = (card: string) => {
    setHelped(true);
    void playUiClickSfx();
    update(card, true);
  };

  const shown = done ? (status === "revealed" ? { sentence: exampleSentence(item), verbChanged: false } : built) : null;
  const questionWords = item.question.en.split(" ");
  const activeQuestionWord = spoken;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="rounded-3xl border-2 border-b-[5px] border-accent/20 bg-accent/5 p-3.5 shadow-sm sm:p-6">
        <div className="flex items-start gap-2 sm:gap-3">
          <p className={cn(EN_FACE, "min-w-0 flex-1 text-xl font-black leading-snug text-slate-900 sm:text-3xl")}>
            {questionWords.map((word, i) => {
              const offset = questionWords.slice(0, i).reduce((sum, w) => sum + spokenWords(w).length, 0);
              return (
                <span key={i}>
                  <span
                    className={cn(
                      "rounded-md transition-colors",
                      activeQuestionWord === offset && "bg-amber-200 shadow-[0_0_0_3px_#fde68a]",
                    )}
                  >
                    {word}
                  </span>{" "}
                </span>
              );
            })}
          </p>
          <ListenButtons idPrefix={`${itemKey}:s:`} text={item.question.en} lang={lang} />
        </div>
        <BanglaLine id={`${itemKey}:bn`} text={item.question.bn} lang={lang} />
      </div>

      <div className="rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white p-3.5 shadow-sm sm:p-6">
        {shown ? (
          <SentenceLine sentence={shown.sentence} verbChanged={shown.verbChanged} />
        ) : (
          <label className="flex flex-wrap items-center gap-x-2 gap-y-3 pt-1">
            <input
              ref={inputRef}
              aria-label={pick(PG_UI.typeHelp, lang)}
              value={text}
              onChange={(event) => update(event.target.value)}
              disabled={locked}
              maxLength={MAX_ANSWER_LENGTH}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
              spellCheck={false}
              enterKeyHint="done"
              placeholder={pick(PG_UI.typeHere, lang)}
              className={cn(
                EN_FACE,
                "min-w-[9ch] max-w-full rounded-2xl border-2 border-b-4 border-dashed border-accent/35 bg-accent/5 px-3 py-1.5 text-lg font-bold sm:px-3.5 sm:py-2 text-accent outline-none transition-colors [field-sizing:content] placeholder:font-semibold placeholder:text-accent/35 focus:border-solid focus:border-accent focus:bg-white sm:text-2xl",
                status === "retry" && "border-solid border-orange-300 bg-orange-50 text-orange-800",
              )}
            />
            <span className={cn(EN_FACE, "text-lg font-bold text-slate-800 sm:text-2xl")}>
              {[subjectTail, verb?.one, after].filter(Boolean).join(" ")}
            </span>
          </label>
        )}

        {done ? null : (
          <p className={cn(LANG_FACE[lang], "mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500 max-sm:hidden")}>
            <Keyboard className="size-3.5 shrink-0" aria-hidden />
            {pick(PG_UI.typeHelp, lang)}
          </p>
        )}

        {suggestions.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => update(s)}
                className={cn(
                  EN_FACE,
                  "rounded-full bg-accent/10 px-3 py-1.5 text-sm font-bold text-accent transition-colors hover:bg-accent/20",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {done ? null : (
        <div>
          <button
            type="button"
            onClick={() => setHelpOpen((open) => !open)}
            disabled={locked}
            className={cn(
              LANG_FACE[lang],
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-accent ring-1 ring-accent/20 transition-colors hover:bg-accent/5",
            )}
          >
            <HelpCircle className="size-4" aria-hidden />
            {pick(helpOpen ? PG_UI.hideHelp : PG_UI.needHelp, lang)}
          </button>
          <AnimatePresence initial={false}>
            {helpOpen ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className={cn(LANG_FACE[lang], "mt-3 text-xs font-semibold text-slate-500")}>
                  {pick(PG_UI.helpCards, lang)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2.5 pb-1">
                  {item.cards.map((card) => (
                    <WordChip key={card} tone="idle" disabled={locked} onClick={() => pickCard(card)}>
                      {card}
                    </WordChip>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
