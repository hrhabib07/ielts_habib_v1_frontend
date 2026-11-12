"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Crown, Lock, X } from "lucide-react";
import { useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { LANG_FACE, pick } from "@/src/features/chat-lesson/lib/uiCopy";
import { LEGACY_BADGE, LEGACY_UI } from "@/src/features/learner/lib/copy";
import { MISSION_BASE, UNLOCK_HREF } from "@/src/features/learner/lib/routes";
import { cn } from "@/lib/utils";

/** First moment of 1 January 2027 in Dhaka: the badge can no longer be bought after this. */
const LEGACY_OFFER_ENDS_AT = Date.parse("2026-12-31T18:00:00.000Z");

/** Whose badge this is, seen by whom. */
export type LegacyBadgeView =
  | { viewer: "self"; state: "permanent" | "pending" | "none"; deadline?: number | string | null }
  | { viewer: "member" | "visitor" | "info" };

function formatDeadline(deadline: number | string | null | undefined, lang: "en" | "bn"): string {
  if (deadline == null) return lang === "bn" ? "সময়সীমা" : "the deadline";
  return new Date(deadline).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    numberingSystem: "latn",
  });
}

function LegacySheet({ view, onClose }: { view: LegacyBadgeView; onClose: () => void }) {
  const lang = useLessonLanguage();
  const face = LANG_FACE[lang];
  const offerOpen = Date.now() < LEGACY_OFFER_ENDS_AT;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const self = view.viewer === "self" ? view : null;
  const title = self
    ? self.state === "permanent"
      ? LEGACY_UI.holderTitle
      : self.state === "pending"
        ? LEGACY_UI.pendingTitle
        : LEGACY_UI.offerTitle
    : LEGACY_UI.infoTitle;
  const line = self
    ? self.state === "pending"
      ? LEGACY_UI.pendingLine(formatDeadline(self.deadline, lang))
      : self.state === "none"
        ? offerOpen
          ? LEGACY_UI.offerLine
          : LEGACY_UI.closedLine
        : null
    : LEGACY_UI.infoLine;
  const cta =
    self?.state === "pending"
      ? { label: LEGACY_UI.keepPlaying, href: MISSION_BASE }
      : self?.state === "none" && offerOpen
        ? { label: LEGACY_UI.pay, href: UNLOCK_HREF }
        : view.viewer === "member" && offerOpen
          ? { label: LEGACY_UI.getToo, href: UNLOCK_HREF }
          : view.viewer === "visitor"
            ? { label: LEGACY_UI.startFree, href: "/play" }
            : null;

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/45 p-0 sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={pick(title, lang)}
        className={cn(face, "relative w-full max-w-md rounded-t-3xl bg-white p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] text-left shadow-2xl sm:rounded-3xl")}
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        exit={{ y: 40 }}
        transition={{ type: "spring", stiffness: 380, damping: 34 }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label={pick(LEGACY_UI.close, lang)}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
        >
          <X className="size-5" aria-hidden />
        </button>
        <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-500 text-amber-950 shadow-[0_0_24px_-6px_rgba(251,191,36,0.8)]">
          <Crown className="size-6" aria-hidden />
        </span>
        <p className="mt-3 pr-8 text-xl font-black text-slate-900">{pick(title, lang)}</p>
        {line ? <p className="mt-1.5 text-sm font-semibold leading-relaxed text-slate-600">{pick(line, lang)}</p> : null}
        <ul className="mt-4 space-y-2.5">
          {LEGACY_UI.benefits.map((benefit) => (
            <li key={benefit.en} className="flex items-start gap-2 text-[15px] font-semibold leading-snug text-slate-800">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Check className="size-3.5" strokeWidth={3} aria-hidden />
              </span>
              {pick(benefit, lang)}
            </li>
          ))}
        </ul>
        {cta ? (
          <Link
            href={cta.href}
            onClick={onClose}
            className={cn(
              "mt-5 flex h-12 w-full items-center justify-center rounded-2xl border-b-4 border-amber-600 bg-amber-400 text-base font-extrabold text-amber-950 transition-all hover:bg-amber-300 active:translate-y-0.5 active:border-b-2",
              lang === "bn" && "text-[17px]",
            )}
          >
            {pick(cta.label, lang)}
          </Link>
        ) : null}
      </motion.div>
    </motion.div>
  );
}

/**
 * The Legacy Learner badge. It always shines and opens the same explanation when tapped; `view`
 * decides the sheet's title and button. `locked` shows the "get it" chip for learners without it.
 */
export function LegacyLearnerBadge({
  className,
  view = { viewer: "info" },
  locked = false,
}: {
  className?: string;
  view?: LegacyBadgeView;
  locked?: boolean;
}) {
  const lang = useLessonLanguage();
  const [open, setOpen] = useState(false);
  const pending = view.viewer === "self" && view.state === "pending";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        title={LEGACY_BADGE.caption.en}
        className={cn(
          "legacy-badge-shine relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-3 py-1 font-sans text-xs font-black transition-transform hover:scale-105 active:scale-95",
          locked
            ? "border border-dashed border-amber-400 bg-amber-50 text-amber-800"
            : "bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 text-amber-950 shadow-[0_0_18px_-6px_rgba(251,191,36,0.7)] ring-1 ring-inset ring-amber-300/80",
          className,
        )}
      >
        {locked ? <Lock className="relative size-3.5 shrink-0" aria-hidden /> : <Crown className="relative size-3.5 shrink-0" aria-hidden />}
        <span className={cn("relative", locked && LANG_FACE[lang])}>
          {locked ? pick(LEGACY_UI.getBadge, lang) : LEGACY_BADGE.name}
        </span>
        {pending ? <span className="relative size-1.5 rounded-full bg-amber-700/70" aria-hidden /> : null}
      </button>
      <AnimatePresence>{open ? <LegacySheet key="legacy" view={view} onClose={() => setOpen(false)} /> : null}</AnimatePresence>
    </>
  );
}
