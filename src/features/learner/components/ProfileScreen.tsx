"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, ChevronRight, CreditCard, LogOut, MapPin, MessageCircle, Pencil, ShieldCheck, Trophy, X } from "lucide-react";
import { LegacyLearnerBadge } from "@/src/components/profile/LegacyLearnerBadge";
import { ProfileChangePassword } from "@/src/components/profile/ProfileChangePassword";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";
import { LanguageSwitch } from "@/src/features/chat-lesson/components/LessonChrome";
import { setLessonLanguage, useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import { PRIMARY_BUTTON } from "@/src/features/guest/components/GuestScreens";
import { LearnerAvatarImage } from "@/src/features/learner/components/LearnerAvatar";
import { LearnerEditForm } from "@/src/features/learner/components/LearnerProfileCard";
import type { MissionShellContext } from "@/src/features/learner/components/MissionShell";
import { OfferBox } from "@/src/features/learner/components/OfferCards";
import { PhoneVerifyForm } from "@/src/features/learner/components/PhoneVerifyForm";
import { useLearnerContext } from "@/src/features/learner/LearnerContext";
import { LEARNER_UI, LEGACY_BADGE, OFFER_UI, PAY_UI, PROFILE_UI } from "@/src/features/learner/lib/copy";
import { districtLabel } from "@/src/features/learner/lib/districts";
import { isDoubleDuration } from "@/src/features/learner/lib/offer";
import { callName, type Learner } from "@/src/features/learner/lib/personalize";
import { MISSION_BASE, UNLOCK_HREF } from "@/src/features/learner/lib/routes";
import { logout } from "@/src/lib/auth";
import { supportWhatsAppHrefWithText } from "@/src/lib/contact";
import { cn } from "@/lib/utils";

type Sheet = "edit" | "plan" | "login" | null;

const DAY_MS = 24 * 60 * 60 * 1000;
const HELP_HREF = supportWhatsAppHrefWithText("Hi Gamlish, I need help with my account.");

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function placeOf(learner: Learner, lang: LessonLanguage): string | null {
  if (learner.district) return districtLabel(learner.district, lang);
  return learner.country;
}

/** A bottom sheet on phones, a centred card on computers. */
function ProfileSheet({ title, lang, onClose, children }: { title: Bilingual; lang: LessonLanguage; onClose: () => void; children: ReactNode }) {
  const face = LANG_FACE[lang];
  return (
    <motion.div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={pick(title, lang)}>
      <motion.button
        type="button"
        aria-label={pick(PROFILE_UI.close, lang)}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-950/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.section
        className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-4 shadow-2xl sm:rounded-3xl"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
      >
        <div className="mb-2 flex items-center justify-between">
          <h2 className={cn(face, "text-lg font-black text-slate-900")}>{pick(title, lang)}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={pick(PROFILE_UI.close, lang)}
            className="flex size-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        {children}
      </motion.section>
    </motion.div>
  );
}

function Row({
  icon,
  label,
  sub,
  tone = "default",
  lang,
  onClick,
  href,
}: {
  icon: ReactNode;
  label: Bilingual;
  sub?: string;
  tone?: "default" | "danger";
  lang: LessonLanguage;
  onClick?: () => void;
  href?: string;
}) {
  const face = LANG_FACE[lang];
  const body = (
    <>
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          tone === "danger" ? "bg-rose-50 text-rose-600" : "bg-accent/10 text-accent",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className={cn(face, "block text-[15px] font-black", tone === "danger" ? "text-rose-600" : "text-slate-900")}>
          {pick(label, lang)}
        </span>
        {sub ? <span className={cn(face, "block truncate text-xs font-semibold text-slate-500")}>{sub}</span> : null}
      </span>
      {tone === "danger" ? null : <ChevronRight className="size-5 shrink-0 text-slate-400" aria-hidden />}
    </>
  );
  const className =
    "flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 active:bg-slate-100";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {body}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {body}
    </button>
  );
}

function StatusChip({ on, lang }: { on: boolean; lang: LessonLanguage }) {
  return (
    <span
      className={cn(
        LANG_FACE[lang],
        "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-black",
        on ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500",
      )}
    >
      {pick(on ? PROFILE_UI.connected : PROFILE_UI.notConnected, lang)}
    </span>
  );
}

/**
 * The learner's profile: one card (photo, name, place, badge, level) with edit, then plan, login,
 * help and log out. Same look as the game.
 */
