"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Languages, RotateCcw, Star, X } from "lucide-react";
import { EN_FACE } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { formatPoints } from "@/src/features/chat-lesson/lib/format";
import {
  LANG_FACE,
  localizeLabel,
  type LessonLanguage,
} from "@/src/features/chat-lesson/lib/uiCopy";
import { cn } from "@/lib/utils";

export function LessonHeader({
  title,
  missionLabel,
  stepLabel,
  answered,
  total,
  score,
  lang,
  onLanguageChange,
  onRestart,
  backHref,
  demo = false,
}: {
  backHref?: string;
  demo?: boolean;
  title: string;
  missionLabel: string;
  stepLabel: string;
  answered: number;
  total: number;
  score: number;
  lang: LessonLanguage;
  onLanguageChange: (lang: LessonLanguage) => void;
  onRestart: () => void;
}) {
  const pct = total === 0 ? 0 : Math.round((answered / total) * 100);

  return (
    <header className="shrink-0 border-b border-slate-200/80 bg-white">
      <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 pt-3">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Back to level map"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="size-5" aria-hidden />
          </Link>
        ) : null}
        <div
          className="h-3.5 flex-1 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/70"
          role="progressbar"
          aria-valuenow={answered}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label="Questions answered"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-500"
            initial={false}
            animate={{ width: `${Math.max(pct, 4)}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <motion.div
          key={score}
          initial={{ scale: 1.25 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={cn(
            EN_FACE,
            "flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-black text-amber-700 ring-1 ring-amber-200",
          )}
          aria-label={`${formatPoints(score)} points`}
        >
          <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
          {formatPoints(score)}
        </motion.div>
        <button
          type="button"
          onClick={onRestart}
          aria-label="Restart step"
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        >
          <RotateCcw className="size-4.5" aria-hidden />
        </button>
      </div>
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 pb-2.5 pt-2">
        <p className={cn(LANG_FACE[lang], "flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-500")}>
          {demo ? (
            <span
              className={cn(
                EN_FACE,
                "shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-800",
              )}
            >
              Demo
            </span>
          ) : null}
          <span className="truncate">
            {localizeLabel(missionLabel, lang)} · {localizeLabel(stepLabel, lang)} · {title}
          </span>
        </p>
        <LanguageSwitch lang={lang} onChange={onLanguageChange} />
      </div>
    </header>
  );
}

const OTHER_LANGUAGE: Record<LessonLanguage, { id: LessonLanguage; label: string; aria: string }> = {
  en: { id: "bn", label: "বাংলা", aria: "Switch to Bangla" },
  bn: { id: "en", label: "English", aria: "Switch to English" },
};

/** One compact button that names the language you will switch to. */
export function LanguageSwitch({
  lang,
  onChange,
  className,
}: {
  lang: LessonLanguage;
  onChange: (lang: LessonLanguage) => void;
  className?: string;
}) {
  const target = OTHER_LANGUAGE[lang];
  return (
    <button
      type="button"
      onClick={() => onChange(target.id)}
      aria-label={target.aria}
      title={target.aria}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-accent shadow-sm ring-1 ring-accent/20 transition-colors hover:bg-accent/5 active:scale-95",
        className,
      )}
    >
      <Languages className="size-3.5" aria-hidden />
      <span className={LANG_FACE[target.id]}>{target.label}</span>
    </button>
  );
}

export type TrayTone = "brand" | "success" | "muted";

export type TrayAction = {
  label: string;
  tone: TrayTone;
  disabled?: boolean;
  onClick?: () => void;
};

const TRAY_TONES: Record<TrayTone, string> = {
  brand: "bg-accent text-white border-primary hover:bg-accent/90",
  success: "bg-emerald-500 text-white border-emerald-700 hover:bg-emerald-500/90",
  muted: "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200/70 hover:text-slate-700",
};

export function ActionTray({
  action,
  note,
  lang,
}: {
  action: TrayAction;
  note?: string | null;
  lang: LessonLanguage;
}) {
  return (
    <div className="shrink-0 border-t border-slate-200/80 bg-white pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3">
      <div className="mx-auto w-full max-w-2xl px-4">
        {note ? (
          <p className={cn(LANG_FACE[lang], "mb-2.5 text-center text-xs font-medium text-slate-500")}>
            {note}
          </p>
        ) : null}
        <button
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
          className={cn(
            LANG_FACE[lang],
            "flex h-13 w-full items-center justify-center rounded-2xl border-b-4 text-base font-extrabold transition-all active:translate-y-0.5 active:border-b-2",
            lang === "en" ? "uppercase tracking-wide" : "text-[17px]",
            action.disabled
              ? "cursor-not-allowed border-slate-300 bg-slate-200 text-slate-400"
              : TRAY_TONES[action.tone],
          )}
        >
          {action.label}
        </button>
      </div>
    </div>
  );
}
