"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Lock, ShieldCheck, Sparkles, Star, Users } from "lucide-react";

type PitchLanguage = "bn" | "en" | "both";

const BN_HEADING =
  "লেভেল ১ সফলভাবে সম্পন্ন করার জন্য অভিনন্দন! 🚀";
const BN_BODY =
  "আপনি আমাদের প্রিমিয়াম কোয়ালিটির একটি ঝলক দেখেছেন। কিন্তু আসল প্রস্তুতি তো সবে শুরু! আপনার স্বপ্নের **Desired Band Score** অর্জন করতে চান? আমাদের সম্পূর্ণ ২০-লেভেলের প্রিমিয়াম কোর্সটি আপনাকে ধাপে ধাপে সেই লক্ষ্যে পৌঁছে দেবে। আমরা নিশ্চিত করছি, এই কোর্সটি সম্পূর্ণ করলে আপনার কাঙ্ক্ষিত স্কোর অর্জন শুধু সময়ের ব্যাপার। আপনার প্রস্তুতি মাঝপথে থামিয়ে দেবেন না। এখনই আপগ্রেড করুন এবং আপনার সাফল্য নিশ্চিত করুন!";

const EN_HEADING = "Congratulations on completing Level 1! 🚀";
const EN_BODY =
  "You've just experienced a glimpse of our premium quality. But the real journey starts now! Ready to achieve your **Desired Band Score**? Our complete 20-level premium course is scientifically designed to guide you step-by-step to your exact target. We guarantee that completing this course will equip you to hit your dream score. Don't let your momentum stop here. Upgrade now and secure your success!";

const BN_FONT = "[font-family:var(--font-hind-siliguri),sans-serif]";

const LANGUAGE_OPTIONS: { value: PitchLanguage; label: string }[] = [
  { value: "bn", label: "বাংলা" },
  { value: "en", label: "English" },
  { value: "both", label: "Both (বাংলা + English)" },
];

