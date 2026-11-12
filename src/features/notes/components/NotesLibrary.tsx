"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Lock } from "lucide-react";
import { BN_FACE, EN_FACE } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LanguageSwitch } from "@/src/features/chat-lesson/components/LessonChrome";
import { setLessonLanguage, useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { LANG_FACE, pick } from "@/src/features/chat-lesson/lib/uiCopy";
import NotesSheet from "@/src/features/notes/components/NotesSheet";
import { NOTES_UI } from "@/src/features/notes/copy";
import { NOTE_TOPICS } from "@/src/features/notes/lib/notes";
import { cn } from "@/lib/utils";

/** Every topic's notes in map order. Paid topics stay locked until the learner has access. */
export function NotesLibrary({
  backHref,
  isLocked,
  unlockHref,
}: {
  backHref: string;
  isLocked: (stepId: string) => boolean;
  unlockHref: string | null;
}) {
  const lang = useLessonLanguage();
  const face = LANG_FACE[lang];
  const [openId, setOpenId] = useState<string | null>(null);
  const close = useCallback(() => setOpenId(null), []);

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-md px-4 pb-16 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={backHref}
            className={cn(face, "rounded-full px-2.5 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50")}
          >
            ← {pick(NOTES_UI.backToMap, lang)}
          </Link>
          <LanguageSwitch lang={lang} onChange={setLessonLanguage} />
        </div>

        <header className="rounded-2xl border-b-4 border-primary bg-accent px-4 py-4 text-white shadow-lg shadow-primary/10">
          <h1 className={cn(face, "flex items-center gap-2 text-xl font-black")}>
            <BookOpen className="size-5" aria-hidden />
            {pick(NOTES_UI.libraryTitle, lang)}
          </h1>
          <p className={cn(face, "mt-1 text-sm font-semibold text-accent-foreground/90")}>{pick(NOTES_UI.librarySub, lang)}</p>
        </header>

        <ol className="mt-5 space-y-3">
          {NOTE_TOPICS.map((topic, i) => {
            const locked = isLocked(topic.stepId);
            const helper = lang === "bn" && topic.title.bn !== topic.title.en ? topic.title.bn : null;
            const body = (
              <>
                <span
                  className={cn(
                    EN_FACE,
                    "flex size-10 shrink-0 items-center justify-center rounded-xl text-base font-black text-white",
                    locked ? "bg-slate-300" : "bg-accent",
                  )}
                >
                  {locked ? <Lock className="size-4" aria-hidden /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn(EN_FACE, "block text-base font-black text-slate-900")}>
                    {topic.title.en}
                    {helper ? <span className={cn(BN_FACE, "ml-1.5 text-sm font-semibold text-slate-500")}>{helper}</span> : null}
                  </span>
                  <span className={cn(face, "mt-0.5 line-clamp-2 block text-xs font-semibold text-slate-500")}>
                    {topic.chunkTitles.map((title) => pick(title, lang)).join(" · ")}
                  </span>
                </span>
                <span
                  className={cn(
                    face,
                    "flex shrink-0 items-center gap-0.5 text-xs font-extrabold",
                    locked ? "text-slate-400" : "text-accent",
                  )}
                >
                  {pick(locked ? NOTES_UI.locked : NOTES_UI.read, lang)}
                  {locked ? null : <ChevronRight className="size-4" aria-hidden />}
                </span>
              </>
            );
            const cardClass =
              "flex w-full items-center gap-3 rounded-2xl border-2 border-b-4 bg-white p-3 text-left transition-transform active:translate-y-0.5";
            return (
              <li key={topic.stepId}>
                {locked ? (
                  unlockHref ? (
                    <Link href={unlockHref} className={cn(cardClass, "border-slate-200")}>
                      {body}
                    </Link>
                  ) : (
                    <div className={cn(cardClass, "border-slate-200 opacity-70")}>{body}</div>
                  )
                ) : (
                  <button type="button" onClick={() => setOpenId(topic.stepId)} className={cn(cardClass, "border-accent/20 hover:border-accent/40")}>
                    {body}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {openId ? <NotesSheet stepId={openId} onClose={close} /> : null}
    </div>
  );
}
