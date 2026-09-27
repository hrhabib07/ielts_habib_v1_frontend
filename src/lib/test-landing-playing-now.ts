import type { LearnerFeedbackPublicItem } from "@/src/lib/learner-feedback";
import { TEST_LANDING_GRADUATES } from "@/src/lib/test-landing-graduates";

export const TEST_LANDING_PLAYING_NOW_LIMIT = 6;

const FEATURED_GRADUATE_HANDLES = new Set(
  TEST_LANDING_GRADUATES.map((graduate) => graduate.username.trim().toLowerCase()),
);

const FEATURED_GRADUATE_NAMES = new Set(
  TEST_LANDING_GRADUATES.map((graduate) => normalizeName(graduate.fullName)),
);

/** Curated order from live feedback · graduates already on the cards stay out. */
export const TEST_LANDING_PLAYING_NOW_HANDLES = [
  "mamun_raj_bd",
  "aymanashiq",
  "nayeem",
  "muhitchoudhury",
  "sajid_islam_o",
  "taspia_zafrin",
  "sulaiman_aziz",
] as const;

/**
 * Snapshot used when `/learner-feedback/public` is empty or unreachable
 * (local backend down, brief outage). Keep in curated handle order.
 */
export const TEST_LANDING_PLAYING_NOW_FALLBACK: readonly LearnerFeedbackPublicItem[] = [
  {
    id: "fallback-mamun_raj_bd",
    title: "ব্যাবসায়ী",
    rating: 5,
    body: "ইংরেজি শেখার ক্ষেত্রে ব্যাতিক্রম একটি উদ্যোগ খুবই ভালো একদম প্রাথমিক পর্যায় হতে শেখার সুযোগ যা কার্যকরী উদ্যোক্তাকে অনেক ধন্যবাদ।",
    displayName: "Muhammad al Mamun",
    username: "mamun_raj_bd",
    profileHandle: "mamun_raj_bd",
    avatarUrl:
      "https://lh3.googleusercontent.com/a/ACg8ocIC2l-K6ga6myui3zEIBxA2FuY1xFx2GHEIy1E6IpE_wrOIZg=s96-c",
    missionsCompleted: 21,
    highestCompletedMissionOrder: 21,
  },
  {
    id: "fallback-aymanashiq",
    title: "জাতীয় বিশ্ববিদ্যালয় স্টুডেন্ট",
    rating: 5,
    body: "Gamlish ব্যবহার করে আমার learning experience বেশ ভালো। Lesson গুলো simple এবং easy to understand। বিশেষ করে game-এর মাধ্যমে English শেখার পদ্ধতিটা আমার কাছে বেশ effective লেগেছে। নিয়মিত practice করলে English শেখা আরও সহজ হবে মনে হচ্ছে। Gamlish-এর overall concept আমার ভালো লেগেছে।",
    displayName: "Ayman Ashiq",
    username: "aymanashiq",
    profileHandle: "aymanashiq",
    avatarUrl:
      "https://lh3.googleusercontent.com/a/ACg8ocKr260gm5YGS19-tsw8y9TkyclFh-CD3kSjm5S-IXvrY_5IHQ=s96-c",
    missionsCompleted: 12,
    highestCompletedMissionOrder: 12,
  },
  {
    id: "fallback-nayeem",
    title: "জাতীয় বিশ্ববিদ্যালয় স্টুডেন্ট",
    rating: 5,
    body: "গেম খেলে ইংরেজি শেখাএর পদ্ধতি ধারুন লেগেছে,ইংরেজি শেখার জন্য এইটা খুবি ইউনিক পদ্ধতি। ইংরেজি শেখার জন্য গেমলিশ এর উপর বিশ্বাস রাখাই যায়।🤍",
    displayName: "Nayeem",
    username: "nayeem",
    profileHandle: "nayeem",
    avatarUrl: null,
    missionsCompleted: 11,
    highestCompletedMissionOrder: 11,
  },
  {
    id: "fallback-muhitchoudhury",
    title: "জাতীয় বিশ্ববিদ্যালয় স্টুডেন্ট",
    rating: 5,
    body: "আলহামদুলিল্লাহ, গেম খেলে ইংরেজি শেখার পদ্ধতি আমার কাছে অত্যন্ত ভালো লেগেছে। আমি নিজে রিয়েলাইজ করতে পারছি যে, আমি আগের থেকে অনেক বেশি ইংরেজি পারি।",
    displayName: "Muhit Choudhury",
    username: "muhitchoudhury",
    profileHandle: "muhitchoudhury",
    avatarUrl:
      "https://lh3.googleusercontent.com/a/ACg8ocI_Cn2OYIRGw1JMcO4LEZdus2UbOvBL6uOuVvu_QpwC6aC50A=s96-c",
    missionsCompleted: 9,
    highestCompletedMissionOrder: 9,
  },
  {
    id: "fallback-sajid_islam_o",
    title: "বিশ্ববিদ্যালয় স্টুডেন্ট",
    rating: 5,
    body: "গেইম খেলে ইংলিশ শেখার পদ্ধতিটি আমার দারুন লেগেছে। এটি একটি ইউনিক মাধ্যম। ইংরেজির বেসিক স্ট্রং করার লক্ষে এবং এডভান্স লেভেলের ইংরেজি শেখার পেছনের ভিত্তি মজবুত করার লক্ষ্যে এই গেমটি অনেক বেশি সাহায্য করবে।",
    displayName: "Sajid Islam",
    username: "sajid_islam_o",
    profileHandle: "sajid_islam_o",
    avatarUrl:
      "https://lh3.googleusercontent.com/a/ACg8ocK7bS26uVKVcb1OUFipdrcwN_Qsgs3QShjNubLHmQk7JNbv3EvE=s96-c",
    missionsCompleted: 6,
    highestCompletedMissionOrder: 6,
  },
  {
    id: "fallback-taspia_zafrin",
    title: "স্কুল স্টুডেন্ট",
    rating: 5,
    body: "এই গেমটির মাধ্যমে আমি অনেক ইংলিশ শিখতে পেরেছি আমার কাছে দারুন লেগেছে এই গেমটি",
    displayName: "Taspia Zafrin",
    username: "taspia_zafrin",
    profileHandle: "taspia_zafrin",
    avatarUrl:
      "https://lh3.googleusercontent.com/a/ACg8ocIBZEl3WG07m66QKDIePHiFsZF9D8EGZ5eQffsub5WnZveP5Q=s96-c",
    missionsCompleted: 5,
    highestCompletedMissionOrder: 5,
  },
];

