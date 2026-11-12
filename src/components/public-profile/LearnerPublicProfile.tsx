"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Check, Flame, Gamepad2, Hand, Lock, MapPin, Pencil, Play, Share2, Trophy } from "lucide-react";
import { FoundingMemberBadge } from "@/src/components/founding-member/FoundingMemberBadge";
import { LegacyLearnerBadge, type LegacyBadgeView } from "@/src/components/profile/LegacyLearnerBadge";
import { useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { LANG_FACE, pick } from "@/src/features/chat-lesson/lib/uiCopy";
import { LearnerAvatarImage } from "@/src/features/learner/components/LearnerAvatar";
import { LEGACY_BADGE, PUBLIC_UI } from "@/src/features/learner/lib/copy";
import { districtLabel } from "@/src/features/learner/lib/districts";
import { FINAL_TEST_PASS_MARK, LEVEL_ONE_TOPICS } from "@/src/features/learner/lib/levels";
import type { Learner } from "@/src/features/learner/lib/personalize";
import { getDecodedTokenClient } from "@/src/lib/auth";
import { learnerPhotoSrc } from "@/src/lib/api/chatMission";
import { toggleProfileClap, type GamlishPublicProfile } from "@/src/lib/api/gamlish";
import { cn } from "@/lib/utils";

type PublicLearner = NonNullable<GamlishPublicProfile["learner"]>;

const POP = { type: "spring", stiffness: 420, damping: 18 } as const;

/** A topic counts as done when its lesson or its game is finished. */
function topicDone(stepId: string, done: ReadonlySet<string>): boolean {
  return done.has(stepId) || done.has(stepId.replace(/^level-1-step-\d+-/, "level-1-playground-"));
}

function joinedLabel(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** The public face of a Gamlish v2 learner: who they are, how far they got, and a way to cheer or share. */
export function LearnerPublicProfile({ initialProfile, handle }: { initialProfile: GamlishPublicProfile; handle: string }) {
  const lang = useLessonLanguage();
  const face = LANG_FACE[lang];
  const [social, setSocial] = useState(initialProfile.social);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const learnerData: PublicLearner | null = initialProfile.learner ?? null;
  const { identity, stats } = initialProfile;
  const nameEn = learnerData?.nicknameEn ?? identity.displayName;
  const nameBn = learnerData?.nicknameBn ?? nameEn;

  const learner: Learner = {
    nicknameEn: nameEn,
    nicknameBn: nameBn,
    addressAs: null,
    district: learnerData?.district ?? null,
    country: learnerData?.country ?? null,
    photoSrc: learnerPhotoSrc(learnerData?.photoUrl ?? null) ?? identity.avatarUrl,
  };
  const doneIds = learnerData?.doneStepIds ?? [];
  const done = new Set(doneIds);
  const finalTest = learnerData?.finalTest ?? null;
  const topics = LEVEL_ONE_TOPICS.map((topic) => ({
    ...topic,
    done: topic.stepId.endsWith("final-test") ? finalTest !== null : topicDone(topic.stepId, done),
  }));
  const topicsDone = topics.filter((t) => t.done).length;
  const gamesWon = doneIds.filter((id) => id.startsWith("level-1-playground-") && !id.endsWith("-taste")).length;
  const finalPassed = finalTest ? finalTest.score / Math.max(1, finalTest.max) >= FINAL_TEST_PASS_MARK : false;
  const place = learnerData?.district ? districtLabel(learnerData.district, lang) : (learnerData?.country ?? null);
  const joined = joinedLabel(identity.joinDate);
  const handleLabel = identity.username ?? initialProfile.canonicalHandle;
  const legacy = initialProfile.legacy ?? { state: learnerData?.legacyLearner ? "pending" : "none", deadline: null };
  const legacyView: LegacyBadgeView = social.isOwnProfile
    ? { viewer: "self", state: legacy.state, deadline: legacy.deadline }
    : { viewer: social.viewerLoggedIn ? "member" : "visitor" };
  const v1 = initialProfile.v1 ?? null;
  const hidden = identity.isPrivate && !social.isOwnProfile;

  const share = async () => {
    const url = window.location.href;
    const text = PUBLIC_UI.shareText(nameEn);
    try {
      if (navigator.share) {
        await navigator.share({ title: `${nameEn} · Gamlish`, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setNotice(pick(PUBLIC_UI.copied, lang));
    } catch {
      return;
    }
  };

  const clap = async () => {
    if (social.isOwnProfile || busy) return;
    if (!getDecodedTokenClient()) {
      setNotice(pick(PUBLIC_UI.loginToClap, lang));
      return;
    }
    setBusy(true);
    try {
      const res = await toggleProfileClap(handle);
      setSocial((s) => ({ ...s, totalClaps: res.totalClaps, hasClapped: res.hasClapped }));
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setNotice(message ?? null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative isolate min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-accent/[0.08] via-background to-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_1px_1px,rgba(30,58,138,0.09)_1px,transparent_0)] bg-[length:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      <main className="mx-auto w-full max-w-md px-4 pb-16 pt-5">

        <motion.section
          className="overflow-hidden rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white shadow-sm"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative h-24 bg-gradient-to-br from-accent via-indigo-700 to-indigo-900">
            <span className="absolute -right-8 -top-10 size-36 rounded-full bg-white/10" aria-hidden />
            <span className="absolute -left-6 bottom-[-40px] size-28 rounded-full bg-amber-300/15" aria-hidden />
          </div>
          <div className="px-5 pb-5 text-center">
            <motion.span className="-mt-12 inline-block rounded-full bg-white p-1 shadow-lg" initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={POP}>
              <LearnerAvatarImage learner={learner} size="lg" />
            </motion.span>
            <h1 className="mt-2 font-sans text-2xl font-black tracking-tight text-slate-900">{nameEn}</h1>
            {nameBn !== nameEn ? <p className="font-bengali text-base font-semibold text-slate-500">{nameBn}</p> : null}
            <p className="mt-0.5 font-sans text-xs font-bold text-slate-400">@{handleLabel}</p>

            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {place ? (
                <span className={cn(face, "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600")}>
                  <MapPin className="size-3.5" aria-hidden />
                  {place}
                </span>
              ) : null}
              {joined ? (
                <span className={cn(face, "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600")}>
                  <CalendarDays className="size-3.5" aria-hidden />
                  {pick(PUBLIC_UI.joined(joined), lang)}
                </span>
              ) : null}
            </div>

            {legacy.state !== "none" || social.isOwnProfile || identity.isFoundingMember ? (
              <div className="mt-3 flex flex-col items-center gap-1">
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {legacy.state !== "none" ? (
                    <LegacyLearnerBadge view={legacyView} />
                  ) : social.isOwnProfile ? (
                    <LegacyLearnerBadge view={legacyView} locked />
                  ) : null}
                  {identity.isFoundingMember ? <FoundingMemberBadge size="sm" /> : null}
                </div>
                {legacy.state !== "none" ? (
                  <span className={cn(face, "text-[11px] font-semibold text-slate-500")}>{pick(LEGACY_BADGE.caption, lang)}</span>
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void share()}
                className={cn(
                  face,
                  "flex h-11 items-center justify-center gap-1.5 rounded-2xl border-b-4 border-primary bg-accent text-sm font-extrabold text-white transition-all hover:bg-accent/90 active:translate-y-0.5 active:border-b-2",
                )}
              >
                <Share2 className="size-4" aria-hidden />
                {pick(PUBLIC_UI.share, lang)}
              </button>
              {social.isOwnProfile ? (
                <Link
                  href="/profile"
                  className={cn(face, "flex h-11 items-center justify-center gap-1.5 rounded-2xl border-2 border-b-4 border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50")}
                >
                  <Pencil className="size-4" aria-hidden />
                  {pick(PUBLIC_UI.editProfile, lang)}
                </Link>
              ) : !social.viewerLoggedIn ? (
                <Link
                  href={`/login?next=${encodeURIComponent(`/u/${handle}`)}`}
                  className={cn(
                    face,
                    "flex h-11 items-center justify-center gap-1.5 rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-2 text-center text-sm font-bold leading-tight text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <Hand className="size-4 shrink-0" aria-hidden />
                  {pick(PUBLIC_UI.loginToClap, lang)} · {social.totalClaps}
                </Link>
              ) : (
                <motion.button
                  type="button"
                  onClick={() => void clap()}
                  disabled={busy}
                  whileTap={{ scale: 0.92 }}
                  className={cn(
                    face,
                    "flex h-11 items-center justify-center gap-1.5 rounded-2xl border-2 border-b-4 text-sm font-bold transition-colors",
                    social.hasClapped ? "border-amber-400 bg-amber-50 text-amber-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <Hand className={cn("size-4", social.hasClapped && "fill-amber-300")} aria-hidden />
                  {pick(PUBLIC_UI.clap, lang)} · {social.totalClaps}
                </motion.button>
              )}
            </div>
            {social.isOwnProfile ? (
              <p className={cn(face, "mt-2 text-xs font-semibold text-slate-400")}>{pick(PUBLIC_UI.claps(social.totalClaps), lang)}</p>
            ) : null}
            {notice ? <p className={cn(face, "mt-2 text-xs font-semibold text-accent")}>{notice}</p> : null}
          </div>
        </motion.section>

        {hidden ? (
          <p className={cn(face, "mt-4 flex items-center justify-center gap-2 rounded-3xl border-2 border-slate-200 bg-white p-4 text-sm font-bold text-slate-500")}>
            <Lock className="size-4" aria-hidden />
            {pick(PUBLIC_UI.privateNote, lang)}
          </p>
        ) : null}

        {hidden ? null : (
        <motion.section
          className="mt-4 rounded-3xl border-b-[5px] border-primary bg-gradient-to-br from-accent to-indigo-800 p-5 text-white shadow-md"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <p className={cn(face, "text-xs font-black uppercase tracking-wider text-white/70")}>{pick(PUBLIC_UI.levelTitle, lang)}</p>
          <p className={cn(face, "mt-2 text-lg font-black")}>
            {pick(PUBLIC_UI.topicsLeft(topicsDone, topics.length - topicsDone), lang)}
          </p>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full rounded-full bg-amber-300"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((topicsDone / topics.length) * 100)}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <ul className="mt-4 grid grid-cols-4 gap-2">
            {topics.map((topic, i) => (
              <motion.li
                key={topic.stepId}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-center",
                  topic.done ? "bg-white text-accent" : "bg-white/10 text-white/60",
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...POP, delay: 0.25 + i * 0.05 }}
              >
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full",
                    topic.done ? "bg-emerald-500 text-white" : "bg-white/15 text-white/60",
                  )}
                >
                  {topic.done ? <Check className="size-4" strokeWidth={3.5} aria-hidden /> : <Lock className="size-3.5" aria-hidden />}
                </span>
                <span className={cn(face, "text-[10.5px] font-black leading-tight")}>{pick(topic.title, lang)}</span>
              </motion.li>
            ))}
          </ul>
          <p className={cn(face, "mt-3 flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-xs font-bold text-white/75")}>
            <Lock className="size-3.5 shrink-0" aria-hidden />
            {pick(PUBLIC_UI.levelTwoSoon, lang)}
          </p>
        </motion.section>
        )}

        {v1 && !hidden ? (
          <motion.section
            className={cn(
              "mt-4 rounded-3xl border-2 border-b-[5px] p-5 shadow-sm",
              v1.completed ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white",
            )}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <p className="font-sans text-xs font-black uppercase tracking-wider text-slate-500">{pick(PUBLIC_UI.v1Title, lang)}</p>
            <p className={cn(face, "mt-1.5 flex items-center gap-2 text-lg font-black", v1.completed ? "text-amber-800" : "text-slate-800")}>
              {v1.completed ? <Trophy className="size-5 shrink-0" aria-hidden /> : null}
              {pick(v1.completed ? PUBLIC_UI.v1Completed : PUBLIC_UI.v1Progress(v1.levelsCompleted, v1.totalLevels), lang)}
            </p>
            {v1.completed && v1.completedAt ? (
              <p className={cn(face, "mt-0.5 text-sm font-semibold text-amber-700")}>
                {pick(PUBLIC_UI.v1CompletedOn(dayLabel(v1.completedAt)), lang)}
              </p>
            ) : null}
          </motion.section>
        ) : null}

        {hidden ? null : (
        <motion.section
          className="mt-4 grid grid-cols-3 gap-2.5"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <div className="rounded-2xl border-2 border-b-4 border-emerald-300 bg-emerald-50 px-2 py-3 text-center text-emerald-700">
            <p className="flex items-center justify-center gap-1 font-sans text-xl font-black">
              <Gamepad2 className="size-4" aria-hidden />
              {gamesWon}
            </p>
            <p className={cn(face, "text-[11px] font-bold opacity-80")}>{pick(PUBLIC_UI.gamesWon, lang)}</p>
          </div>
          <div className="rounded-2xl border-2 border-b-4 border-orange-300 bg-orange-50 px-2 py-3 text-center text-orange-700">
            <p className="flex items-center justify-center gap-1 font-sans text-xl font-black">
              <Flame className="size-4" aria-hidden />
              {stats?.streakCurrent ?? 0}
            </p>
            <p className={cn(face, "text-[11px] font-bold opacity-80")}>{pick(PUBLIC_UI.streak, lang)}</p>
          </div>
          <div
            className={cn(
              "rounded-2xl border-2 border-b-4 px-2 py-3 text-center",
              finalPassed ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-500",
            )}
          >
            <p className="flex items-center justify-center gap-1 font-sans text-xl font-black">
              <Trophy className="size-4" aria-hidden />
              {finalTest ? `${finalTest.score}/${finalTest.max}` : "-"}
            </p>
            <p className={cn(face, "text-[11px] font-bold opacity-80")}>
              {finalTest ? pick(PUBLIC_UI.finalTest, lang) : pick(PUBLIC_UI.notYet, lang)}
            </p>
          </div>
        </motion.section>
        )}

        {social.isOwnProfile ? null : (
          <motion.section
            className="mt-5 rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white p-5 text-center shadow-sm"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
          >
            <p className={cn(face, "text-lg font-black text-slate-900")}>{pick(PUBLIC_UI.playCta, lang)}</p>
            <p className={cn(face, "mt-1 text-sm font-semibold text-slate-500")}>{pick(PUBLIC_UI.playCtaSub, lang)}</p>
            <Link
              href="/play"
              className={cn(
                face,
                "mt-4 flex h-12 items-center justify-center gap-2 rounded-2xl border-b-4 border-primary bg-accent text-base font-extrabold text-white transition-all hover:bg-accent/90 active:translate-y-0.5 active:border-b-2",
                lang === "en" && "uppercase tracking-wide",
              )}
            >
              <Play className="size-4 fill-current" aria-hidden />
              {pick(PUBLIC_UI.playCta, lang)}
            </Link>
          </motion.section>
        )}
      </main>
    </div>
  );
}
