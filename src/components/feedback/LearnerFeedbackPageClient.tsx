"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Star, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LearnerFeedbackCard } from "@/src/components/feedback/LearnerFeedbackCard";
import {
  getLearnerFeedbackInvite,
  getMyLearnerFeedback,
  submitLearnerFeedback,
  type LearnerFeedbackRecord,
} from "@/src/lib/api/learnerFeedback";
import { getMyProfile } from "@/src/lib/api/profile";
import type { StudentProfile } from "@/src/lib/api/types";
import { getDecodedTokenClient } from "@/src/lib/auth";
import {
  LEARNER_FEEDBACK_MAX_BODY,
  LEARNER_FEEDBACK_MIN_BODY,
  LEARNER_FEEDBACK_REWARD_XP,
  LEARNER_FEEDBACK_TOPIC_HINTS_BN,
  LEARNER_TITLE_OTHER,
  LEARNER_TITLE_PRESETS_BN,
  type LearnerFeedbackInviteStatus,
} from "@/src/lib/learner-feedback";
import { getStudentDisplayName } from "@/src/lib/student-display-name";
import { cn } from "@/lib/utils";

function extractApiMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const data = (err as { response?: { data?: { message?: string } } }).response
      ?.data;
    if (data?.message) return data.message;
  }
  if (err instanceof Error) return err.message;
  return "সাবমিট করা যায়নি। আবার চেষ্টা করো।";
}

