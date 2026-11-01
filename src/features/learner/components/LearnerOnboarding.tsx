"use client";

import { useEffect, useMemo, useRef, useState, type FocusEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Globe, MapPin, Search, SendHorizontal } from "lucide-react";
import { GuideAvatarPreview, RichText } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LanguageSwitch } from "@/src/features/chat-lesson/components/LessonChrome";
import { setLessonLanguage, useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import type { AddressAs, ChatMissionProfileInput } from "@/src/lib/api/chatMission";
import { LearnerAvatarImage } from "@/src/features/learner/components/LearnerAvatar";
import { LEARNER_UI } from "@/src/features/learner/lib/copy";
import { BD_DISTRICTS, districtLabel, NAME_BN_PATTERN, NAME_EN_PATTERN } from "@/src/features/learner/lib/districts";
import { personalizeText, type Learner } from "@/src/features/learner/lib/personalize";
import { cn } from "@/lib/utils";

type Stage = "nameEn" | "nameBn" | "address" | "place" | "country" | "saving" | "done";

type Entry = { id: number; from: "guide" | "me"; text: Bilingual };

const asIs = (text: string): Bilingual => ({ en: text, bn: text });

const ADDRESS_OPTIONS: ReadonlyArray<{
  value: AddressAs;
  en: string;
  bn: string;
  callMe: Bilingual;
  tile: string;
  ring: string;
  dot: string;
}> = [
  {
    value: "bhaiya",
    en: "Bhaiya",
    bn: "ভাইয়া",
    callMe: LEARNER_UI.callMeBhaiya,
    tile: "border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100",
    ring: "border-sky-400",
    dot: "bg-sky-500",
  },
  {
    value: "apu",
    en: "Apu",
    bn: "আপু",
    callMe: LEARNER_UI.callMeApu,
    tile: "border-pink-300 bg-pink-50 text-pink-800 hover:bg-pink-100",
    ring: "border-pink-400",
    dot: "bg-pink-500",
  },
];

const REPLY_IN = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2, duration: 0.25 } };

/** Keeps the focused box visible above the phone keyboard. */
function keepInView(event: FocusEvent<HTMLElement>) {
  const target = event.currentTarget;
  window.setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
}

function GuideLine({ text, lang, showAvatar }: { text: Bilingual; lang: LessonLanguage; showAvatar: boolean }) {
  return (
    <div className="flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {showAvatar ? <GuideAvatarPreview /> : <span className="w-10 shrink-0" aria-hidden />}
      <p
        className={cn(
          LANG_FACE[lang],
          "max-w-[82%] rounded-2xl rounded-tl-md border border-slate-200/80 bg-white px-4 py-2.5 leading-relaxed text-slate-800 shadow-sm",
          lang === "en" ? "text-[15.5px]" : "text-[16.5px]",
        )}
      >
        <RichText text={pick(text, lang)} />
      </p>
    </div>
  );
}

function MyLine({ text, lang, learner }: { text: Bilingual; lang: LessonLanguage; learner: Learner }) {
  return (
    <div className="flex items-start justify-end gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <p className={cn(LANG_FACE[lang], "max-w-[78%] rounded-2xl rounded-tr-md bg-sky-500 px-4 py-2.5 text-[15.5px] font-semibold text-white shadow-sm")}>
        {pick(text, lang)}
      </p>
      <LearnerAvatarImage learner={learner} />
    </div>
  );
}

/** The learner's answer box, placed in the chat right under Gamlish's question. */
function ReplyCard({
  label,
  lang,
  learner,
  error,
  children,
}: {
  label: Bilingual;
  lang: LessonLanguage;
  learner: Learner;
  error: Bilingual | null;
  children: ReactNode;
}) {
  const face = LANG_FACE[lang];
  return (
    <motion.div className="flex items-start justify-end gap-2.5" {...REPLY_IN}>
      <div className="w-full max-w-[85%] rounded-2xl rounded-tr-md border-2 border-sky-300 bg-white p-3 shadow-sm sm:max-w-md">
        <p className={cn(face, "mb-2 text-xs font-black uppercase tracking-wider text-sky-700")}>{pick(label, lang)}</p>
        {children}
        {error ? <p className={cn(face, "mt-2 text-sm font-semibold text-rose-600")}>{pick(error, lang)}</p> : null}
      </div>
      <LearnerAvatarImage learner={learner} />
    </motion.div>
  );
}

/**
 * The welcome chat before Start Here: nickname in English and Bangla, Bhaiya or Apu, and where the
 * learner lives. Each answer box appears in the chat right under its question. Names are always
 * typed by the learner (never suggested), so a quick tap can never save the wrong name.
 */
