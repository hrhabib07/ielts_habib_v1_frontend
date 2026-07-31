import type { UiLocale } from "@/src/lib/ui-locale";

export interface MasterPathUiCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly whyTitle: string;
  readonly whyBody: string;
  readonly rewardTitle: string;
  readonly rewardBody: string;
  readonly conditionsTitle: string;
  readonly conditionMaster: string;
  readonly conditionMonth: string;
  readonly tipsTitle: string;
  readonly tipLearn: string;
  readonly tipVideo: string;
  readonly tipPace: string;
  readonly tipBrain: string;
  readonly tipHonesty: string;
  readonly cta: string;
}

export const MASTER_PATH_UI_COPY: Record<UiLocale, MasterPathUiCopy> = {
  bn: {
    eyebrow: "Master Path · গুরুত্বপূর্ণ",
    title: "Mission 2 শুরুর আগে এটা পড়ো",
    lead: "প্রতিটি অনুশীলন মার্ক হয়। সাবধানে শিখো, তাহলে 90%+ পাওয়া সম্ভব।",
    whyTitle: "কেন 90% গুরুত্বপূর্ণ?",
    whyBody:
      "চারটি ক্যাম্পেই Master (90%+) হলে, Intermediate Camp লঞ্চ হলে তুমি ফ্রি অ্যাক্সেস পাবে।",
    rewardTitle: "ফ্রি Intermediate এর শর্ত",
    rewardBody:
      "সব ক্যাম্পে Master + পুরো Foundations কোর্স ১ মাসের মধ্যে শেষ করতে হবে।",
    conditionsTitle: "দুইটি শর্ত",
    conditionMaster: "Camp 01, 02, 03 ও 04 সবগুলোতে Master ব্যাজ (90%+)",
    conditionMonth: "Mission 1 শেষ করার পর থেকে ৩০ দিনের মধ্যে পুরো কোর্স শেষ",
    tipsTitle: "সেরা উপায় · মার্ক হারাবে না",
    tipLearn:
      "অনুশীলনের আগে শেখো। বুঝতে ChatGPT ব্যবহার করতে পারো। কিন্তু শুধু মুখস্থ নয়, বুঝে নাও।",
    tipVideo: "ভিডিও মনোযোগ দিয়ে দেখো। তারপর অনুশীলন শুরু করো।",
    tipPace: "দিনে একটা মিশন লক্ষ্য রাখো। তাড়াহুড়ো করলে মার্ক কমে।",
    tipBrain:
      "মার্কযুক্ত এক্সারসাইজে নিজের মাথা ব্যবহার করো। ChatGPT দিয়ে উত্তর কপি করো না।",
    tipHonesty:
      "90% না পেলেও সমস্যা নেই। লক্ষ্য হলো এই প্ল্যাটফর্ম থেকে সত্যিই শেখা।",
    cta: "বুঝেছি · Mission 2 শুরু করো",
  },
  en: {
    eyebrow: "Master Path · important",
    title: "Read this before Mission 2",
    lead: "Every exercise is marked. Learn carefully so 90%+ is realistic.",
    whyTitle: "Why does 90% matter?",
    whyBody:
      "If you earn Master (90%+) on all four camps, Intermediate Camp will be free for you when it launches.",
    rewardTitle: "Free Intermediate rules",
    rewardBody:
      "Master on every camp, and finish the full Foundations course within 1 month.",
    conditionsTitle: "Two conditions",
    conditionMaster: "Master badge (90%+) on Camp 01, 02, 03, and 04",
    conditionMonth: "Finish the full course within 30 days after completing Mission 1",
    tipsTitle: "Best way to keep your marks",
    tipLearn:
      "Learn before you practice. ChatGPT is fine for understanding. Do not only memorize.",
    tipVideo: "Watch the video carefully. Then start the exercises.",
    tipPace: "Aim for one mission a day. Rushing costs marks.",
    tipBrain:
      "On graded exercises, use your own brain. Do not paste answers from ChatGPT.",
    tipHonesty:
      "Missing 90% is okay. The real goal is to learn properly on this platform.",
    cta: "I understand · Start Mission 2",
  },
} as const;

export const MASTER_PATH_MODAL_STORAGE_KEY = "gamlish_master_path_m2_seen_v1";
