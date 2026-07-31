import type { UiLocale } from "@/src/lib/ui-locale";

export const MISSION_END_FEEDBACK_STORAGE_PREFIX = "gamlish.missionEndFeedback.v1:";

export function missionEndFeedbackStorageKey(slug: string): string {
  return `${MISSION_END_FEEDBACK_STORAGE_PREFIX}${slug}`;
}

export const MISSION_END_RATING_OPTIONS = [
  { value: 5, en: "Excellent", bn: "চমৎকার" },
  { value: 4, en: "Good", bn: "ভালো" },
  { value: 3, en: "Average", bn: "মোটামুটি" },
  { value: 2, en: "Below Average", bn: "সন্তোষজনক নয়" },
  { value: 1, en: "Poor", bn: "খুবই খারাপ" },
] as const;

export interface MissionEndFeedbackCopy {
  readonly eyebrow: string;
  readonly intro: string;
  readonly q1: string;
  readonly q2: string;
  readonly q3: string;
  readonly q2Placeholder: string;
  readonly q3Placeholder: string;
  readonly continue: string;
  readonly submit: string;
  readonly later: string;
  readonly thanksTitle: string;
  readonly thanksBody: string;
  readonly stepOf: (step: number, total: number) => string;
}

export const MISSION_END_FEEDBACK_COPY: Record<UiLocale, MissionEndFeedbackCopy> = {
  bn: {
    eyebrow: "মিশন ফিডব্যাক",
    intro:
      "আপনার সৎ মতামত আমাদের আরও ভালো ইংরেজি শেখার গেম তৈরি করতে সাহায্য করবে।",
    q1: "এই মিশনে আপনার অভিজ্ঞতা কেমন ছিল?",
    q2: "এই মিশনের কোন দিকটি আপনার সবচেয়ে বেশি ভালো লেগেছে?",
    q3: "এই মিশন আরও ভালো করতে আমরা কী উন্নতি করতে পারি?",
    q2Placeholder: "একটি ছোট কথা লিখুন…",
    q3Placeholder: "যা উন্নতি করা দরকার, খুলে বলুন…",
    continue: "পরের ধাপ",
    submit: "ফিডব্যাক পাঠাও",
    later: "পরে উত্তর দেব",
    thanksTitle: "ধন্যবাদ!",
    thanksBody: "আপনার মতামত আমাদের কনটেন্ট উন্নত করতে সাহায্য করবে।",
    stepOf: (step, total) => `ধাপ ${step} / ${total}`,
  },
  en: {
    eyebrow: "Mission feedback",
    intro:
      "Your honest feedback helps us build a better Game of English.",
    q1: "How would you rate your experience with this mission?",
    q2: "What's the #1 thing you liked about this mission?",
    q3: "What's the #1 thing we can improve in this mission?",
    q2Placeholder: "One short thing you liked…",
    q3Placeholder: "Tell us what we should improve…",
    continue: "Continue",
    submit: "Send feedback",
    later: "I'll answer later",
    thanksTitle: "Thank you!",
    thanksBody: "Your feedback helps us improve the content for every learner.",
    stepOf: (step, total) => `Step ${step} / ${total}`,
  },
};

export interface MissionEndFeedbackPayload {
  rating?: number | null;
  likedText?: string;
  improveText?: string;
  status: "completed" | "skipped";
  lastStep: 1 | 2 | 3;
}
