"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Globe, MapPin, Search, SendHorizontal } from "lucide-react";
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

type Stage = "confirmName" | "nameEn" | "nameBn" | "address" | "place" | "country" | "saving" | "done";

type Entry = { id: number; from: "guide" | "me"; text: Bilingual };

const asIs = (text: string): Bilingual => ({ en: text, bn: text });

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

/**
 * The welcome chat before Start Here: nickname in English and Bangla, Bhaiya or Apu, and where the
 * learner lives. Nothing can be skipped; answers are saved to the learner profile.
 */
export function LearnerOnboarding({
  suggestedNameEn,
  initial,
  onSave,
  onDone,
}: {
  suggestedNameEn: string | null;
  /** Existing answers, offered as suggestions when the learner is asked again. */
  initial: Partial<ChatMissionProfileInput> | null;
  onSave: (input: ChatMissionProfileInput) => Promise<Learner>;
  onDone: () => void;
}) {
  const lang = useLessonLanguage();
  const face = LANG_FACE[lang];
  const suggestion = initial?.nicknameEn ?? suggestedNameEn;
  const [stage, setStage] = useState<Stage>(suggestion ? "confirmName" : "nameEn");
  const [entries, setEntries] = useState<Entry[]>(() => [
    { id: 1, from: "guide", text: LEARNER_UI.hello },
    { id: 2, from: "guide", text: suggestion ? LEARNER_UI.askSuggested(suggestion) : LEARNER_UI.askNameEn },
  ]);
  const [draft, setDraft] = useState("");
  const [answers, setAnswers] = useState<Partial<ChatMissionProfileInput>>({});
  const [search, setSearch] = useState("");
  const [error, setError] = useState<Bilingual | null>(null);
  const [saved, setSaved] = useState<Learner | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const previewLearner: Learner = saved ?? {
    nicknameEn: answers.nicknameEn ?? suggestion ?? "?",
    nicknameBn: answers.nicknameBn ?? "",
    addressAs: answers.addressAs ?? "bhaiya",
    district: null,
    country: null,
    photoSrc: null,
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [entries.length, stage]);

  useEffect(() => {
    if (stage === "nameEn" || stage === "nameBn" || stage === "country") inputRef.current?.focus();
  }, [stage]);

  const push = (...items: Omit<Entry, "id">[]) =>
    setEntries((list) => [...list, ...items.map((item, i) => ({ ...item, id: list.length + i + 1 }))]);

  const askBangla = (nicknameEn: string) => {
    setAnswers((a) => ({ ...a, nicknameEn }));
    setDraft(initial?.nicknameBn ?? "");
    setStage("nameBn");
    push({ from: "guide", text: LEARNER_UI.askNameBn });
  };

  const confirmSuggested = (yes: boolean) => {
    if (!suggestion) return;
    push({ from: "me", text: yes ? LEARNER_UI.yes : LEARNER_UI.changeIt });
    if (yes) {
      askBangla(suggestion);
    } else {
      setDraft("");
      setStage("nameEn");
      push({ from: "guide", text: LEARNER_UI.askNameEn });
    }
  };

  const submitText = () => {
    const value = draft.trim().replace(/\s+/g, " ");
    if (!value) return;
    if (stage === "nameEn") {
      if (!NAME_EN_PATTERN.test(value)) return setError(LEARNER_UI.typeEnglishLetters);
      setError(null);
      push({ from: "me", text: asIs(value) });
      askBangla(value);
      return;
    }
    if (stage === "nameBn") {
      if (!NAME_BN_PATTERN.test(value)) return setError(LEARNER_UI.typeBanglaLetters);
      setError(null);
      setAnswers((a) => ({ ...a, nicknameBn: value }));
      push({ from: "me", text: asIs(value) }, { from: "guide", text: LEARNER_UI.askAddress });
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
      { from: "me", text: addressAs === "bhaiya" ? LEARNER_UI.bhaiya : LEARNER_UI.apu },
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
  const placeholder =
    stage === "nameEn" ? LEARNER_UI.nameEnPlaceholder : stage === "nameBn" ? LEARNER_UI.nameBnPlaceholder : LEARNER_UI.countryPlaceholder;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-slate-50 bg-gradient-to-b from-sky-50 via-slate-50 to-slate-50">
      <header className="shrink-0 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <p className={cn(face, "text-base font-black text-slate-900")}>Gamlish</p>
          <LanguageSwitch lang={lang} onChange={setLessonLanguage} />
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-2xl space-y-3 px-3 pb-6 pt-5 sm:px-4">
          {entries.map((entry, i) =>
            entry.from === "guide" ? (
              <GuideLine key={entry.id} text={entry.text} lang={lang} showAvatar={entries[i - 1]?.from !== "guide"} />
            ) : (
              <MyLine key={entry.id} text={entry.text} lang={lang} learner={previewLearner} />
            ),
          )}
          <div ref={bottomRef} className="h-px" aria-hidden />
        </div>
      </main>

      <motion.footer
        className="shrink-0 border-t border-slate-200 bg-white px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-3"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="mx-auto w-full max-w-2xl">
          {error ? <p className={cn(face, "mb-2 text-sm font-semibold text-rose-600")}>{pick(error, lang)}</p> : null}

          {stage === "confirmName" ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => confirmSuggested(true)}
                className={cn(face, "flex h-12 items-center justify-center gap-1.5 rounded-2xl border-b-4 border-sky-700 bg-sky-500 font-extrabold text-white")}
              >
                <Check className="size-4" aria-hidden />
                {pick(LEARNER_UI.yes, lang)}
              </button>
              <button
                type="button"
                onClick={() => confirmSuggested(false)}
                className={cn(face, "h-12 rounded-2xl border-2 border-b-4 border-slate-200 bg-white font-bold text-slate-700")}
              >
                {pick(LEARNER_UI.changeIt, lang)}
              </button>
            </div>
          ) : null}

          {textStage ? (
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
                placeholder={pick(placeholder, lang)}
                aria-label={pick(placeholder, lang)}
                autoComplete="off"
                className={cn(
                  stage === "nameBn" ? "font-bengali" : "font-sans",
                  "h-12 min-w-0 flex-1 rounded-2xl border-2 border-sky-200 bg-sky-50/60 px-4 text-lg font-semibold text-slate-900 outline-none focus:border-sky-500 focus:bg-white",
                )}
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                aria-label={pick(LEARNER_UI.send, lang)}
                className="flex size-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-sky-700 bg-sky-500 text-white disabled:opacity-40"
              >
                <SendHorizontal className="size-5" aria-hidden />
              </button>
            </form>
          ) : null}

          {stage === "address" ? (
            <div className="grid grid-cols-2 gap-2">
              {(["bhaiya", "apu"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => chooseAddress(value)}
                  className={cn(face, "h-14 rounded-2xl border-2 border-b-4 border-sky-200 bg-white text-lg font-black text-sky-700 hover:bg-sky-50")}
                >
                  {pick(value === "bhaiya" ? LEARNER_UI.bhaiya : LEARNER_UI.apu, lang)}
                </button>
              ))}
            </div>
          ) : null}

          {stage === "place" ? (
            <div className="space-y-2">
              <label className="flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-3">
                <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={pick(LEARNER_UI.searchDistrict, lang)}
                  aria-label={pick(LEARNER_UI.searchDistrict, lang)}
                  className={cn(face, "h-11 min-w-0 flex-1 bg-transparent text-[15px] font-semibold outline-none")}
                />
              </label>
              <div className="grid max-h-48 grid-cols-2 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-3">
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
                className={cn(face, "flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 text-sm font-bold text-slate-600 hover:bg-slate-50")}
              >
                <Globe className="size-4" aria-hidden />
                {pick(LEARNER_UI.outsideBd, lang)}
              </button>
            </div>
          ) : null}

          {stage === "saving" ? (
            <p className={cn(face, "py-3 text-center text-sm font-semibold text-slate-500")}>{pick(LEARNER_UI.saving, lang)}</p>
          ) : null}

          {stage === "done" ? (
            <button
              type="button"
              onClick={onDone}
              autoFocus
              className={cn(
                face,
                "h-12 w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 text-base font-extrabold text-white",
                lang === "en" && "uppercase tracking-wide",
              )}
            >
              {pick(LEARNER_UI.continueLesson, lang)}
            </button>
          ) : null}
        </div>
      </motion.footer>
    </div>
  );
}
