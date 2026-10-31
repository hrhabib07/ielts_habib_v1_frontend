"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Lightbulb, Quote, Volume2 } from "lucide-react";
import { LearnerAvatarButton } from "@/src/features/learner/components/LearnerAvatar";
import { useLessonFlags } from "@/src/features/chat-lesson/hooks/useLessonFlags";
import { useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { useLessonSpeech } from "@/src/features/chat-lesson/hooks/useLessonSpeech";
import {
  groupGlossUnits,
  parseRichText,
  tokenizeRichText,
  type RichToken,
} from "@/src/features/chat-lesson/lib/format";
import { messageSpeech, type SpeechLang } from "@/src/features/chat-lesson/lib/speechText";
import {
  FEEDBACK_UI,
  LANG_FACE,
  pick,
  UI,
  type LessonLanguage,
} from "@/src/features/chat-lesson/lib/uiCopy";
import type {
  LessonListItem,
  LessonMessage,
  LessonTable,
  LessonTableCell,
  WordGloss,
} from "@/src/features/chat-lesson/types";
import { cn } from "@/lib/utils";

export const EN_FACE = LANG_FACE.en;
/** Hind Siliguri for Bangla; digits fall through to Outfit via the "Gamlish Latin Digits" face. */
export const BN_FACE = LANG_FACE.bn;

export function SpeakButton({
  id,
  text,
  lang,
  className,
}: {
  id: string;
  text: string;
  lang: SpeechLang;
  className?: string;
}) {
  const { canSpeak, speak, speakingId } = useLessonSpeech();
  if (!canSpeak(text, lang)) return null;
  const active = speakingId === id;
  const tone =
    lang === "en"
      ? active
        ? "bg-sky-500 text-white"
        : "text-sky-600 hover:bg-sky-100"
      : active
        ? "bg-emerald-500 text-white"
        : "text-emerald-600 hover:bg-emerald-100";

  return (
    <button
      type="button"
      onClick={() => speak(id, text, lang)}
      aria-label={lang === "en" ? "Listen in English" : "বাংলায় শোনো"}
      aria-pressed={active}
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full transition-colors",
        tone,
        className,
      )}
    >
      <Volume2 className={cn("size-4", active && "animate-pulse")} aria-hidden />
    </button>
  );
}

function renderTokens(tokens: RichToken[], active: number | null, strongClassName?: string): ReactNode[] {
  return tokens.map((token, i) => {
    if (token.wordIndex === null) return token.text;
    const lit = token.wordIndex === active;
    return (
      <span
        key={i}
        className={cn(
          "rounded-[4px] transition-[background-color,box-shadow,color] duration-100",
          token.strong && cn("font-bold text-sky-700", strongClassName),
          lit && "bg-amber-200 text-slate-900 shadow-[0_0_0_2px_#fde68a]",
        )}
      >
        {token.text}
      </span>
    );
  });
}

const GLOSS_OPEN_EVENT = "gamlish-gloss-open";

/** A tappable English word or phrase that shows its Bangla meaning in a small bubble. */
function GlossWord({ id, meaning, children }: { id: string; meaning: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onOtherOpen = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== id) setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener(GLOSS_OPEN_EVENT, onOtherOpen);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener(GLOSS_OPEN_EVENT, onOtherOpen);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, id]);

  const show = () => {
    window.dispatchEvent(new CustomEvent(GLOSS_OPEN_EVENT, { detail: id }));
    setOpen(true);
  };

  return (
    <span ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : show())}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") show();
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setOpen(false);
        }}
        aria-expanded={open}
        className={cn(
          "cursor-pointer rounded-[4px] underline decoration-sky-400 decoration-dotted decoration-2 underline-offset-[5px] transition-colors hover:bg-sky-100/70",
          open && "bg-sky-100 decoration-sky-600",
        )}
      >
        {children}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2.5 -translate-x-1/2"
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
          >
            <span className="relative block whitespace-nowrap rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 font-bengali text-[15px] font-semibold tracking-normal text-slate-800 shadow-lg">
              {meaning}
              <span className="absolute left-1/2 top-full -mt-[5px] size-2.5 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-slate-200 bg-white" />
            </span>
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

