"use client";

import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Camera, Gamepad2, MapPin, Pencil, Trophy, X } from "lucide-react";
import { useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import type { AddressAs } from "@/src/lib/api/chatMission";
import { LearnerAvatarImage } from "@/src/features/learner/components/LearnerAvatar";
import { useLearnerContext, type LearnerActions, type LearnerProgress } from "@/src/features/learner/LearnerContext";
import { EarlyAdopterV2Badge } from "@/src/components/profile/EarlyAdopterV2Badge";
import { LEARNER_UI } from "@/src/features/learner/lib/copy";
import { BD_DISTRICTS, districtLabel, NAME_BN_PATTERN, NAME_EN_PATTERN } from "@/src/features/learner/lib/districts";
import { callName, personalizeText, type Learner } from "@/src/features/learner/lib/personalize";
import { cn } from "@/lib/utils";

const OUTSIDE = "__outside__";

function placeLabel(learner: Learner, lang: LessonLanguage): string {
  if (learner.district) return districtLabel(learner.district, lang);
  return learner.country ?? pick(LEARNER_UI.outsideBdShort, lang);
}

function EditForm({
  learner,
  actions,
  lang,
  onDone,
}: {
  learner: Learner;
  actions: LearnerActions;
  lang: LessonLanguage;
  onDone: () => void;
}) {
  const face = LANG_FACE[lang];
  const [nicknameEn, setNicknameEn] = useState(learner.nicknameEn);
  const [nicknameBn, setNicknameBn] = useState(learner.nicknameBn);
  const [addressAs, setAddressAs] = useState<AddressAs>(learner.addressAs);
  const [place, setPlace] = useState(learner.district ?? OUTSIDE);
  const [country, setCountry] = useState(learner.country ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validEn = NAME_EN_PATTERN.test(nicknameEn.trim());
  const validBn = NAME_BN_PATTERN.test(nicknameBn.trim());
  const validPlace = place !== OUTSIDE || country.trim().length >= 2;

  const save = async () => {
    if (!validEn || !validBn || !validPlace || saving) return;
    setSaving(true);
    setError(null);
    try {
      await actions.saveProfile({
        nicknameEn: nicknameEn.trim(),
        nicknameBn: nicknameBn.trim(),
        addressAs,
        district: place === OUTSIDE ? null : place,
        country: place === OUTSIDE ? country.trim() : null,
      });
      onDone();
    } catch {
      setError(pick(LEARNER_UI.saveFailed, lang));
    } finally {
      setSaving(false);
    }
  };

  const field = "w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-[15px] font-semibold text-slate-800 outline-none focus:border-orange-400";

  return (
    <div className="mt-4 space-y-3 text-left">
      <label className="block">
        <span className={cn(face, "text-xs font-bold text-slate-500")}>{pick(LEARNER_UI.nameEnLabel, lang)}</span>
        <input value={nicknameEn} maxLength={40} onChange={(e) => setNicknameEn(e.target.value)} className={cn(field, "mt-1 font-sans")} />
      </label>
      <label className="block">
        <span className={cn(face, "text-xs font-bold text-slate-500")}>{pick(LEARNER_UI.nameBnLabel, lang)}</span>
        <input value={nicknameBn} maxLength={40} onChange={(e) => setNicknameBn(e.target.value)} className={cn(field, "mt-1 font-bengali")} />
      </label>
      <div>
        <span className={cn(face, "text-xs font-bold text-slate-500")}>{pick(LEARNER_UI.callMeLabel, lang)}</span>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {(["bhaiya", "apu"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setAddressAs(value)}
              className={cn(
                face,
                "h-10 rounded-xl border-2 text-sm font-bold transition-colors",
                addressAs === value ? "border-orange-400 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600",
              )}
            >
              {pick(value === "bhaiya" ? LEARNER_UI.bhaiya : LEARNER_UI.apu, lang)}
            </button>
          ))}
        </div>
      </div>
      <label className="block">
        <span className={cn(face, "text-xs font-bold text-slate-500")}>{pick(LEARNER_UI.districtLabel, lang)}</span>
        <select value={place} onChange={(e) => setPlace(e.target.value)} className={cn(field, "mt-1", face)}>
          {BD_DISTRICTS.map((district) => (
            <option key={district.en} value={district.en}>
              {lang === "bn" ? `${district.bn} (${district.en})` : district.en}
            </option>
          ))}
          <option value={OUTSIDE}>{pick(LEARNER_UI.outsideBdShort, lang)}</option>
        </select>
      </label>
      {place === OUTSIDE ? (
        <label className="block">
          <span className={cn(face, "text-xs font-bold text-slate-500")}>{pick(LEARNER_UI.countryLabel, lang)}</span>
          <input value={country} maxLength={60} onChange={(e) => setCountry(e.target.value)} className={cn(field, "mt-1")} />
        </label>
      ) : null}
      {!validEn ? <p className={cn(face, "text-xs font-semibold text-rose-600")}>{pick(LEARNER_UI.typeEnglishLetters, lang)}</p> : null}
      {!validBn ? <p className={cn(face, "text-xs font-semibold text-rose-600")}>{pick(LEARNER_UI.typeBanglaLetters, lang)}</p> : null}
      {error ? <p className={cn(face, "text-xs font-semibold text-rose-600")}>{error}</p> : null}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button type="button" onClick={onDone} className={cn(face, "h-11 rounded-xl bg-slate-100 text-sm font-bold text-slate-600")}>
          {pick(LEARNER_UI.cancel, lang)}
        </button>
        <button
          type="button"
          onClick={() => void save()}
          disabled={!validEn || !validBn || !validPlace || saving}
          className={cn(face, "h-11 rounded-xl border-b-4 border-orange-600 bg-orange-500 text-sm font-extrabold text-white disabled:opacity-50")}
        >
          {pick(saving ? LEARNER_UI.saving : LEARNER_UI.save, lang)}
        </button>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-slate-50 px-2 py-2.5 ring-1 ring-slate-100">
      <span className="text-orange-500">{icon}</span>
      <span className="mt-1 font-sans text-base font-black text-slate-900">{value}</span>
      <span className="text-[11px] font-bold text-slate-500">{label}</span>
    </div>
  );
}

function LevelBanner({ level, lang }: { level: LearnerProgress["level"]; lang: LessonLanguage }) {
  const face = LANG_FACE[lang];
  const { stop } = level;
  return (
    <div className="mt-4 flex items-center gap-3 rounded-2xl border-b-4 border-sky-700 bg-gradient-to-r from-sky-500 to-indigo-500 p-3 text-white shadow-sm">
      <div className="flex min-w-[4.5rem] flex-col items-center rounded-xl bg-white/20 px-3 py-1.5 ring-1 ring-white/30">
        <span className={cn(face, "text-[11px] font-black uppercase tracking-wider text-sky-50")}>
          {pick(LEARNER_UI.level, lang)}
        </span>
        <span className="font-sans text-3xl font-black leading-none">{level.number}</span>
      </div>
      <div className="min-w-0 flex-1">
        {stop ? (
          <>
            <p className={cn(face, "text-xs font-bold text-sky-100")}>{pick(LEARNER_UI.nowLearning, lang)}</p>
            <p className="truncate font-sans text-base font-black leading-tight">
              {stop.title.en}
              {lang === "bn" && stop.title.bn !== stop.title.en ? (
                <span className="ml-1.5 font-bengali text-sm font-semibold text-sky-100">({stop.title.bn})</span>
              ) : null}
            </p>
            <p className={cn(face, "mt-0.5 text-xs font-semibold text-sky-100")}>
              {pick(LEARNER_UI.stopOf(stop.index, stop.total), lang)}
            </p>
          </>
        ) : (
          <>
            <p className={cn(face, "flex items-center gap-1.5 text-base font-black")}>
              <Trophy className="size-4" aria-hidden />
              {pick(LEARNER_UI.levelComplete, lang)}
            </p>
            <p className={cn(face, "text-xs font-semibold text-sky-100")}>{pick(LEARNER_UI.levelCompleteSub, lang)}</p>
          </>
        )}
      </div>
    </div>
  );
}

/** The learner's own profile, opened from their avatar in the chat. Mount once per page. */
export function LearnerProfileHost() {
  const { learner, actions, progress, profileOpen, closeProfile } = useLearnerContext();
  const lang = useLessonLanguage();
  const face = LANG_FACE[lang];
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const name = callName(learner);

  const pickPhoto = async (file: File | undefined) => {
    if (!file || !actions) return;
    setUploading(true);
    setPhotoError(false);
    try {
      await actions.uploadPhoto(file);
    } catch {
      setPhotoError(true);
    } finally {
      setUploading(false);
    }
  };

  const close = () => {
    setEditing(false);
    closeProfile();
  };

  return (
    <AnimatePresence>
      {profileOpen ? (
        <motion.div key="learner-profile" className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label={pick(LEARNER_UI.close, lang)}
            onClick={close}
            className="absolute inset-0 cursor-default bg-slate-900/45 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={name.en}
            className="relative max-h-[92dvh] w-full max-w-sm overflow-y-auto rounded-[28px] bg-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
          >
            <div className="relative h-28 overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500">
              <span className="absolute -right-8 -top-10 size-36 rounded-full bg-white/15" aria-hidden />
              <span className="absolute -left-6 bottom-[-46px] size-28 rounded-full bg-white/10" aria-hidden />
              <button
                type="button"
                onClick={close}
                aria-label={pick(LEARNER_UI.close, lang)}
                className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <div className="px-5 pb-5">
              <div className="-mt-12 flex items-end justify-between">
                <span className="relative rounded-full bg-white p-1 shadow-lg">
                  <LearnerAvatarImage learner={learner} size="lg" />
                  {actions ? (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      aria-label={pick(LEARNER_UI.changePhoto, lang)}
                      className="absolute bottom-0 right-0 flex size-9 items-center justify-center rounded-full bg-orange-500 text-white ring-4 ring-white"
                    >
                      <Camera className="size-4" aria-hidden />
                    </button>
                  ) : null}
                </span>
                <span className={cn(face, "mb-1 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 ring-1 ring-orange-200")}>
                  <MapPin className="size-3.5" aria-hidden />
                  {placeLabel(learner, lang)}
                </span>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void pickPhoto(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />

              <h2 className="mt-3 font-sans text-2xl font-black tracking-tight text-slate-900">{name.en}</h2>
              <p className="font-bengali text-base font-semibold text-slate-500">{name.bn}</p>
              <p className={cn(face, "mt-0.5 text-xs font-bold uppercase tracking-wider text-orange-500")}>
                {pick(LEARNER_UI.profileLearner, lang)}
              </p>
              {progress?.earlyAdopter ? <EarlyAdopterV2Badge className="mt-2" /> : null}
              {uploading ? <p className={cn(face, "mt-2 text-xs font-semibold text-slate-500")}>{pick(LEARNER_UI.uploading, lang)}</p> : null}
              {photoError ? <p className={cn(face, "mt-2 text-xs font-semibold text-rose-600")}>{pick(LEARNER_UI.photoFailed, lang)}</p> : null}

              {progress ? <LevelBanner level={progress.level} lang={lang} /> : null}

              {progress ? (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Stat
                    icon={<BookOpen className="size-4" aria-hidden />}
                    label={pick(LEARNER_UI.lessons, lang)}
                    value={`${progress.lessonsDone}/${progress.lessonsTotal}`}
                  />
                  <Stat
                    icon={<Gamepad2 className="size-4" aria-hidden />}
                    label={pick(LEARNER_UI.games, lang)}
                    value={`${progress.gamesDone}/${progress.gamesTotal}`}
                  />
                  <Stat
                    icon={<Trophy className="size-4" aria-hidden />}
                    label={pick(LEARNER_UI.finalTest, lang)}
                    value={progress.finalTestScore ? `${progress.finalTestScore.score}/${progress.finalTestScore.max}` : pick(LEARNER_UI.notYet, lang)}
                  />
                </div>
              ) : null}

              {actions && editing ? (
                <EditForm learner={learner} actions={actions} lang={lang} onDone={() => setEditing(false)} />
              ) : actions ? (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className={cn(face, "flex h-11 items-center justify-center gap-1.5 rounded-xl border-b-4 border-orange-600 bg-orange-500 text-sm font-extrabold text-white")}
                  >
                    <Camera className="size-4" aria-hidden />
                    {pick(learner.photoSrc ? LEARNER_UI.changePhoto : LEARNER_UI.choosePhoto, lang)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className={cn(face, "flex h-11 items-center justify-center gap-1.5 rounded-xl bg-slate-100 text-sm font-bold text-slate-700")}
                  >
                    <Pencil className="size-4" aria-hidden />
                    {pick(LEARNER_UI.editDetails, lang)}
                  </button>
                </div>
              ) : (
                <p className={cn(face, "mt-4 text-sm font-semibold text-slate-500")}>
                  {pick(personalizeText(LEARNER_UI.photoSaved, learner), lang)}
                </p>
              )}
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