export function ProfileScreen({ ctx }: { ctx: MissionShellContext }) {
  const lang = useLessonLanguage();
  const face = LANG_FACE[lang];
  const { learner, actions, progress } = useLearnerContext();
  const { profile, subscription, refresh } = useStudentSession({ profile: true, subscription: true });
  const [sheet, setSheet] = useState<Sheet>(null);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [now] = useState(() => Date.now());
  const fileRef = useRef<HTMLInputElement>(null);
  const name = callName(learner);
  const place = placeOf(learner, lang);
  const { state } = ctx;

  const accessUntil =
    subscription?.status === "ACTIVE" && subscription.endDate
      ? Date.parse(subscription.endDate)
      : state.payment.freeAccessUntil;
  const daysLeft = accessUntil ? Math.max(0, Math.ceil((accessUntil - now) / DAY_MS)) : null;
  const pending = state.payment.latest?.status === "PENDING";
  const planSub = state.hasPaidAccess
    ? daysLeft !== null
      ? pick(PROFILE_UI.daysLeft(daysLeft), lang)
      : pick(PROFILE_UI.planPaid, lang)
    : pending
      ? pick(PAY_UI.pendingChip, lang)
      : pick(PROFILE_UI.planFree, lang);
  const hasGoogle = Boolean(profile?.hasGoogle || profile?.authProviders?.includes("google"));

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

  const stop = progress?.level.stop ?? null;

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-accent/[0.07] via-background to-background">
      <div className="mx-auto w-full max-w-md px-4 pb-16 pt-5">
        <header className="mb-4 flex items-center justify-between">
          <h1 className={cn(face, "text-xl font-black text-slate-900")}>{pick(PROFILE_UI.title, lang)}</h1>
          <LanguageSwitch lang={lang} onChange={setLessonLanguage} />
        </header>

        <section className="rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="relative shrink-0">
              <LearnerAvatarImage learner={learner} size="lg" />
              {actions ? (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  aria-label={pick(learner.photoSrc ? LEARNER_UI.changePhoto : LEARNER_UI.choosePhoto, lang)}
                  className="absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full bg-accent text-white ring-4 ring-white transition-transform hover:scale-105"
                >
                  <Camera className="size-4" aria-hidden />
                </button>
              ) : null}
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
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-2xl font-black tracking-tight text-slate-900">{name.en}</p>
              {name.bn !== name.en ? <p className="truncate font-bengali text-base font-semibold text-slate-500">{name.bn}</p> : null}
              {place ? (
                <p className={cn(face, "mt-1 inline-flex items-center gap-1 text-xs font-bold text-slate-500")}>
                  <MapPin className="size-3.5" aria-hidden />
                  {place}
                </p>
              ) : null}
            </div>
          </div>

          {progress ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <LegacyLearnerBadge
                view={{ viewer: "self", state: progress.legacy.state, deadline: progress.legacy.deadline }}
                locked={progress.legacy.state === "none"}
              />
              {progress.legacy.state !== "none" ? (
                <span className={cn(face, "text-[11px] font-semibold text-slate-500")}>{pick(LEGACY_BADGE.caption, lang)}</span>
              ) : null}
            </div>
          ) : null}
          {uploading ? <p className={cn(face, "mt-2 text-xs font-semibold text-slate-500")}>{pick(LEARNER_UI.uploading, lang)}</p> : null}
          {photoError ? <p className={cn(face, "mt-2 text-xs font-semibold text-rose-600")}>{pick(LEARNER_UI.photoFailed, lang)}</p> : null}

          {progress ? (
            <div className="mt-4 rounded-2xl bg-accent/5 p-3 ring-1 ring-accent/15">
              {stop ? (
                <>
                  <p className={cn(face, "text-sm font-black text-accent")}>
                    {pick(PROFILE_UI.levelLine(progress.level.number, stop.index, stop.total), lang)}
                  </p>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-accent/15">
                    <motion.div
                      className="h-full rounded-full bg-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(((stop.index - 1) / stop.total) * 100)}%` }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <p className="mt-1.5 truncate font-sans text-xs font-bold text-slate-600">
                    {pick(LEARNER_UI.nowLearning, lang)}: {pick(stop.title, lang)}
                  </p>
                </>
              ) : (
                <p className={cn(face, "flex items-center gap-1.5 text-sm font-black text-accent")}>
                  <Trophy className="size-4" aria-hidden />
                  {pick(LEARNER_UI.levelComplete, lang)}
                </p>
              )}
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href={MISSION_BASE} className={cn(face, PRIMARY_BUTTON, "h-12 text-[15px]", lang === "en" && "uppercase tracking-wide")}>
              {pick(PROFILE_UI.keepLearning, lang)}
            </Link>
            {actions ? (
              <button
                type="button"
                onClick={() => setSheet("edit")}
                className={cn(
                  face,
                  "flex h-12 items-center justify-center gap-1.5 rounded-2xl border-2 border-b-4 border-slate-200 bg-white text-[15px] font-bold text-slate-700 transition-all hover:bg-slate-50 active:translate-y-0.5 active:border-b-2",
                )}
              >
                <Pencil className="size-4" aria-hidden />
                {pick(LEARNER_UI.editDetails, lang)}
              </button>
            ) : null}
          </div>
        </section>

        <nav className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white shadow-sm">
          <Row icon={<CreditCard className="size-5" aria-hidden />} label={PROFILE_UI.plan} sub={planSub} lang={lang} onClick={() => setSheet("plan")} />
          <Row
            icon={<ShieldCheck className="size-5" aria-hidden />}
            label={PROFILE_UI.login}
            sub={profile?.email ?? profile?.phoneMasked ?? undefined}
            lang={lang}
            onClick={() => setSheet("login")}
          />
          <Row icon={<MessageCircle className="size-5" aria-hidden />} label={PROFILE_UI.help} sub={pick(PROFILE_UI.helpSub, lang)} lang={lang} href={HELP_HREF} />
          <Row icon={<LogOut className="size-5" aria-hidden />} label={PROFILE_UI.logout} tone="danger" lang={lang} onClick={logout} />
        </nav>
      </div>

      <AnimatePresence>
        {sheet === "edit" && actions ? (
          <ProfileSheet key="edit" title={LEARNER_UI.editDetails} lang={lang} onClose={() => setSheet(null)}>
            <LearnerEditForm learner={learner} actions={actions} lang={lang} onDone={() => setSheet(null)} />
          </ProfileSheet>
        ) : null}

        {sheet === "plan" ? (
          <ProfileSheet key="plan" title={PROFILE_UI.plan} lang={lang} onClose={() => setSheet(null)}>
            {state.hasPaidAccess ? (
              <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
                <p className={cn(face, "text-lg font-black text-emerald-800")}>{pick(PROFILE_UI.planPaid, lang)}</p>
                {accessUntil ? (
                  <p className={cn(face, "mt-0.5 text-sm font-bold text-emerald-700")}>
                    {pick(PROFILE_UI.planUntil(formatDate(accessUntil)), lang)}
                    {daysLeft !== null ? ` · ${pick(PROFILE_UI.daysLeft(daysLeft), lang)}` : ""}
                  </p>
                ) : null}
              </div>
            ) : pending ? (
              <p className={cn(face, "rounded-2xl bg-accent/5 p-4 text-sm font-bold text-accent ring-1 ring-accent/20")}>
                {pick(PAY_UI.pendingChip, lang)}
              </p>
            ) : (
              <div className="space-y-3">
                <p className={cn(face, "text-sm font-semibold text-slate-600")}>
                  {pick(PROFILE_UI.planFree, lang)} · {pick(PROFILE_UI.freePart, lang)}
                </p>
                <OfferBox payment={state.payment} lang={lang} />
                <Link href={UNLOCK_HREF} className={cn(face, PRIMARY_BUTTON, lang === "en" && "uppercase tracking-wide")}>
                  {pick(isDoubleDuration(state.payment.offer) ? OFFER_UI.cta : OFFER_UI.standardCta, lang)}
                </Link>
              </div>
            )}
          </ProfileSheet>
        ) : null}

        {sheet === "login" ? (
          <ProfileSheet key="login" title={PROFILE_UI.login} lang={lang} onClose={() => setSheet(null)}>
            <ul className="space-y-2">
              <li className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3.5 py-3 ring-1 ring-slate-100">
                <span className="min-w-0">
                  <span className={cn(face, "block text-xs font-bold text-slate-500")}>{pick(PROFILE_UI.accountName, lang)}</span>
                  <span className="block truncate font-sans text-sm font-black text-slate-900">{profile?.displayName ?? "-"}</span>
                </span>
              </li>
              <li className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3.5 py-3 ring-1 ring-slate-100">
                <span className="min-w-0">
                  <span className="block font-sans text-sm font-black text-slate-900">Google</span>
                  {profile?.email ? <span className="block truncate font-sans text-xs text-slate-500">{profile.email}</span> : null}
                </span>
                <StatusChip on={hasGoogle} lang={lang} />
              </li>
              <li className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3.5 py-3 ring-1 ring-slate-100">
                <span className="min-w-0">
                  <span className={cn(face, "block text-sm font-black text-slate-900")}>{pick(PROFILE_UI.mobile, lang)}</span>
                  {profile?.phoneMasked ? <span className="block font-sans text-xs tabular-nums text-slate-500">{profile.phoneMasked}</span> : null}
                </span>
                <StatusChip on={Boolean(profile?.phoneVerified)} lang={lang} />
              </li>
              <li>
                <PhoneVerifyForm lang={lang} hasPhone={Boolean(profile?.phoneVerified)} onVerified={() => void refresh()} />
              </li>
            </ul>
            <div className="mt-4">
              <p className={cn(face, "mb-2 text-sm font-black text-slate-900")}>{pick(PROFILE_UI.password, lang)}</p>
              <ProfileChangePassword hasPassword={profile?.hasPassword !== false} onPasswordSet={() => void refresh()} />
            </div>
          </ProfileSheet>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
