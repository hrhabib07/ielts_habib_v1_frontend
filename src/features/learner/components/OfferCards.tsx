"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Check, PartyPopper, Trophy } from "lucide-react";
import { LegacyLearnerBadge } from "@/src/components/profile/LegacyLearnerBadge";
import { RichText } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import { GuestScreen, PRIMARY_BUTTON, SECONDARY_BUTTON } from "@/src/features/guest/components/GuestScreens";
import { GamlishMascot } from "@/src/features/playground/components/GamlishMascot";
import { OFFER_UI } from "@/src/features/learner/lib/copy";
import { earnsLegacyBadge, isDoubleDuration, offerDaysLeft } from "@/src/features/learner/lib/offer";
import type { ChatMissionPayment } from "@/src/lib/api/chatMission";
import { cn } from "@/lib/utils";

/** Bold words on the navy offer card ("Legacy Learner"): bright enough to read. */
const LEGACY_TEXT = "font-black text-amber-200";

/** What the learner gets for ৳1590 right now: Double Duration until 20 November, then 45 days. */
export function OfferBox({ payment, lang }: { payment: ChatMissionPayment; lang: LessonLanguage }) {
  const face = LANG_FACE[lang];
  const [now] = useState(() => Date.now());
  const double = isDoubleDuration(payment.offer, now);

  if (!double) {
    const legacy = earnsLegacyBadge(payment.offer, now);
    return (
      <div className="rounded-3xl bg-gradient-to-br from-accent to-indigo-700 p-5 text-left text-white shadow-lg">
        <p className={cn(face, "text-2xl font-black")}>{pick(OFFER_UI.standardHeadline(payment.priceBdt, payment.accessDays), lang)}</p>
        <p className={cn(face, "mt-2 text-sm font-semibold leading-relaxed text-white/85")}>
          {pick(OFFER_UI.standardLine(payment.accessDays), lang)}
        </p>
        {legacy ? (
          <>
            <p className={cn(face, "mt-3 flex items-start gap-2 text-sm font-semibold leading-snug text-white/90")}>
              <Check className="mt-0.5 size-4 shrink-0 text-amber-300" strokeWidth={3} aria-hidden />
              <span>
                <RichText text={pick(OFFER_UI.badgeLine, lang)} strongClassName={LEGACY_TEXT} />
              </span>
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <LegacyLearnerBadge view={{ viewer: "self", state: "none" }} />
              <span className={cn(face, "inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold text-amber-100")}>
                <CalendarClock className="size-3.5" aria-hidden />
                {pick(OFFER_UI.legacyDeadline, lang)}
              </span>
            </div>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent via-indigo-700 to-indigo-900 p-5 text-left text-white shadow-lg">
      <span className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-amber-300/20 blur-2xl" aria-hidden />
      <div className="relative flex items-center gap-2">
        <span className="rounded-lg bg-amber-300 px-2 py-0.5 font-sans text-sm font-black text-amber-950">2×</span>
        <span className={cn(face, "text-xs font-black uppercase tracking-[0.16em] text-amber-200")}>{pick(OFFER_UI.name, lang)}</span>
      </div>
      <p className={cn(face, "relative mt-2 text-[1.65rem] font-black leading-tight")}>{pick(OFFER_UI.headline, lang)}</p>
      <p className={cn(face, "relative mt-1 text-[15px] font-semibold text-white/90")}>{pick(OFFER_UI.priceLine(payment.priceBdt), lang)}</p>
      <ul className="relative mt-3 space-y-2">
        {[OFFER_UI.startLine, OFFER_UI.badgeLine].map((line) => (
          <li key={line.en} className={cn(face, "flex items-start gap-2 text-sm font-semibold leading-snug text-white/90")}>
            <Check className="mt-0.5 size-4 shrink-0 text-amber-300" strokeWidth={3} aria-hidden />
            <span>
              <RichText text={pick(line, lang)} strongClassName={LEGACY_TEXT} />
            </span>
          </li>
        ))}
      </ul>
      <div className="relative mt-3 flex flex-wrap items-center justify-between gap-2">
        <LegacyLearnerBadge view={{ viewer: "self", state: "none" }} />
        <span className={cn(face, "inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold text-amber-100")}>
          <CalendarClock className="size-3.5" aria-hidden />
          {pick(OFFER_UI.deadline(offerDaysLeft(payment.offer, now)), lang)}
        </span>
      </div>
    </div>
  );
}

function ctaLabel(payment: ChatMissionPayment): Bilingual {
  return isDoubleDuration(payment.offer) ? OFFER_UI.cta : OFFER_UI.standardCta;
}

/** A soft, dismissable offer: right after sign-in, and again after the Number game. */
export function OfferSheet({
  payment,
  lang,
  kicker,
  onGet,
  onClose,
}: {
  payment: ChatMissionPayment;
  lang: LessonLanguage;
  kicker: Bilingual;
  onGet: () => void;
  onClose: () => void;
}) {
  const face = LANG_FACE[lang];
  return (
    <SheetFrame onClose={onClose} label={pick(OFFER_UI.notNow, lang)}>
      <p className={cn(face, "mb-3 flex items-center gap-1.5 self-start text-sm font-black text-accent")}>
        <PartyPopper className="size-4" aria-hidden />
        {pick(kicker, lang)}
      </p>
      <div className="w-full">
        <OfferBox payment={payment} lang={lang} />
      </div>
      <div className="mt-4 flex w-full flex-col gap-2">
        <button type="button" onClick={onGet} className={cn(face, PRIMARY_BUTTON, lang === "en" && "uppercase tracking-wide")}>
          {pick(ctaLabel(payment), lang)}
        </button>
        <button type="button" onClick={onClose} className={cn(face, "py-2 text-sm font-bold text-slate-500")}>
          {pick(OFFER_UI.notNow, lang)}
        </button>
      </div>
    </SheetFrame>
  );
}

/** The paywall: after winning Person Game 1, or when opening any paid step. */
export function LockScreen({
  payment,
  lang,
  won,
  onPay,
  onReplay,
}: {
  payment: ChatMissionPayment;
  lang: LessonLanguage;
  won: boolean;
  onPay: () => void;
  onReplay: () => void;
}) {
  const face = LANG_FACE[lang];
  return (
    <GuestScreen
      actions={
        <>
          <button type="button" onClick={onPay} className={cn(face, PRIMARY_BUTTON, lang === "en" && "uppercase tracking-wide")}>
            {pick(OFFER_UI.payAndContinue, lang)}
          </button>
          <button type="button" onClick={onReplay} className={cn(face, SECONDARY_BUTTON)}>
            {pick(OFFER_UI.replayFree, lang)}
          </button>
        </>
      }
    >
      {won ? (
        <GamlishMascot mood="happy" size="lg" className="mx-auto" />
      ) : (
        <span className="mx-auto flex size-16 items-center justify-center rounded-3xl border-b-[5px] border-amber-500 bg-amber-300 text-amber-950">
          <Trophy className="size-8" aria-hidden />
        </span>
      )}
      <h1 className={cn(face, "mt-4 text-2xl font-black text-slate-900")}>
        {pick(won ? OFFER_UI.lockWonTitle : OFFER_UI.lockTitle, lang)}
      </h1>
      <p className={cn(face, "mt-1.5 text-[15px] font-semibold leading-relaxed text-slate-600")}>{pick(OFFER_UI.lockLine, lang)}</p>
      <div className="mt-5">
        <OfferBox payment={payment} lang={lang} />
      </div>
    </GuestScreen>
  );
}

/** Once, the first time the map opens after the admin approves the payment. */
export function ApprovedSheet({ lang, legacy, onClose }: { lang: LessonLanguage; legacy: boolean; onClose: () => void }) {
  const face = LANG_FACE[lang];
  return (
    <SheetFrame onClose={onClose} label={pick(OFFER_UI.letsGo, lang)} centered>
      <span className="mx-auto flex size-16 items-center justify-center rounded-3xl border-b-[5px] border-emerald-600 bg-emerald-500 text-white">
        <Check className="size-9" strokeWidth={3} aria-hidden />
      </span>
      <h2 className={cn(face, "mt-4 text-2xl font-black text-slate-900")}>{pick(OFFER_UI.approvedTitle, lang)}</h2>
      <p className={cn(face, "mt-1.5 text-[15px] font-semibold leading-relaxed text-slate-600")}>
        {pick(legacy ? OFFER_UI.approvedLegacy : OFFER_UI.approvedPlain, lang)}
      </p>
      {legacy ? <LegacyLearnerBadge className="mt-3" /> : null}
      <button type="button" onClick={onClose} className={cn(face, PRIMARY_BUTTON, "mt-5", lang === "en" && "uppercase tracking-wide")}>
        {pick(OFFER_UI.letsGo, lang)}
      </button>
    </SheetFrame>
  );
}

function SheetFrame({
  children,
  onClose,
  label,
  centered = false,
}: {
  children: ReactNode;
  onClose: () => void;
  label: string;
  centered?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <motion.button
        type="button"
        aria-label={label}
        className="absolute inset-0 bg-slate-950/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div
        className={cn(
          "relative flex w-full max-w-md flex-col items-center rounded-t-3xl bg-white px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-5 shadow-2xl sm:rounded-3xl",
          centered && "pt-6 text-center",
        )}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