function normalizeHandle(value?: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

function normalizeName(value?: string | null): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function itemHandle(item: LearnerFeedbackPublicItem): string {
  return normalizeHandle(item.username || item.profileHandle);
}

export function isFeaturedGraduateFeedback(item: LearnerFeedbackPublicItem): boolean {
  const handle = itemHandle(item);
  if (handle && FEATURED_GRADUATE_HANDLES.has(handle)) return true;
  return FEATURED_GRADUATE_NAMES.has(normalizeName(item.displayName));
}

function qualityScore(item: LearnerFeedbackPublicItem): number {
  const body = item.body.trim().length;
  let score = 0;
  if (item.rating >= 5) score += 40;
  else score += item.rating * 6;
  if (body >= 60 && body <= 280) score += 24;
  else if (body >= 40) score += 12;
  if (item.avatarUrl?.startsWith("http")) score += 16;
  const missions = item.missionsCompleted ?? item.highestCompletedMissionOrder ?? 0;
  if (missions >= 3 && missions < 21) score += 10;
  else if (missions >= 21) score += 6;
  return score;
}

export function selectPlayingNowStories(
  rows: readonly LearnerFeedbackPublicItem[],
  limit = TEST_LANDING_PLAYING_NOW_LIMIT,
): LearnerFeedbackPublicItem[] {
  const eligible = rows.filter(
    (item) => item.body.trim().length >= 24 && !isFeaturedGraduateFeedback(item),
  );
  const byHandle = new Map(
    eligible.map((item) => [itemHandle(item), item] as const),
  );

  const selected: LearnerFeedbackPublicItem[] = [];
  const seen = new Set<string>();

  const push = (item: LearnerFeedbackPublicItem | undefined) => {
    if (!item || selected.length >= limit) return;
    const key = item.id || itemHandle(item) || item.displayName;
    if (seen.has(key)) return;
    seen.add(key);
    selected.push(item);
  };

  for (const handle of TEST_LANDING_PLAYING_NOW_HANDLES) {
    push(byHandle.get(handle));
  }

  const rest = eligible
    .filter((item) => !seen.has(item.id || itemHandle(item) || item.displayName))
    .sort((a, b) => qualityScore(b) - qualityScore(a));

  for (const item of rest) push(item);

  return selected.slice(0, limit);
}
