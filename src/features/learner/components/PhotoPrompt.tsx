"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { GuideAvatarPreview } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import { LearnerAvatarImage } from "@/src/features/learner/components/LearnerAvatar";
import { LEARNER_UI } from "@/src/features/learner/lib/copy";
import { personalizeText, type Learner } from "@/src/features/learner/lib/personalize";
import { cn } from "@/lib/utils";

/** Offered after a passed game: "Add your photo so I can see you!" */
export function PhotoPrompt({
  learner,
  lang,
  onUpload,
  onLater,
  onClose,
}: {
  learner: Learner;
  lang: LessonLanguage;
  onUpload: (file: File) => Promise<void>;
  onLater: () => void;
  onClose: () => void;
}) {
  const face = LANG_FACE[lang];
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);

  const choose = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setFailed(false);
    try {
      await onUpload(file);
      setDone(true);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <motion.div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
      <motion.section
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm rounded-[28px] bg-white p-5 text-center shadow-2xl"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      >
        <div className="flex items-center justify-center gap-3">
          <span className="scale-125">
            <GuideAvatarPreview />
          </span>
          <span className="text-2xl" aria-hidden>
            👋
          </span>
          <LearnerAvatarImage learner={learner} size="md" />
        </div>
        <h2 className={cn(face, "mt-4 text-xl font-black text-slate-900")}>
          {pick(personalizeText(done ? LEARNER_UI.photoSaved : LEARNER_UI.photoTitle, learner), lang)}
        </h2>
        {!done ? <p className={cn(face, "mt-1.5 text-sm font-semibold leading-relaxed text-slate-600")}>{pick(LEARNER_UI.photoBody, lang)}</p> : null}
        {failed ? <p className={cn(face, "mt-2 text-xs font-semibold text-rose-600")}>{pick(LEARNER_UI.photoFailed, lang)}</p> : null}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            void choose(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        {done ? (
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className={cn(face, "mt-5 h-12 w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 font-extrabold text-white")}
          >
            {pick(LEARNER_UI.close, lang)}
          </button>
        ) : (
          <div className="mt-5 space-y-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className={cn(face, "flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-orange-600 bg-orange-500 font-extrabold text-white disabled:opacity-60")}
            >
              <Camera className="size-5" aria-hidden />
              {pick(busy ? LEARNER_UI.uploading : LEARNER_UI.choosePhoto, lang)}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onLater}
              className={cn(face, "h-11 w-full rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50")}
            >
              {pick(LEARNER_UI.later, lang)}
            </button>
          </div>
        )}
      </motion.section>
    </div>
  );
}
