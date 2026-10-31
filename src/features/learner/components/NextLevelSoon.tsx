"use client";

import { Hammer } from "lucide-react";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import { NEXT_LEVEL_UI } from "@/src/features/learner/lib/copy";
import { personalizeText, type Learner } from "@/src/features/learner/lib/personalize";
import { cn } from "@/lib/utils";

/** Shown once Level 1 is finished: nothing beyond it is open until Level 2 is released. */
export function NextLevelSoon({ learner, lang, className }: { learner: Learner | null; lang: LessonLanguage; className?: string }) {
  const face = LANG_FACE[lang];
  const title = learner ? personalizeText(NEXT_LEVEL_UI.title, learner) : NEXT_LEVEL_UI.titleNoName;
  return (
    <section className={cn("rounded-3xl border-b-4 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-5 ring-1 ring-amber-200", className)}>
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-amber-400 text-white">
          <Hammer className="size-5" aria-hidden />
        </span>
        <span className={cn(face, "rounded-full bg-white px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-amber-700 ring-1 ring-amber-200")}>
          {pick(NEXT_LEVEL_UI.tag, lang)}
        </span>
      </div>
      <h2 className={cn(face, "mt-3 text-lg font-black leading-snug text-slate-900")}>
        {pick(title, lang)}
      </h2>
      <p className={cn(face, "mt-1.5 text-sm font-semibold leading-relaxed text-slate-600")}>{pick(NEXT_LEVEL_UI.body, lang)}</p>
    </section>
  );
}