export function LearnerOnboarding({
  initial,
  onSave,
  onDone,
}: {
  /** Existing answers; only the country is pre-filled when the learner is asked again. */
  initial: Partial<ChatMissionProfileInput> | null;
  onSave: (input: ChatMissionProfileInput) => Promise<Learner>;
  onDone: () => void;
}) {
  const lang = useLessonLanguage();
  const face = LANG_FACE[lang];
  const [stage, setStage] = useState<Stage>("nameEn");
  const [entries, setEntries] = useState<Entry[]>(() => [
    { id: 1, from: "guide", text: LEARNER_UI.hello },
    { id: 2, from: "guide", text: LEARNER_UI.askNameEn },
  ]);
  const [draft, setDraft] = useState("");
  const [answers, setAnswers] = useState<Partial<ChatMissionProfileInput>>({});
  const [search, setSearch] = useState("");
  const [error, setError] = useState<Bilingual | null>(null);
  const [saved, setSaved] = useState<Learner | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const previewLearner: Learner = saved ?? {
    nicknameEn: answers.nicknameEn ?? "?",
    nicknameBn: answers.nicknameBn ?? "",
    addressAs: answers.addressAs ?? "bhaiya",
    district: null,
    country: null,
    photoSrc: null,
  };

  useEffect(() => {
    const timer = window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 250);
    return () => window.clearTimeout(timer);
  }, [entries.length, stage]);

  useEffect(() => {
    if (stage !== "nameEn" && stage !== "nameBn" && stage !== "country") return;
    const timer = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 350);
    return () => window.clearTimeout(timer);
  }, [stage]);

  const push = (...items: Omit<Entry, "id">[]) =>
    setEntries((list) => [...list, ...items.map((item, i) => ({ ...item, id: list.length + i + 1 }))]);

  const submitText = () => {
    const value = draft.trim().replace(/\s+/g, " ");
    if (!value) return;
    if (stage === "nameEn") {
      if (!NAME_EN_PATTERN.test(value)) return setError(LEARNER_UI.typeEnglishLetters);
      setError(null);
      setAnswers((a) => ({ ...a, nicknameEn: value }));
      push({ from: "me", text: LEARNER_UI.callMeName(value) }, { from: "guide", text: LEARNER_UI.askNameBn });
      setDraft("");
      setStage("nameBn");
      return;
    }
    if (stage === "nameBn") {
      if (!NAME_BN_PATTERN.test(value)) return setError(LEARNER_UI.typeBanglaLetters);
      setError(null);
      setAnswers((a) => ({ ...a, nicknameBn: value }));
      push({ from: "me", text: LEARNER_UI.callMeName(value) }, { from: "guide", text: LEARNER_UI.askAddress });
      setDraft("");
      setStage("address");
      return;
    }
    if (stage === "country") {
      if (value.length < 2) return;
      push({ from: "me", text: asIs(value) });
      void finish({ district: null, country: value });
    }
  };

  const chooseAddress = (addressAs: AddressAs) => {
    const next = { ...answers, addressAs };
    setAnswers(next);
    const learner: Learner = {
      nicknameEn: next.nicknameEn ?? "",
      nicknameBn: next.nicknameBn ?? "",
      addressAs,
      district: null,
      country: null,
      photoSrc: null,
    };
    push(
      { from: "me", text: addressAs === "bhaiya" ? LEARNER_UI.callMeBhaiya : LEARNER_UI.callMeApu },
      { from: "guide", text: personalizeText(LEARNER_UI.askPlace, learner) },
    );
    setStage("place");
  };

  const chooseDistrict = (district: string) => {
    push({ from: "me", text: { en: district, bn: districtLabel(district, "bn") } });
    void finish({ district, country: null });
  };

  const chooseOutside = () => {
    push({ from: "me", text: LEARNER_UI.outsideBd }, { from: "guide", text: LEARNER_UI.askCountry });
    setDraft(initial?.country ?? "");
    setStage("country");
  };

  const finish = async (place: { district: string | null; country: string | null }) => {
    const input: ChatMissionProfileInput = {
      nicknameEn: answers.nicknameEn ?? "",
      nicknameBn: answers.nicknameBn ?? "",
      addressAs: answers.addressAs ?? "bhaiya",
      ...place,
    };
    setStage("saving");
    setError(null);
    try {
      const learner = await onSave(input);
      setSaved(learner);
      push({ from: "guide", text: personalizeText(LEARNER_UI.done, learner) });
      setStage("done");
    } catch {
      setError(LEARNER_UI.saveFailed);
      setStage(place.district ? "place" : "country");
    }
  };

  const districts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return BD_DISTRICTS;
    return BD_DISTRICTS.filter((d) => d.en.toLowerCase().includes(q) || d.bn.includes(search.trim()));
  }, [search]);

  const textStage = stage === "nameEn" || stage === "nameBn" || stage === "country";
  const textLabel = stage === "nameEn" ? LEARNER_UI.replyCallMe : stage === "nameBn" ? LEARNER_UI.replyCallMeBn : LEARNER_UI.replyLiveIn;
  const placeholder =
    stage === "nameEn" ? LEARNER_UI.nameEnPlaceholder : stage === "nameBn" ? LEARNER_UI.nameBnPlaceholder : LEARNER_UI.countryPlaceholder;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-slate-50 bg-gradient-to-b from-sky-50 via-slate-50 to-slate-50">
      <header className="shrink-0 border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <p className={cn(face, "text-base font-black text-slate-900")}>Gamlish</p>
          <LanguageSwitch lang={lang} onChange={setLessonLanguage} />
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-2xl space-y-3 px-3 pb-10 pt-5 sm:px-4">
          {entries.map((entry, i) =>
            entry.from === "guide" ? (
              <GuideLine key={entry.id} text={entry.text} lang={lang} showAvatar={entries[i - 1]?.from !== "guide"} />
            ) : (
              <MyLine key={entry.id} text={entry.text} lang={lang} learner={previewLearner} />
            ),
          )}

          {textStage ? (
            <ReplyCard key={stage} label={textLabel} lang={lang} learner={previewLearner} error={error}>
              <form
                className="flex items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitText();
                }}
              >
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value.slice(0, stage === "country" ? 60 : 40))}
                  onFocus={keepInView}
                  placeholder={pick(placeholder, lang)}
                  aria-label={pick(textLabel, lang)}
                  autoComplete="off"
                  enterKeyHint="send"
                  className={cn(
                    stage === "nameBn" ? "font-bengali" : "font-sans",
                    "h-12 min-w-0 flex-1 rounded-xl border-2 border-sky-200 bg-sky-50/60 px-3.5 text-lg font-semibold text-slate-900 outline-none focus:border-sky-500 focus:bg-white",
                  )}
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  aria-label={pick(LEARNER_UI.send, lang)}
                  className="flex size-12 shrink-0 items-center justify-center rounded-xl border-b-4 border-sky-700 bg-sky-500 text-white disabled:opacity-40"
                >
                  <SendHorizontal className="size-5" aria-hidden />
                </button>
              </form>
            </ReplyCard>
          ) : null}

          {stage === "address" ? (
            <ReplyCard label={LEARNER_UI.pickOne} lang={lang} learner={previewLearner} error={null}>
              <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label={pick(LEARNER_UI.askAddress, lang)}>
                {ADDRESS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={false}
                    onClick={() => chooseAddress(option.value)}
                    className={cn(
                      "group flex flex-col items-center gap-1.5 rounded-2xl border-2 border-b-[5px] px-2 pb-3 pt-3.5 text-center shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2",
                      option.tile,
                    )}
                  >
                    <span className={cn("flex size-6 items-center justify-center rounded-full border-2 bg-white", option.ring)} aria-hidden>
                      <span className={cn("size-2.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100", option.dot)} />
                    </span>
                    <span className="font-sans text-xl font-black leading-none">{option.en}</span>
                    <span className="font-bengali text-base font-bold leading-none opacity-80">{option.bn}</span>
                    <span className={cn(face, "mt-1 text-[12px] font-semibold opacity-75")}>{pick(option.callMe, lang)}</span>
                  </button>
                ))}
              </div>
            </ReplyCard>
          ) : null}

          {stage === "place" ? (
            <ReplyCard label={LEARNER_UI.replyLiveIn} lang={lang} learner={previewLearner} error={error}>
              <label className="flex items-center gap-2 rounded-xl border-2 border-sky-200 bg-sky-50/60 px-3 focus-within:border-sky-500 focus-within:bg-white">
                <Search className="size-4 shrink-0 text-sky-500" aria-hidden />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onFocus={keepInView}
                  placeholder={pick(LEARNER_UI.searchDistrict, lang)}
                  aria-label={pick(LEARNER_UI.searchDistrict, lang)}
                  className={cn(face, "h-11 min-w-0 flex-1 bg-transparent text-[15px] font-semibold outline-none")}
                />
              </label>
              <div className="mt-2 grid max-h-64 grid-cols-2 gap-1.5 overflow-y-auto overscroll-contain pr-1">
                {districts.map((district) => (
                  <button
                    key={district.en}
                    type="button"
                    onClick={() => chooseDistrict(district.en)}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-2.5 py-2 text-left ring-1 ring-slate-200 hover:bg-sky-50 hover:ring-sky-300"
                  >
                    <MapPin className="size-3.5 shrink-0 text-sky-500" aria-hidden />
                    <span className="min-w-0">
                      <span className="block truncate font-sans text-[13px] font-bold text-slate-800">{district.en}</span>
                      <span className="block truncate font-bengali text-[12px] text-slate-500">{district.bn}</span>
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={chooseOutside}
                className={cn(face, "mt-2 flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 text-sm font-bold text-slate-600 hover:bg-slate-50")}
              >
                <Globe className="size-4" aria-hidden />
                {pick(LEARNER_UI.outsideBd, lang)}
              </button>
            </ReplyCard>
          ) : null}

          {stage === "saving" ? (
            <p className={cn(face, "py-2 text-right text-sm font-semibold text-slate-500")}>{pick(LEARNER_UI.saving, lang)}</p>
          ) : null}

          {stage === "done" ? (
            <motion.div {...REPLY_IN}>
              <button
                type="button"
                onClick={onDone}
                autoFocus
                className={cn(
                  face,
                  "mt-2 h-13 w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 text-base font-extrabold text-white",
                  lang === "en" && "uppercase tracking-wide",
                )}
              >
                {pick(LEARNER_UI.continueLesson, lang)}
              </button>
            </motion.div>
          ) : null}

          <div ref={bottomRef} className="h-px" aria-hidden />
        </div>
      </main>
    </div>
  );
}