export function LearnerFeedbackPageClient() {
  const router = useRouter();
  const [bootLoading, setBootLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [invite, setInvite] = useState<LearnerFeedbackInviteStatus | null>(null);
  const [existing, setExisting] = useState<LearnerFeedbackRecord | null>(null);
  const [preset, setPreset] = useState<string>("");
  const [customTitle, setCustomTitle] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awardedXp, setAwardedXp] = useState<number | null>(null);

  const displayName =
    getStudentDisplayName(profile) || profile?.username || "Learner";

  const titleChosen = preset.length > 0;
  const resolvedTitle = useMemo(() => {
    if (!titleChosen) return "";
    if (preset === LEARNER_TITLE_OTHER) {
      return customTitle.trim();
    }
    return preset;
  }, [customTitle, preset, titleChosen]);

  const load = useCallback(async () => {
    setBootLoading(true);
    setError(null);
    try {
      const [mine, me, inv] = await Promise.all([
        getMyLearnerFeedback(),
        getMyProfile().catch(() => null),
        getLearnerFeedbackInvite().catch(() => null),
      ]);
      setExisting(mine);
      setProfile(me);
      setInvite(inv);
    } catch (err) {
      setError(extractApiMessage(err));
    } finally {
      setBootLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getDecodedTokenClient();
    if (!token || token.role !== "STUDENT") {
      router.replace(`/login?redirect=${encodeURIComponent("/feedback")}`);
      return;
    }
    void load();
  }, [load, router]);

  const hasPaidAccess = Boolean(invite?.hasEnglishAccess);
  const eligible = Boolean(invite?.eligible);
  const showForm = !existing && eligible;
  const showHints = body.trim().length === 0;

  const canSubmit =
    showForm &&
    titleChosen &&
    resolvedTitle.length >= 2 &&
    rating >= 1 &&
    rating <= 5 &&
    body.trim().length >= LEARNER_FEEDBACK_MIN_BODY &&
    body.trim().length <= LEARNER_FEEDBACK_MAX_BODY &&
    !submitting;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const saved = await submitLearnerFeedback({
        title: resolvedTitle,
        rating,
        body: body.trim(),
      });
      setExisting(saved);
      setAwardedXp(saved.xpAwarded ?? LEARNER_FEEDBACK_REWARD_XP);
      setInvite((prev) =>
        prev
          ? {
              ...prev,
              alreadySubmitted: true,
              eligible: false,
              rewardXp: 0,
              totalXp: saved.totalXpAfter ?? prev.totalXp,
            }
          : prev,
      );
    } catch (err) {
      setError(extractApiMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (bootLoading) {
    return (
      <main className="flex min-h-[70dvh] items-center justify-center bg-background px-4">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-[radial-gradient(ellipse_at_top,#e0f2fe_0%,transparent_55%),hsl(var(--background))] px-4 py-8 sm:py-10">
      <div className="mx-auto w-full max-w-xl space-y-6 font-bengali">
        <header className="space-y-2 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
            Gamlish Feedback
          </p>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            তোমার অভিজ্ঞতা শেয়ার করো
          </h1>
          <p className="text-sm font-medium leading-relaxed text-muted-foreground">
            নাম আসবে তোমার প্রোফাইল থেকে। শুধু টাইটেল, রেটিং, আর তোমার প্রিয় জিনিসটা লেখো।
          </p>
        </header>

        {invite && !existing ? (
          <div className="grid grid-cols-2 gap-3 rounded-3xl border border-sky-500/20 bg-sky-500/5 p-4">
            <div className="rounded-2xl bg-card/90 px-3 py-3 text-center ring-1 ring-border/70">
              <Trophy className="mx-auto h-4 w-4 text-amber-500" />
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                মিশন শেষ
              </p>
              <p className="text-xl font-black tabular-nums text-foreground">
                {invite.missionsCompleted}
              </p>
            </div>
            <div className="rounded-2xl bg-card/90 px-3 py-3 text-center ring-1 ring-border/70">
              <Zap className="mx-auto h-4 w-4 text-sky-500" />
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                বর্তমান XP
              </p>
              <p className="text-xl font-black tabular-nums text-foreground">
                {invite.totalXp}
              </p>
            </div>
            {eligible ? (
              <p className="col-span-2 text-center text-xs font-bold text-sky-800 dark:text-sky-200">
                সাবাশ! প্রথমবার ফিডব্যাক দিলে +{LEARNER_FEEDBACK_REWARD_XP} XP
              </p>
            ) : null}
          </div>
        ) : null}

        {!hasPaidAccess ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-center">
            <p className="text-sm font-bold text-amber-950 dark:text-amber-100">
              এই ফর্ম শুধু ফুল জার্নি পেইড লার্নারদের জন্য।
            </p>
            <Button asChild className="mt-4 rounded-xl font-black">
              <Link href="/checkout">ফুল জার্নি আনলক করো</Link>
            </Button>
          </div>
        ) : null}

        {hasPaidAccess && !eligible && !existing ? (
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <p className="text-sm font-bold text-foreground">
              Mission 3 শেষ করলে তুমি এখানে স্টোরি দিতে পারবে।
            </p>
            <Button asChild className="mt-4 rounded-xl font-black">
              <Link href="/player">ম্যাপে ফিরে যাও</Link>
            </Button>
          </div>
        ) : null}

        {existing ? (
          <div className="space-y-3">
            <p className="text-center text-sm font-bold text-emerald-700 dark:text-emerald-300">
              ধন্যবাদ! তোমার ফিডব্যাক জমা হয়েছে। এটা আর এডিট করা যাবে না।
            </p>
            {awardedXp != null && awardedXp > 0 ? (
              <p className="text-center text-sm font-black text-sky-700">
                +{awardedXp} XP পেয়েছো
              </p>
            ) : existing.xpAwarded > 0 ? (
              <p className="text-center text-sm font-black text-sky-700">
                +{existing.xpAwarded} XP পেয়েছো
              </p>
            ) : null}
            <LearnerFeedbackCard
              displayName={existing.displayName}
              title={existing.title}
              rating={existing.rating}
              body={existing.body}
              pendingBadge={existing.status === "pending"}
            />
            {existing.status === "approved" ? (
              <p className="text-center text-xs font-semibold text-muted-foreground">
                অ্যাপ্রুভড · হোমপেজে দেখানো হতে পারে
              </p>
            ) : existing.status === "rejected" ? (
              <p className="text-center text-xs font-semibold text-muted-foreground">
                রিজেক্টেড · অ্যাডমিন রিভিউ সম্পন্ন
              </p>
            ) : (
              <p className="text-center text-xs font-semibold text-muted-foreground">
                রিভিউতে আছে · অ্যাপ্রুভ হলে হোমপেজে দেখা যাবে
              </p>
            )}
          </div>
        ) : showForm ? (
          <div className="space-y-5 rounded-3xl border border-border/70 bg-card/95 p-5 shadow-sm sm:p-6">
            <div>
              <label className="text-xs font-bold text-muted-foreground">
                নামের নিচে কোন টাইটেল দেখাবে?
              </label>
              <p className="mt-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                {titleChosen
                  ? "ঠিক আছে · চাইলে অন্যটা বেছে নিতে পারো"
                  : "একটি বেছে নাও (ডিফল্ট কিছুই সিলেক্টেড নেই)"}
              </p>
              <div
                className="mt-2 flex flex-wrap gap-2"
                role="radiogroup"
                aria-label="টাইটেল বেছে নাও"
              >
                {LEARNER_TITLE_PRESETS_BN.map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="radio"
                    aria-checked={preset === item}
                    onClick={() => setPreset(item)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition",
                      preset === item
                        ? "bg-sky-600 text-white ring-sky-600"
                        : "bg-background text-foreground ring-border hover:bg-muted",
                    )}
                  >
                    {item}
                  </button>
                ))}
                <button
                  type="button"
                  role="radio"
                  aria-checked={preset === LEARNER_TITLE_OTHER}
                  onClick={() => setPreset(LEARNER_TITLE_OTHER)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition",
                    preset === LEARNER_TITLE_OTHER
                      ? "bg-sky-600 text-white ring-sky-600"
                      : "bg-background text-foreground ring-border hover:bg-muted",
                  )}
                >
                  {LEARNER_TITLE_OTHER}
                </button>
              </div>
              {preset === LEARNER_TITLE_OTHER ? (
                <input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value.slice(0, 60))}
                  placeholder="নিজে লিখো (উদাহরণ: শিক্ষক, ফ্রিল্যান্সার)"
                  className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold outline-none ring-sky-500/30 focus:ring-2"
                />
              ) : null}
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground">
                রেটিং (১ থেকে ৫)
              </label>
              <div className="mt-2 flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => {
                  const value = i + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="rounded-lg p-1.5 transition hover:bg-amber-500/10 active:scale-110"
                      aria-label={`${value} star`}
                    >
                      <Star
                        className={cn(
                          "h-7 w-7",
                          value <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/40",
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-muted-foreground">
                  Gamlish-এর কোন জিনিসটা তোমার সবচেয়ে ভালো লেগেছে?
                </label>
                <span className="font-sans text-[11px] font-bold tabular-nums text-muted-foreground">
                  {body.trim().length}/{LEARNER_FEEDBACK_MAX_BODY}
                </span>
              </div>
              {showHints ? (
                <p className="mt-2 text-[11px] font-medium leading-relaxed text-muted-foreground/80">
                  আইডিয়া: {LEARNER_FEEDBACK_TOPIC_HINTS_BN.join(" · ")}
                </p>
              ) : null}
              <textarea
                value={body}
                onChange={(e) =>
                  setBody(e.target.value.slice(0, LEARNER_FEEDBACK_MAX_BODY))
                }
                rows={5}
                placeholder="যেমন: গেম খেলে ইংরেজি শেখার পদ্ধতিটি আমার দারুণ লেগেছে..."
                className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm leading-relaxed outline-none ring-sky-500/30 focus:ring-2"
              />
            </div>

            <div className="space-y-2 rounded-2xl bg-muted/40 p-3">
              <p className="text-center text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                প্রিভিউ · এভাবেই হোমপেজে দেখা যাবে
              </p>
              <LearnerFeedbackCard
                displayName={displayName}
                title={resolvedTitle || "টাইটেল"}
                rating={rating}
                body={body}
              />
            </div>

            {error ? (
              <p className="text-center text-sm font-bold text-rose-600">{error}</p>
            ) : null}

            <Button
              type="button"
              size="lg"
              disabled={!canSubmit}
              onClick={() => void onSubmit()}
              className="h-12 w-full rounded-2xl text-base font-black"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                `ফিডব্যাক দাও · +${LEARNER_FEEDBACK_REWARD_XP} XP`
              )}
            </Button>
            <p className="text-center text-[11px] font-semibold text-muted-foreground">
              পাঠানোর পর এডিট করা যাবে না · XP শুধু প্রথমবার
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
