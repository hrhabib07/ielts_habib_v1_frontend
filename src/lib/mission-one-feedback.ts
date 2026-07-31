export type MissionOneExperience =
  | "loved_learned"
  | "okay_neutral"
  | "too_easy"
  | "too_hard";

export type MissionOneIntent = "buy_now" | "buy_later" | "stick_to_free";

export type MissionOneObjection =
  | "price_high"
  | "value_unclear"
  | "too_easy_no_upgrade"
  | "too_hard_confusing"
  | "payment_issue"
  | "other"
  | "";

export interface MissionOneFeedbackPayload {
  experience: string;
  intent: string;
  objection: string;
  otherText?: string;
  status: "completed" | "skipped";
  lastStep: 1 | 2 | 3;
}

export const MISSION_ONE_FEEDBACK_STORAGE_KEY = "gamlish.m1Feedback.v1";
export const MISSION_ONE_CHECKOUT_HREF = "/checkout";

export const EXPERIENCE_OPTIONS: ReadonlyArray<{
  value: MissionOneExperience;
  label: string;
}> = [
  { value: "loved_learned", label: "🤩 দারুণ! নতুন কিছু শিখেছি" },
  { value: "okay_neutral", label: "😐 মোটামুটি, খারাপ না" },
  { value: "too_easy", label: "🥱 খুবই সহজ ছিল" },
  { value: "too_hard", label: "🤯 খুবই কঠিন / বুঝতে কষ্ট হয়েছে" },
];

export const INTENT_OPTIONS: ReadonlyArray<{
  value: MissionOneIntent;
  label: string;
}> = [
  { value: "buy_now", label: "🚀 এখনই আনলক করব (159৳)" },
  { value: "buy_later", label: "⏳ ইচ্ছে আছে, কিন্তু পরে করব" },
  { value: "stick_to_free", label: "🛑 না, ফ্রি ভার্সনই ব্যবহার করব" },
];

export const OBJECTION_OPTIONS: ReadonlyArray<{
  value: Exclude<MissionOneObjection, "" | "other">;
  label: string;
}> = [
  { value: "price_high", label: "💰 মূল্য আমার জন্য একটু বেশি" },
  {
    value: "value_unclear",
    label: "🤔 শিওর না এটা আমার কাজে আসবে কিনা",
  },
  {
    value: "too_easy_no_upgrade",
    label: "🥱 মিশন 1 খুব সহজ ছিল, তাই আপগ্রেড লাগবে না",
  },
  {
    value: "too_hard_confusing",
    label: "🤯 মিশন 1 খুব কঠিন লেগেছে / বুঝতে সমস্যা হয়েছে",
  },
  {
    value: "payment_issue",
    label: "💳 বিকাশ/নগদ পেমেন্টে সমস্যা হচ্ছে",
  },
];

/** Admin-facing English labels for analytics. */
export const FEEDBACK_LABELS = {
  experience: {
    loved_learned: "Loved it / learned something",
    okay_neutral: "Okay / neutral",
    too_easy: "Too easy",
    too_hard: "Too hard / confusing",
  } as Record<string, string>,
  intent: {
    buy_now: "Buy now",
    buy_later: "Buy later",
    stick_to_free: "Stick to free",
  } as Record<string, string>,
  objection: {
    price_high: "Price too high",
    value_unclear: "Value unclear",
    too_easy_no_upgrade: "Too easy, no upgrade",
    too_hard_confusing: "Too hard / confusing",
    payment_issue: "Payment friction",
    other: "Other (free text)",
  } as Record<string, string>,
} as const;