function BodyWithBandHighlight({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const parts = text.split("**Desired Band Score**");
  if (parts.length === 1) {
    return <p className={className}>{text}</p>;
  }
  return (
    <p className={className}>
      {parts[0]}
      <strong className="font-semibold text-foreground">Desired Band Score</strong>
      {parts[1]}
    </p>
  );
}

export function TrialUpgradePageClient() {
  const [language, setLanguage] = useState<PitchLanguage>("bn");
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const displayRating = hoverRating || rating;

  const handleFeedbackSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating < 1) return;
    setFeedbackSubmitting(true);
    window.setTimeout(() => {
      setFeedbackSubmitting(false);
      setFeedbackSent(true);
    }, 500);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-20"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgb(30 58 138 / 0.25), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgb(16 185 129 / 0.12), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        {/* Hero — English only */}
        <header className="mb-8 text-center sm:mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
            <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
            Level 0 &amp; 1 complete — Premium starts at Level 2
          </div>
          <h1 className="text-balance text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            You proved you can show up. Now finish the job.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-sm text-slate-600 sm:text-base dark:text-slate-400">
            You&apos;ve seen premium-quality video, notes, a quiz, and True/False/Not Given practice.
            Levels 2–20 are paid — unlock them to stay on track for your exam.
          </p>
        </header>

        {/* Language toggle — above pitch */}
        <div className="mb-4 flex flex-col items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Message language
          </span>
          <div
            className="inline-flex flex-wrap items-center justify-center gap-1 rounded-xl border border-slate-200/90 bg-white/95 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900/95"
            role="group"
            aria-label="Choose pitch language"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLanguage(opt.value)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-all sm:px-4",
                  language === opt.value
                    ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                  opt.value === "bn" && language === opt.value && BN_FONT,
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Premium pitch card */}
        <div
          className="relative mb-10 rounded-2xl p-[1px] shadow-lg shadow-slate-900/5 dark:shadow-black/40"
          style={{
            background:
              "linear-gradient(135deg, rgb(30 58 138 / 0.45), rgb(16 185 129 / 0.35), rgb(30 58 138 / 0.4))",
          }}
        >
          <div className="relative overflow-hidden rounded-[15px] bg-white px-5 py-6 sm:px-8 sm:py-8 dark:bg-slate-900">
            <div
              className="pointer-events-none absolute -inset-8 rounded-2xl opacity-30 blur-2xl dark:opacity-20"
              aria-hidden
              style={{
                background:
                  "linear-gradient(135deg, rgb(59 130 246 / 0.35), rgb(16 185 129 / 0.3))",
              }}
            />
            <div className="relative z-10">
              {(language === "bn" || language === "both") && (
                <div className={language === "both" ? "mb-6" : ""}>
                  <h2
                    className={cn(
                      "text-xl font-bold leading-snug text-slate-900 sm:text-2xl dark:text-white",
                      BN_FONT,
                    )}
                  >
                    {BN_HEADING}
                  </h2>
                  <BodyWithBandHighlight
                    text={BN_BODY}
                    className={cn(
                      "mt-4 text-base leading-relaxed text-slate-700 sm:text-lg dark:text-slate-300",
                      BN_FONT,
                    )}
                  />
                </div>
              )}

              {language === "both" && (
                <div
                  className="my-6 flex items-center gap-3"
                  role="separator"
                  aria-hidden
                >
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-600" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    English
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-600" />
                </div>
              )}

              {(language === "en" || language === "both") && (
                <div>
                  <h2
                    className={cn(
                      "text-xl font-bold leading-snug sm:text-2xl",
                      language === "both"
                        ? "text-slate-600 dark:text-slate-400"
                        : "text-slate-900 dark:text-white",
                    )}
                  >
                    {EN_HEADING}
                  </h2>
                  <BodyWithBandHighlight
                    text={EN_BODY}
                    className={cn(
                      "mt-4 text-base leading-relaxed sm:text-lg",
                      language === "both"
                        ? "text-slate-600 dark:text-slate-400"
                        : "text-slate-700 dark:text-slate-300",
                    )}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feedback */}
        <section
          className="mb-10 rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900/60"
          aria-labelledby="feedback-heading"
        >
          <h2
            id="feedback-heading"
            className="text-lg font-semibold text-slate-900 dark:text-white"
          >
            How was your experience with Level 1?
          </h2>
          {feedbackSent ? (
            <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-400">
              Thank you — your feedback helps us improve the course for everyone.
            </p>
          ) : (
            <form className="mt-4 space-y-4" onSubmit={handleFeedbackSubmit}>
              <div>
                <Label className="mb-2 block text-slate-700 dark:text-slate-300">
                  Rating
                </Label>
                <div className="flex gap-1" role="group" aria-label="Star rating, 1 to 5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
                    >
                      <Star
                        className={cn(
                          "size-8 sm:size-9",
                          displayRating >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 dark:text-slate-600",
                        )}
                        aria-hidden
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="level1-feedback" className="text-slate-700 dark:text-slate-300">
                  Comments (optional)
                </Label>
                <Textarea
                  id="level1-feedback"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What worked well? What could be better?"
                  rows={4}
                  className="mt-2 resize-y border-slate-200 dark:border-slate-700"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                className="w-full border-slate-300 sm:w-auto dark:border-slate-600"
                disabled={rating < 1 || feedbackSubmitting}
              >
                {feedbackSubmitting ? "Submitting…" : "Submit Feedback"}
              </Button>
            </form>
          )}
        </section>

        {/* CTA */}
        <div className="flex flex-col items-center text-center">
          <Button
            asChild
            size="lg"
            className="h-auto min-h-14 w-full max-w-lg rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-900/25 transition-all hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl hover:shadow-emerald-900/30 sm:text-lg"
          >
            <Link
              href="/pricing"
              className="inline-flex w-full items-center justify-center gap-2"
            >
              <Lock className="size-5 shrink-0 opacity-90" aria-hidden />
              Unlock Premium &amp; Guarantee Your Band Score
            </Link>
          </Button>

          <div className="mt-6 flex flex-col items-center gap-2 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:gap-6">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4 text-slate-400" aria-hidden />
              Join 10,000+ successful students
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-600" aria-hidden>
              |
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-600/80 dark:text-emerald-400/90" aria-hidden />
              Secure checkout
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