/**
 * Rich text whose words light up while their audio plays (karaoke style). With `glosses`,
 * matching English words and phrases become tappable for their Bangla meaning.
 */
export function SpokenText({
  text,
  speechId,
  startIndex = 0,
  strongClassName,
  glosses,
}: {
  text: string;
  speechId: string;
  startIndex?: number;
  strongClassName?: string;
  glosses?: readonly WordGloss[];
}) {
  const { speakingId, activeWord } = useLessonSpeech();
  const active = speakingId === speechId ? activeWord : null;
  const tokens = tokenizeRichText(text, startIndex);

  if (!glosses?.length) return <>{renderTokens(tokens, active, strongClassName)}</>;

  return (
    <>
      {groupGlossUnits(tokens, glosses).map((unit, i) =>
        unit.gloss ? (
          <GlossWord key={i} id={`${speechId}:${i}`} meaning={unit.gloss.bn}>
            {renderTokens(unit.tokens, active, strongClassName)}
          </GlossWord>
        ) : (
          <Fragment key={i}>{renderTokens(unit.tokens, active, strongClassName)}</Fragment>
        ),
      )}
    </>
  );
}

export function RichText({ text, strongClassName }: { text: string; strongClassName?: string }) {
  return (
    <>
      {parseRichText(text).map((seg, i) =>
        seg.strong ? (
          <strong key={i} className={cn("font-bold text-sky-700", strongClassName)}>
            {seg.text}
          </strong>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}

const GUIDE_LOGO_SRC =
  "https://res.cloudinary.com/daqvhd097/image/upload/v1782788185/Gamlish_logo_wqw6qs.png";

/** Navy logo inside a gradient ring with a glass shine and an "online" dot that pulses while typing. */
export function GuideAvatarPreview({ active = false }: { active?: boolean }) {
  return (
    <span className="relative flex size-10 shrink-0 rounded-full shadow-[0_6px_16px_-6px_rgba(56,189,248,0.75)]">
      <span
        className="absolute inset-0 rounded-full bg-[conic-gradient(from_200deg,#7dd3fc,#3b82f6,#8b5cf6,#38bdf8,#7dd3fc)]"
        aria-hidden
      />
      <span className="absolute inset-[2.5px] rounded-full bg-white p-[1.5px]">
        <span className="relative flex size-full overflow-hidden rounded-full bg-[#111a2e]">
          <Image
            src={GUIDE_LOGO_SRC}
            alt=""
            width={48}
            height={48}
            className="size-full scale-[1.2] object-cover"
          />
          <span
            className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/30 via-transparent to-transparent"
            aria-hidden
          />
        </span>
      </span>
      {active ? (
        <span className="absolute bottom-[1px] right-[1px] size-2.5 animate-ping rounded-full bg-emerald-400/70" aria-hidden />
      ) : null}
      <span
        className="absolute bottom-[1px] right-[1px] size-2.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_0_1.5px_#fff,0_1px_2px_rgba(0,0,0,0.25)]"
        aria-hidden
      />
    </span>
  );
}

/** Tapping the guide opens the Gamlish profile (intro + feedback) when inside a lesson. */
function GuideAvatar({ hidden, active = false }: { hidden?: boolean; active?: boolean }) {
  const flags = useLessonFlags();
  const lang = useLessonLanguage();
  if (hidden) return <span className="w-10 shrink-0" aria-hidden />;
  if (!flags) {
    return (
      <span className="mt-0.5 shrink-0">
        <GuideAvatarPreview active={active} />
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        flags.openProfile({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }}
      aria-label={pick(FEEDBACK_UI.openProfile, lang)}
      className="mt-0.5 shrink-0 rounded-full transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
    >
      <GuideAvatarPreview active={active} />
    </button>
  );
}

const BUBBLE_SPRING = { type: "spring", stiffness: 420, damping: 32, mass: 0.8 } as const;

/** Chat-app entrance: the bubble grows out of the speaker's side while rising into place. */
function useBubbleEntrance(side: "guide" | "user") {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.15 } };
  return {
    initial: { opacity: 0, y: 14, scale: 0.94, x: side === "guide" ? -6 : 6 },
    animate: { opacity: 1, y: 0, scale: 1, x: 0 },
    transition: BUBBLE_SPRING,
  };
}

export function GuideRow({
  children,
  showAvatar = true,
  avatarActive = false,
  className,
}: {
  children: ReactNode;
  showAvatar?: boolean;
  avatarActive?: boolean;
  className?: string;
}) {
  const entrance = useBubbleEntrance("guide");
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <GuideAvatar hidden={!showAvatar} active={avatarActive} />
      <motion.div className="min-w-0 max-w-[86%] origin-top-left sm:max-w-[78%]" {...entrance}>
        {children}
      </motion.div>
    </div>
  );
}

export function UserRow({ children }: { children: ReactNode }) {
  const entrance = useBubbleEntrance("user");
  return (
    <div className="flex items-start justify-end gap-2.5">
      <motion.div className="flex min-w-0 max-w-[86%] origin-top-right flex-col items-end sm:max-w-[78%]" {...entrance}>
        {children}
      </motion.div>
      <LearnerAvatarButton />
    </div>
  );
}

const BUBBLE_TONE = {
  plain: "border-slate-200/80 bg-white",
  example: "border-sky-200 bg-sky-50",
  remember: "border-amber-200 bg-amber-50",
} as const;

function BubbleTag({ variant, lang }: { variant: "example" | "remember"; lang: LessonLanguage }) {
  const Icon = variant === "example" ? Quote : Lightbulb;
  return (
    <p
      className={cn(
        LANG_FACE[lang],
        "mb-1.5 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.14em]",
        variant === "example" ? "text-sky-700" : "text-amber-700",
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {pick(variant === "example" ? UI.exampleTag : UI.rememberTag, lang)}
    </p>
  );
}

/** Grammar terms stay in English; the explanation follows the chosen language. */
function TermList({ items, lang }: { items: LessonListItem[]; lang: LessonLanguage }) {
  return (
    <ul className="mt-2.5 space-y-2">
      {items.map((item) => (
        <li key={item.term} className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
          <p className={cn(EN_FACE, "text-[15px] font-black leading-snug text-sky-700")}>
            {item.term}
            {lang === "bn" && item.termBn ? (
              <span className={cn(BN_FACE, "ml-1.5 text-[13.5px] font-semibold text-slate-500")}>
                ({item.termBn})
              </span>
            ) : null}
          </p>
          <p className={cn(LANG_FACE[lang], "mt-0.5 text-[14.5px] leading-relaxed text-slate-700")}>
            {item[lang]}
          </p>
        </li>
      ))}
    </ul>
  );
}

const cellText = (cell: LessonTableCell, lang: LessonLanguage) =>
  typeof cell === "string" ? cell : cell[lang];

/** Compact word table: the first column is the English word, highlighted. */
function LessonTableView({ table, lang }: { table: LessonTable; lang: LessonLanguage }) {
  const wrong = new Set(table.wrongColumns ?? []);
  return (
    <div className="mt-2.5 overflow-hidden rounded-xl ring-1 ring-slate-200">
      <table className="w-full border-collapse font-sans text-[14px]">
        <thead>
          <tr className="bg-slate-50">
            {table.columns.map((column, i) => (
              <th
                key={i}
                className={cn(
                  LANG_FACE[lang],
                  "px-3 py-1.5 text-left text-[11px] font-black uppercase tracking-wider",
                  wrong.has(i) ? "text-rose-500" : "text-slate-500",
                )}
              >
                {column[lang]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, r) => (
            <tr key={r} className="border-t border-slate-100">
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={cn(
                    "px-3 py-1.5 align-top leading-snug",
                    wrong.has(c)
                      ? "text-rose-500 line-through decoration-2"
                      : c === 0
                        ? "font-bold text-sky-700"
                        : "text-slate-700",
                  )}
                >
                  {cellText(cell, lang)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const BODY_TEXT: Record<LessonLanguage, string> = {
  en: "text-[15.5px] leading-relaxed",
  bn: "text-[16px] leading-[1.75]",
};

export function GuideMessageBubble({
  speechId,
  message,
  lang,
}: {
  speechId: string;
  message: LessonMessage;
  lang: LessonLanguage;
}) {
  const variant = message.variant ?? "plain";

  if (variant === "example") {
    return (
      <div className={cn("min-w-0 rounded-2xl rounded-tl-md border py-3 pl-4 pr-2.5 shadow-sm", BUBBLE_TONE.example)}>
        <div className="flex items-center justify-between gap-2 pr-1.5">
          <BubbleTag variant="example" lang={lang} />
          {message.glosses?.length ? (
            <span className={cn(LANG_FACE[lang], "mb-1.5 text-[11px] font-semibold text-sky-600/80")}>
              {pick(UI.tapWord, lang)}
            </span>
          ) : null}
        </div>
        <div className="flex items-start gap-2">
          <p className={cn(EN_FACE, "min-w-0 flex-1 text-lg font-bold leading-snug text-slate-900")}>
            <SpokenText text={message.en} speechId={`${speechId}-en`} glosses={message.glosses} />
          </p>
          <SpeakButton id={`${speechId}-en`} text={messageSpeech(message, "en")} lang="en" />
        </div>
        {lang === "bn" ? (
          <div className="mt-1.5 flex items-start gap-2">
            <p className={cn(BN_FACE, "min-w-0 flex-1 text-[15px] leading-relaxed text-slate-600")}>
              <SpokenText text={message.bn} speechId={`${speechId}-bn`} />
            </p>
            <SpeakButton id={`${speechId}-bn`} text={messageSpeech(message, "bn")} lang="bn" />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-w-0 rounded-2xl rounded-tl-md border py-3 pl-4 pr-2.5 shadow-sm",
        BUBBLE_TONE[variant],
      )}
    >
      {message.variant ? <BubbleTag variant={message.variant} lang={lang} /> : null}
      <div className="flex items-start gap-2">
        <p
          className={cn(
            LANG_FACE[lang],
            BODY_TEXT[lang],
            "min-w-0 flex-1 whitespace-pre-line text-slate-800",
          )}
        >
          <SpokenText text={message[lang]} speechId={`${speechId}-${lang}`} />
        </p>
        <SpeakButton id={`${speechId}-${lang}`} text={messageSpeech(message, lang)} lang={lang} />
      </div>
      {message.items ? <TermList items={message.items} lang={lang} /> : null}
      {message.table ? <LessonTableView table={message.table} lang={lang} /> : null}
    </div>
  );
}

export type UserBubbleTone = "brand" | "pending" | "correct" | "wrong";

const USER_TONES: Record<UserBubbleTone, string> = {
  brand: "bg-sky-500 text-white",
  pending: "bg-sky-500/85 text-white",
  correct: "bg-emerald-500 text-white",
  wrong: "bg-rose-500 text-white",
};

export function UserBubble({
  tone = "brand",
  caption,
  lang = "en",
  children,
  footer,
}: {
  tone?: UserBubbleTone;
  caption?: string;
  lang?: LessonLanguage;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl rounded-tr-md px-4 py-3 shadow-sm transition-colors duration-300",
        USER_TONES[tone],
      )}
    >
      {caption ? (
        <p className={cn(LANG_FACE[lang], "mb-1 text-[11.5px] font-semibold text-white/80")}>{caption}</p>
      ) : null}
      {children}
      {footer ? (
        <div className={cn(LANG_FACE[lang], "mt-1.5 text-[11.5px] font-bold text-white/90")}>{footer}</div>
      ) : null}
    </div>
  );
}

const TYPING_DOTS = [0, 0.16, 0.32];

export function TypingIndicator({ showAvatar = true }: { showAvatar?: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <GuideRow showAvatar={showAvatar} avatarActive>
      <div
        className="inline-flex h-11 items-center gap-1.5 rounded-2xl rounded-tl-md border border-slate-200/80 bg-white px-4 shadow-sm"
        role="status"
        aria-label="Gamlish is typing"
      >
        {TYPING_DOTS.map((delay) => (
          <motion.span
            key={delay}
            className="size-2 rounded-full bg-slate-400"
            animate={reduceMotion ? { opacity: [0.4, 1, 0.4] } : { y: [0, -4, 0], opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay }}
          />
        ))}
      </div>
    </GuideRow>
  );
}
