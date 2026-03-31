"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

const BN_FONT = "[font-family:var(--font-hind-siliguri),sans-serif]";

const Q1 = {
  en: "What's one thing we could change to make this better for you?",
  bn: "আমরা কী পরিবর্তন করলে আপনার জন্য এটি আরও ভালো হবে?",
};

const Q2 = {
  en: "How likely are you to share this experience with a friend?",
  bn: "আপনি এই অভিজ্ঞতা একজন বন্ধুর সাথে শেয়ার করার সম্ভাবনা কতটুকু?",
};

const Q2_OPTIONS: { value: string; en: string; bn: string }[] = [
  { value: "not_at_all", en: "Not at all likely", bn: "একদমই সম্ভব নয়" },
  { value: "unlikely", en: "Unlikely", bn: "কম সম্ভাবনা" },
  { value: "neutral", en: "Neutral", bn: "মাঝামাঝি" },
  { value: "likely", en: "Likely", bn: "সম্ভাব্য" },
  { value: "very_likely", en: "Very likely", bn: "খুবই সম্ভাব্য" },
];

const Q3 = {
  en: "How familiar were you with the IELTS Reading module before joining this platform?",
  bn: "এই প্ল্যাটফর্মে আসার আগে আপনি IELTS রিডিং মডিউল সম্পর্কে কতটা পরিচিত ছিলেন?",
};

const Q3_OPTIONS: { value: string; en: string; bn: string }[] = [
  {
    value: "no_idea",
    en: "I had no idea about IELTS.",
    bn: "আমার IELTS সম্পর্কে কোনো ধারণা ছিল না।",
  },
  {
    value: "little",
    en: "Very little idea.",
    bn: "খুব সামান্য ধারণা ছিল।",
  },
  {
    value: "pro",
    en: "I am a pro IELTS student.",
    bn: "আমি একজন অভিজ্ঞ IELTS শিক্ষার্থী।",
  },
];

function BilingualQuestion({
  number,
  en,
  bn,
  children,
}: {
  number: number;
  en: string;
  bn: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="space-y-3 rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
      <legend className="sr-only">
        Question {number}
      </legend>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          <span className="text-indigo-600 dark:text-indigo-400">{number}.</span> {en}
        </p>
        <p className={cn("text-sm leading-relaxed text-slate-700 dark:text-slate-300", BN_FONT)}>
          {bn}
        </p>
      </div>
      {children}
    </fieldset>
  );
}

export function TrialFeedbackPageClient() {
  const searchParams = useSearchParams();
  const levelId = searchParams.get("levelId") ?? "";

  const [improvement, setImprovement] = useState("");
  const [shareLikelihood, setShareLikelihood] = useState<string>("");
  const [familiarity, setFamiliarity] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!shareLikelihood || !familiarity) return;
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setSent(true);
    }, 500);
  };

  const backHref = levelId
    ? `/profile/reading/strict-levels/${levelId}`
    : "/profile/reading";

  if (sent) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 pb-20 sm:py-14 sm:pb-24">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8">
          <p className="text-base font-medium text-slate-900 dark:text-slate-100">
            Thank you. Your feedback helps us improve GAMLISH for everyone.
          </p>
          <p className={cn("mt-2 text-sm text-slate-600 dark:text-slate-400", BN_FONT)}>
            ধন্যবাদ। আপনার মতামত আমাদের সবার জন্য GAMLISH আরও ভালো করতে সাহায্য করে।
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/pricing">View plans</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={backHref}>Back to Reading</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 pb-20 sm:py-10 sm:pb-24">
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back
      </Link>

      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Trial feedback
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Help us improve after your free trial. Each question is in English and Bangla.
        </p>
        <p className={cn("mt-2 text-sm text-slate-600 dark:text-slate-400", BN_FONT)}>
          আপনার ফ্রি ট্রায়ালের পর আমাদের উন্নতিতে সাহায্য করুন। প্রতিটি প্রশ্ন ইংরেজি ও বাংলায়।
        </p>
      </header>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <input type="hidden" name="levelId" value={levelId} readOnly />

        <BilingualQuestion number={1} en={Q1.en} bn={Q1.bn}>
          <div>
            <Label htmlFor="trial-fb-improve" className="sr-only">
              {Q1.en}
            </Label>
            <Textarea
              id="trial-fb-improve"
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
              rows={4}
              placeholder="Your answer / আপনার উত্তর"
              className="resize-y border-slate-200 dark:border-slate-600"
            />
          </div>
        </BilingualQuestion>

        <BilingualQuestion number={2} en={Q2.en} bn={Q2.bn}>
          <div className="space-y-2" role="radiogroup" aria-label={Q2.en}>
            {Q2_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:bg-white/80 dark:hover:bg-slate-800/60",
                  shareLikelihood === opt.value &&
                    "border-indigo-200 bg-indigo-50/80 dark:border-indigo-800 dark:bg-indigo-950/40",
                )}
              >
                <input
                  type="radio"
                  name="shareLikelihood"
                  value={opt.value}
                  checked={shareLikelihood === opt.value}
                  onChange={() => setShareLikelihood(opt.value)}
                  className="mt-1 size-4 shrink-0 accent-indigo-600"
                />
                <span className="min-w-0 flex-1 text-sm">
                  <span className="block font-medium text-slate-900 dark:text-slate-100">
                    {opt.en}
                  </span>
                  <span className={cn("mt-0.5 block text-slate-600 dark:text-slate-400", BN_FONT)}>
                    {opt.bn}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </BilingualQuestion>

        <BilingualQuestion number={3} en={Q3.en} bn={Q3.bn}>
          <div className="space-y-2" role="radiogroup" aria-label={Q3.en}>
            {Q3_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:bg-white/80 dark:hover:bg-slate-800/60",
                  familiarity === opt.value &&
                    "border-indigo-200 bg-indigo-50/80 dark:border-indigo-800 dark:bg-indigo-950/40",
                )}
              >
                <input
                  type="radio"
                  name="familiarity"
                  value={opt.value}
                  checked={familiarity === opt.value}
                  onChange={() => setFamiliarity(opt.value)}
                  className="mt-1 size-4 shrink-0 accent-indigo-600"
                />
                <span className="min-w-0 flex-1 text-sm">
                  <span className="block font-medium text-slate-900 dark:text-slate-100">
                    {opt.en}
                  </span>
                  <span className={cn("mt-0.5 block text-slate-600 dark:text-slate-400", BN_FONT)}>
                    {opt.bn}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </BilingualQuestion>

        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={!shareLikelihood || !familiarity || submitting}
        >
          {submitting ? "Submitting…" : "Submit feedback"}
        </Button>
      </form>
    </div>
  );
}
