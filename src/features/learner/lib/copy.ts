import type { Bilingual } from "@/src/features/chat-lesson/types";

/** Learner-facing copy for onboarding, photo, profile and payment. `{name}` is filled per learner. */
export const LEARNER_UI = {
  hello: {
    en: "Hello! Welcome to **Gamlish**. Before we start, I would love to know you a little.",
    bn: "হ্যালো! **Gamlish**-এ আপনাকে স্বাগতম। শুরু করার আগে আপনার সম্পর্কে একটু জানতে চাই।",
  },
  askNameEn: {
    en: "What should I call you? Please type your **nickname in English** letters.",
    bn: "আপনাকে কী নামে ডাকব? আপনার **ডাকনাম ইংরেজি অক্ষরে** লিখুন।",
  },
  askNameBn: {
    en: "Now please type the same **nickname in Bangla** letters.",
    bn: "এবার একই **ডাকনাম বাংলা অক্ষরে** লিখুন।",
  },
  askAddress: {
    en: "Should I call you **Bhaiya** or **Apu**?",
    bn: "আপনাকে কি **ভাইয়া** বলে ডাকব, নাকি **আপু**?",
  },
  bhaiya: { en: "Bhaiya (ভাইয়া)", bn: "ভাইয়া (Bhaiya)" },
  apu: { en: "Apu (আপু)", bn: "আপু (Apu)" },
  askPlace: {
    en: "Nice to meet you, {name}! Which **district** do you live in?",
    bn: "পরিচিত হয়ে ভালো লাগল, {name}! আপনি কোন **জেলায়** থাকেন?",
  },
  searchDistrict: { en: "Search your district", bn: "আপনার জেলা খুঁজুন" },
  outsideBd: { en: "I live outside Bangladesh", bn: "আমি বাংলাদেশের বাইরে থাকি" },
  askCountry: {
    en: "Which **country** do you live in?",
    bn: "আপনি কোন **দেশে** থাকেন?",
  },
  countryPlaceholder: { en: "Type your country", bn: "দেশের নাম লিখুন" },
  backToDistricts: { en: "Back to districts", bn: "জেলার তালিকায় ফিরুন" },
  done: {
    en: "Thank you, {name}! Now let's start learning together.",
    bn: "ধন্যবাদ, {name}! চলুন, এবার একসঙ্গে শেখা শুরু করি।",
  },
  saving: { en: "Saving...", bn: "সেভ হচ্ছে..." },
  saveFailed: { en: "That did not save. Please try again.", bn: "সেভ হয়নি। আবার চেষ্টা করুন।" },
  send: { en: "Send", bn: "পাঠান" },
  typeEnglishLetters: { en: "Please use English letters (A to Z).", bn: "ইংরেজি অক্ষর (A থেকে Z) ব্যবহার করুন।" },
  typeBanglaLetters: { en: "Please use Bangla letters.", bn: "বাংলা অক্ষর ব্যবহার করুন।" },
  nameEnPlaceholder: { en: "e.g. Rahim", bn: "যেমন: Rahim" },
  nameBnPlaceholder: { en: "e.g. রহিম", bn: "যেমন: রহিম" },
  replyCallMe: { en: "You should call me", bn: "আমাকে ডাকবেন" },
  replyCallMeBn: { en: "In Bangla, call me", bn: "বাংলায় আমাকে ডাকবেন" },
  replyLiveIn: { en: "I live in", bn: "আমি থাকি" },
  callMeName: (name: string): Bilingual => ({ en: `Call me ${name}`, bn: `আমাকে ${name} ডাকবেন` }),
  callMeBhaiya: { en: "Call me Bhaiya", bn: "আমাকে ভাইয়া ডাকবেন" },
  callMeApu: { en: "Call me Apu", bn: "আমাকে আপু ডাকবেন" },
  pickOne: { en: "Pick one", bn: "একটি বেছে নিন" },
  continueLesson: { en: "Start the lesson", bn: "লেসন শুরু করুন" },

  photoTitle: { en: "Wow, {name}!", bn: "দারুণ, {name}!" },
  photoBody: {
    en: "You passed your first game. Add your photo so I can see you while we learn together!",
    bn: "আপনি প্রথম গেমটি পাস করেছেন। একটি ছবি দিন, যাতে একসঙ্গে শেখার সময় আমি আপনাকে দেখতে পাই!",
  },
  choosePhoto: { en: "Choose a photo", bn: "ছবি বেছে নিন" },
  changePhoto: { en: "Change photo", bn: "ছবি বদলান" },
  later: { en: "Later", bn: "পরে" },
  uploading: { en: "Uploading...", bn: "আপলোড হচ্ছে..." },
  photoSaved: { en: "Looking great, {name}!", bn: "খুব সুন্দর লাগছে, {name}!" },
  photoFailed: { en: "That photo did not upload. Please try another one.", bn: "ছবিটি আপলোড হয়নি। অন্য একটি চেষ্টা করুন।" },

  profileOpen: { en: "Open your profile", bn: "আপনার প্রোফাইল দেখুন" },
  profileLearner: { en: "Gamlish learner", bn: "Gamlish শিক্ষার্থী" },
  level: { en: "Level", bn: "লেভেল" },
  nowLearning: { en: "Now learning", bn: "এখন শিখছেন" },
  stopOf: (index: number, total: number) => ({ en: `Stop ${index} of ${total}`, bn: `ধাপ ${index} / ${total}` }),
  levelComplete: { en: "Level complete!", bn: "লেভেল শেষ!" },
  levelCompleteSub: { en: "Every stop is done.", bn: "সব ধাপ শেষ হয়েছে।" },
  lessons: { en: "Lessons", bn: "লেসন" },
  games: { en: "Games", bn: "গেম" },
  finalTest: { en: "Final Test", bn: "ফাইনাল টেস্ট" },
  notYet: { en: "Not yet", bn: "এখনো নয়" },
  editDetails: { en: "Edit details", bn: "তথ্য বদলান" },
  save: { en: "Save", bn: "সেভ করুন" },
  cancel: { en: "Cancel", bn: "বাতিল" },
  close: { en: "Close", bn: "বন্ধ করুন" },
  outsideBdShort: { en: "Outside Bangladesh", bn: "বাংলাদেশের বাইরে" },
  nameEnLabel: { en: "Nickname (English)", bn: "ডাকনাম (ইংরেজি)" },
  nameBnLabel: { en: "Nickname (Bangla)", bn: "ডাকনাম (বাংলা)" },
  callMeLabel: { en: "Call me", bn: "আমাকে ডাকবেন" },
  districtLabel: { en: "District", bn: "জেলা" },
  countryLabel: { en: "Country", bn: "দেশ" },

  paywallTitle: { en: "{name}, the rest of Level 1 is waiting!", bn: "{name}, লেভেল 1-এর বাকি অংশ অপেক্ষা করছে!" },
  paywallBody: {
    en: "You finished the free part. Unlock the full game to continue with Person, Verb, Object, Word Order and the Final Test.",
    bn: "আপনি ফ্রি অংশ শেষ করেছেন। Person, Verb, Object, Word Order আর ফাইনাল টেস্ট চালিয়ে যেতে পুরো গেম আনলক করুন।",
  },
  paywallCta: { en: "Unlock the full game", bn: "পুরো গেম আনলক করুন" },

  notOpenTitle: { en: "Coming soon", bn: "শিগগিরই আসছে" },
  notOpenBody: {
    en: "The new Mission 1 is not open for your account yet.",
    bn: "নতুন মিশন 1 এখনো আপনার অ্যাকাউন্টের জন্য খোলা হয়নি।",
  },
  backToGame: { en: "All levels", bn: "সব লেভেল" },
  loadFailed: { en: "Could not load Mission 1. Please try again.", bn: "মিশন 1 লোড হয়নি। আবার চেষ্টা করুন।" },
  retry: { en: "Try again", bn: "আবার চেষ্টা করুন" },
} as const;

/** Double Duration (until 20 November 11:59 PM, Dhaka), the lock after Person Game 1, and payment approved. */
export const OFFER_UI = {
  name: { en: "Double Duration", bn: "ডাবল ডিউরেশন" },
  headline: { en: "90 days instead of 45", bn: "45 দিনের বদলে 90 দিন" },
  priceLine: (price: number): Bilingual => ({
    en: `Pay ৳${price} once. Normally 45 days, now 90.`,
    bn: `একবার ৳${price} দিন। সাধারণত 45 দিন, এখন 90 দিন।`,
  }),
  badgeLine: {
    en: "Plus a lifetime **Legacy Learner** badge on your profile.",
    bn: "সঙ্গে প্রোফাইলে চিরদিনের **Legacy Learner** ব্যাজ।",
  },
  startLine: {
    en: "Play the full Level 1 right away. Your 90 days are counted from 20 November.",
    bn: "এখনই পুরো লেভেল 1 খেলুন। আপনার 90 দিন গোনা হবে 20 নভেম্বর থেকে।",
  },
  deadline: (daysLeft: number): Bilingual =>
    daysLeft <= 1
      ? { en: "Last day · the offer ends tonight at 11:59 PM", bn: "আজই শেষ দিন · অফার শেষ রাত 11:59-এ" }
      : { en: `Offer ends on 20 November · ${daysLeft} days left`, bn: `অফার শেষ 20 নভেম্বর · আর ${daysLeft} দিন বাকি` },
  cta: { en: "Get Double Duration", bn: "ডাবল ডিউরেশন নিন" },
  notNow: { en: "Not now", bn: "এখন না" },

  standardHeadline: (price: number, days: number): Bilingual => ({ en: `৳${price} for ${days} days`, bn: `৳${price}-এ ${days} দিন` }),
  standardLine: (days: number): Bilingual => ({
    en: `Unlock all of Level 1, the Final Test and every new level. Your ${days} days start the day we approve your payment.`,
    bn: `পুরো লেভেল 1, ফাইনাল টেস্ট আর প্রতিটি নতুন লেভেল খুলুন। পেমেন্ট অনুমোদনের দিন থেকে আপনার ${days} দিন শুরু হবে।`,
  }),
  standardCta: { en: "Unlock the full game", bn: "পুরো গেম আনলক করুন" },
  legacyDeadline: {
    en: "Legacy Learner badge until 31 December",
    bn: "Legacy Learner ব্যাজ 31 ডিসেম্বর পর্যন্ত",
  },

  welcomeKicker: { en: "Your progress is saved", bn: "আপনার অগ্রগতি সেভ হয়েছে" },
  reminderKicker: { en: "You finished Number!", bn: "Number শেষ করেছেন!" },

  lockWonTitle: { en: "You won Person Game 1!", bn: "Person গেম 1 জিতেছেন!" },
  lockTitle: { en: "This part is in the full game", bn: "এই অংশটি পুরো গেমে আছে" },
  lockLine: {
    en: "Unlock the rest of Level 1, the Final Test and your certificate.",
    bn: "লেভেল 1-এর বাকি গেম, ফাইনাল টেস্ট আর সার্টিফিকেট খুলুন।",
  },
  payAndContinue: { en: "Pay and continue", bn: "পেমেন্ট করে চালিয়ে যান" },
  replayFree: { en: "Replay free games", bn: "ফ্রি গেম আবার খেলি" },

  approvedTitle: { en: "Payment approved!", bn: "পেমেন্ট অনুমোদিত হয়েছে!" },
  approvedLegacy: {
    en: "Welcome, Legacy Learner. Everything in Level 1 is open now.",
    bn: "স্বাগতম, Legacy Learner। লেভেল 1-এর সবকিছু এখন খোলা।",
  },
  approvedPlain: { en: "Everything in Level 1 is open now.", bn: "লেভেল 1-এর সবকিছু এখন খোলা।" },
  letsGo: { en: "Let's play", bn: "চলুন খেলি" },
} as const;

/** The permanent badge for v2 payments sent in 2026 and learners who paid before v2. */
export const LEGACY_BADGE = {
  name: "Legacy Learner",
  caption: { en: "Early Gamlish learner · 2026", bn: "Gamlish-এর শুরুর দিকের শিক্ষার্থী · 2026" },
} as const;

/** The one Legacy Learner message, shown wherever the badge is tapped. */
export const LEGACY_UI = {
  holderTitle: { en: "You are a Legacy Learner 👑", bn: "আপনি একজন Legacy Learner 👑" },
  pendingTitle: { en: "Legacy Learner (in progress) 👑", bn: "Legacy Learner (চলমান) 👑" },
  pendingLine: (date: string): Bilingual => ({
    en: `Finish all 21 levels of Fundamental English by ${date} to keep this badge forever. If you don't finish, the badge goes away.`,
    bn: `ব্যাজটি স্থায়ী করতে ${date}-এর মধ্যে Fundamental English-এর 21টি লেভেল শেষ করুন। শেষ না করলে ব্যাজটি চলে যাবে।`,
  }),
  offerTitle: { en: "Become a Legacy Learner 👑", bn: "Legacy Learner হোন 👑" },
  offerLine: {
    en: "Only until 31 December 2026. After that, this badge is gone for good.",
    bn: "শুধু 31 ডিসেম্বর 2026 পর্যন্ত। এরপর এই ব্যাজ আর কখনো পাওয়া যাবে না।",
  },
  infoTitle: { en: "What is Legacy Learner? 👑", bn: "Legacy Learner কী? 👑" },
  infoLine: {
    en: "A special badge for learners who joined Gamlish early and finish Fundamental English.",
    bn: "শুরুর দিকে Gamlish-এ যোগ দিয়ে Fundamental English শেষ করা শিক্ষার্থীদের বিশেষ ব্যাজ।",
  },
  closedLine: {
    en: "The Legacy Learner badge closed on 31 December 2026.",
    bn: "Legacy Learner ব্যাজ 31 ডিসেম্বর 2026-এ বন্ধ হয়ে গেছে।",
  },
  benefits: [
    {
      en: "Finish all 21 levels in time and keep the Legacy Learner badge on your profile forever",
      bn: "সব 21টি লেভেল সময়মতো শেষ করলে প্রোফাইলে চিরদিনের Legacy Learner ব্যাজ",
    },
    {
      en: "Every new Gamlish course free once: Reading, Listening, Speaking and Writing, always the latest version",
      bn: "Gamlish-এর প্রতিটি নতুন কোর্স একবার ফ্রি: Reading, Listening, Speaking আর Writing, সবসময় সর্বশেষ ভার্সন",
    },
    {
      en: "Each course is free for a fixed time from the day you start it",
      bn: "প্রতিটি কোর্স শুরুর দিন থেকে নির্দিষ্ট সময় পর্যন্ত ফ্রি",
    },
  ] as readonly Bilingual[],
  pay: { en: "Pay and become a Legacy Learner", bn: "পেমেন্ট করে Legacy Learner হোন" },
  getToo: { en: "Get it too", bn: "আপনিও নিন" },
  startFree: { en: "Start for free", bn: "ফ্রিতে শুরু করুন" },
  keepPlaying: { en: "Keep playing", bn: "খেলা চালিয়ে যান" },
  getBadge: { en: "Get Legacy Learner", bn: "Legacy Learner নিন" },
  close: { en: "Close", bn: "বন্ধ করুন" },
} as const;

const LEGACY_PERK: Bilingual = {
  en: "Legacy Learner badge on your profile, forever",
  bn: "আপনার প্রোফাইলে Legacy Learner ব্যাজ, সবসময়ের জন্য",
};

const HONEST_DOUBLE: Bilingual = {
  en: "Honest note: Gamlish v2 is still being built. Level 1 is ready now. Level 2 opens after 20 November, and new levels keep coming as we finish them.",
  bn: "সত্যি কথা: Gamlish v2 এখনো তৈরি হচ্ছে। লেভেল 1 এখন রেডি। লেভেল 2 খুলবে 20 নভেম্বরের পর, আর বাকি লেভেলগুলো তৈরি হলেই পেয়ে যাবেন।",
};
const HONEST_STANDARD: Bilingual = {
  en: "Honest note: Gamlish v2 is still being built. New levels arrive as we finish them, and your access includes every level we release.",
  bn: "সত্যি কথা: Gamlish v2 এখনো তৈরি হচ্ছে। নতুন লেভেল তৈরি হলেই আসবে, আর আপনার মেয়াদে যত লেভেল আসবে সব পাবেন।",
};

/** In-chat payment. `{name}` is filled per learner. Fixed price, no discounts. */
export const PAY_UI = {
  trialDone: {
    en: "{name}, you won **Person Game 1**! That was the free part: **Subject**, **Number** and the first Person game.",
    bn: "{name}, আপনি **Person গেম 1** জিতেছেন! ফ্রি অংশ এখানেই শেষ: **Subject**, **Number** আর Person-এর প্রথম গেম।",
  },
  hello: {
    en: "{name}, here is how to unlock the full game.",
    bn: "{name}, পুরো গেম কীভাবে আনলক করবেন, দেখে নিন।",
  },
  ifYouLike: {
    en: "Unlock the full game to keep going: the rest of **Person**, then **Verb, Object, Word Order** and the **Level 1 Final Test**.",
    bn: "পুরো গেম আনলক করে এগিয়ে চলুন: **Person**-এর বাকি অংশ, তারপর **Verb, Object, Word Order** আর **লেভেল 1 ফাইনাল টেস্ট**।",
  },
  priceTitle: (price: number, days: number): Bilingual => ({
    en: `${price} BDT · ${days} days`,
    bn: `${price} টাকা · ${days} দিন`,
  }),
  noDiscount: { en: "Fixed price · no discount", bn: "নির্ধারিত দাম · কোনো ছাড় নেই" },
  perks: [
    { en: "Every English grammar topic we release during your access", bn: "আপনার মেয়াদের মধ্যে আমরা যত ইংরেজি গ্রামার টপিক আনব, সব" },
    { en: "Ask us any English grammar question", bn: "ইংরেজি গ্রামার নিয়ে যেকোনো প্রশ্ন আমাদের করতে পারবেন" },
  ] as const,
  doublePerks: [OFFER_UI.startLine, LEGACY_PERK] as const,
  legacyPerk: LEGACY_PERK,
  honestNotes: [HONEST_DOUBLE, HONEST_STANDARD] as readonly Bilingual[],
  honest: (double: boolean): Bilingual => (double ? HONEST_DOUBLE : HONEST_STANDARD),
  urgency: {
    en: "Double Duration ends on 20 November at 11:59 PM. From 21 November, ৳1590 gets 45 days instead of 90.",
    bn: "ডাবল ডিউরেশন শেষ হবে 20 নভেম্বর রাত 11:59-এ। 21 নভেম্বর থেকে ৳1590-এ মিলবে 90 দিনের বদলে 45 দিন।",
  },
  legacyUrgency: {
    en: "The **Legacy Learner** badge is only for learners who join by 31 December 2026. From 1 January, it is gone for good.",
    bn: "**Legacy Learner** ব্যাজ শুধু 31 ডিসেম্বর 2026-এর মধ্যে যুক্ত হওয়া শিক্ষার্থীদের জন্য। 1 জানুয়ারি থেকে এটি আর পাওয়া যাবে না।",
  },
  askMethod: { en: "How would you like to pay?", bn: "কীভাবে পেমেন্ট করবেন?" },
  bkash: { en: "bKash", bn: "বিকাশ" },
  bank: { en: "Bank transfer (NPSB)", bn: "ব্যাংক ট্রান্সফার (NPSB)" },
  askUs: { en: "Ask us on WhatsApp", bn: "WhatsApp-এ জিজ্ঞেস করুন" },
  messageUs: { en: "Message us on WhatsApp", bn: "WhatsApp-এ মেসেজ দিন" },

  bkashSteps: (price: number): Bilingual => ({
    en: `Open bKash, choose **Send Money**, and send **${price} BDT** to this number:`,
    bn: `bKash অ্যাপে **Send Money** বেছে নিন, তারপর এই নম্বরে **${price} টাকা** পাঠান:`,
  }),
  bkashThen: {
    en: "Then type the bKash number you sent from and the **Transaction ID (TrxID)** from the bKash message.",
    bn: "তারপর যে bKash নম্বর থেকে পাঠিয়েছেন সেটি আর bKash মেসেজের **Transaction ID (TrxID)** লিখুন।",
  },
  bkashMissing: {
    en: "The bKash number is being updated. Please message us on WhatsApp and we will help you right away.",
    bn: "bKash নম্বরটি আপডেট হচ্ছে। WhatsApp-এ মেসেজ দিন, আমরা সাথে সাথে সাহায্য করব।",
  },
  senderLabel: { en: "Your bKash number", bn: "আপনার bKash নম্বর" },
  senderPlaceholder: { en: "01XXXXXXXXX", bn: "01XXXXXXXXX" },
  trxLabel: { en: "Transaction ID (TrxID)", bn: "Transaction ID (TrxID)" },
  trxPlaceholder: { en: "e.g. 9BD7XXXXXX", bn: "যেমন 9BD7XXXXXX" },
  badSender: { en: "Please enter a valid bKash number (01XXXXXXXXX).", bn: "সঠিক bKash নম্বর লিখুন (01XXXXXXXXX)।" },
  badTrx: { en: "Please enter the Transaction ID from the bKash message.", bn: "bKash মেসেজের Transaction ID লিখুন।" },

  bankSteps: (price: number): Bilingual => ({
    en: `Send **${price} BDT** from your bank app using **NPSB**. It arrives instantly, so we can unlock you faster. Tap any line to copy it.`,
    bn: `আপনার ব্যাংক অ্যাপ থেকে **NPSB** দিয়ে **${price} টাকা** পাঠান। NPSB-তে টাকা সাথে সাথে পৌঁছায়, তাই আমরা দ্রুত আনলক করতে পারি। যেকোনো লাইনে ট্যাপ করে কপি করুন।`,
  }),
  bankThen: {
    en: "Then upload a **screenshot** of the transfer. You can also write the sender's name or account number to help us find it.",
    bn: "তারপর ট্রান্সফারের একটি **স্ক্রিনশট** আপলোড করুন। চাইলে যে নাম বা অ্যাকাউন্ট থেকে পাঠিয়েছেন তা-ও লিখতে পারেন, এতে খুঁজে পেতে সুবিধা হবে।",
  },
  uploadProof: { en: "Upload screenshot", bn: "স্ক্রিনশট আপলোড করুন" },
  changeProof: { en: "Change screenshot", bn: "স্ক্রিনশট বদলান" },
  notePlaceholder: {
    en: "Sender name / account number (optional)",
    bn: "যে নাম / অ্যাকাউন্ট থেকে পাঠিয়েছেন (ঐচ্ছিক)",
  },
  needProof: { en: "Please upload the transfer screenshot.", bn: "ট্রান্সফারের স্ক্রিনশট আপলোড করুন।" },
  copied: { en: "Copied", bn: "কপি হয়েছে" },
  copy: { en: "Copy", bn: "কপি" },
  submit: { en: "Submit payment", bn: "পেমেন্ট সাবমিট করুন" },
  sending: { en: "Sending...", bn: "পাঠানো হচ্ছে..." },
  back: { en: "Back", bn: "ফিরে যান" },
  sendFailed: {
    en: "Could not send. Please check and try again, or message us on WhatsApp.",
    bn: "পাঠানো যায়নি। আবার চেষ্টা করুন, অথবা WhatsApp-এ মেসেজ দিন।",
  },

  sent: {
    en: "Thank you, {name}! We got your payment details. We check every payment by hand and unlock everything the moment the money arrives.",
    bn: "ধন্যবাদ, {name}! আপনার পেমেন্টের তথ্য পেয়েছি। আমরা প্রতিটি পেমেন্ট নিজে চেক করি, টাকা পৌঁছালেই সব আনলক করে দেব।",
  },
  pending: {
    en: "{name}, your payment is under review. We will unlock everything as soon as we confirm it. Questions? Message us on WhatsApp.",
    bn: "{name}, আপনার পেমেন্ট যাচাই করা হচ্ছে। নিশ্চিত হলেই সব আনলক করে দেব। কোনো প্রশ্ন থাকলে WhatsApp-এ মেসেজ দিন।",
  },
  rejected: (reason: string): Bilingual => ({
    en: `{name}, we could not confirm your last payment: ${reason} Please try again, or message us on WhatsApp.`,
    bn: `{name}, আপনার আগের পেমেন্টটি নিশ্চিত করা যায়নি: ${reason} আবার চেষ্টা করুন, অথবা WhatsApp-এ মেসেজ দিন।`,
  }),
  backToMap: { en: "Back to the map", bn: "ম্যাপে ফিরে যান" },
  pendingChip: { en: "Payment under review", bn: "পেমেন্ট যাচাই হচ্ছে" },

  freeHello: {
    en: "Good news, {name}! You supported Gamlish before, so Gamlish v2 is **free** for you.",
    bn: "সুখবর, {name}! আপনি আগে Gamlish কিনেছিলেন, তাই Gamlish v2 আপনার জন্য **ফ্রি**।",
  },
  freePrice: (price: number, days: number): Bilingual => ({
    en: `Our price is **${price} BDT**. You get **${days} days free**, plus the **Legacy Learner** badge.`,
    bn: `আমাদের দাম **${price} টাকা**। আপনি পাচ্ছেন **${days} দিন ফ্রি**, সাথে **Legacy Learner** ব্যাজ।`,
  }),
  claimFree: { en: "Unlock for free", bn: "ফ্রি আনলক করুন" },
  claimed: {
    en: "Unlocked, {name}! Everything in Level 1 is open now. Thank you for being with us from the start.",
    bn: "আনলক হয়ে গেছে, {name}! লেভেল 1-এর সবকিছু এখন খোলা। শুরু থেকে পাশে থাকার জন্য ধন্যবাদ।",
  },
  keepLearning: { en: "Keep learning", bn: "শেখা চালিয়ে যান" },
  badge: { en: LEGACY_BADGE.name, bn: LEGACY_BADGE.name },
  whatsAppMessage: "Hi Gamlish, I have a question about unlocking Gamlish v2.",
} as const;

/** BRAC Bank account for NPSB transfers, shown line by line with copy buttons. */
export const BANK_DETAILS: ReadonlyArray<{ label: Bilingual; value: string }> = [
  { label: { en: "Account number", bn: "অ্যাকাউন্ট নম্বর" }, value: "1082219640001" },
  { label: { en: "Account name", bn: "অ্যাকাউন্টের নাম" }, value: "MD. HABIBUR RAHMAN" },
  { label: { en: "Bank", bn: "ব্যাংক" }, value: "BRAC Bank PLC" },
  { label: { en: "Branch", bn: "শাখা" }, value: "SYLHET BRANCH" },
  { label: { en: "Routing number", bn: "রাউটিং নম্বর" }, value: "060913553" },
  { label: { en: "SWIFT code", bn: "SWIFT কোড" }, value: "BRAKBDDH" },
];

/** After the Level 1 Final Test: the path stops here until Level 2 is released. */
export const NEXT_LEVEL_UI = {
  title: { en: "{name}, Level 2 is on the way!", bn: "{name}, লেভেল 2 আসছে!" },
  titleNoName: { en: "Level 2 is on the way!", bn: "লেভেল 2 আসছে!" },
  body: {
    en: "You have finished Level 1. We are building Level 2 right now. As soon as it is ready, it opens here for you and we will let you know. Until then, practise any topic to keep it fresh.",
    bn: "আপনি লেভেল 1 শেষ করেছেন। আমরা এখন লেভেল 2 তৈরি করছি। রেডি হলেই এখানে আপনার জন্য খুলে যাবে, আর আমরা আপনাকে জানিয়ে দেব। ততক্ষণ যেকোনো টপিক অনুশীলন করে ঝালিয়ে নিন।",
  },
  tag: { en: "Level 2 · Coming soon", bn: "লেভেল 2 · শিগগিরই আসছে" },
  titleBeforeLaunch: { en: "Level 1 complete!", bn: "লেভেল 1 শেষ!" },
  bodyBeforeLaunch: {
    en: "Level 2 opens after 20 November. We'll tell you the moment it's ready. Until then, replay any topic to keep it fresh.",
    bn: "লেভেল 2 খুলবে 20 নভেম্বরের পর। তৈরি হলেই আপনাকে জানাব। ততক্ষণ যেকোনো টপিক আবার খেলে ঝালিয়ে নিন।",
  },
  tagBeforeLaunch: { en: "Level 2 · opens after 20 November", bn: "লেভেল 2 · খুলবে 20 নভেম্বরের পর" },
} as const;

/** The minimal /profile page: one card, then plan, login, help and log out. */
export const PROFILE_UI = {
  title: { en: "My profile", bn: "আমার প্রোফাইল" },
  levelLine: (level: number, stop: number, total: number): Bilingual => ({
    en: `Level ${level} · Stop ${stop} of ${total}`,
    bn: `লেভেল ${level} · ধাপ ${stop}/${total}`,
  }),
  keepLearning: { en: "Keep learning", bn: "শেখা চালিয়ে যান" },
  plan: { en: "My plan", bn: "আমার প্ল্যান" },
  planFree: { en: "Free", bn: "ফ্রি" },
  planPaid: { en: "Full access", bn: "পুরো অ্যাক্সেস" },
  planUntil: (date: string): Bilingual => ({ en: `Open until ${date}`, bn: `${date} পর্যন্ত খোলা` }),
  daysLeft: (n: number): Bilingual => ({ en: `${n} days left`, bn: `আর ${n} দিন বাকি` }),
  freePart: {
    en: "Subject, Number and Person Game 1 are free.",
    bn: "Subject, Number আর Person গেম 1 ফ্রি।",
  },
  login: { en: "Login & security", bn: "লগইন ও নিরাপত্তা" },
  accountName: { en: "Account name", bn: "অ্যাকাউন্টের নাম" },
  email: { en: "Email", bn: "ইমেইল" },
  mobile: { en: "Mobile", bn: "মোবাইল" },
  connected: { en: "Connected", bn: "কানেক্টেড" },
  notConnected: { en: "Not connected", bn: "নেই" },
  password: { en: "Password", bn: "পাসওয়ার্ড" },
  help: { en: "Help", bn: "সাহায্য" },
  helpSub: { en: "Message us on WhatsApp", bn: "WhatsApp-এ মেসেজ দিন" },
  logout: { en: "Log out", bn: "লগ আউট" },
  close: { en: "Close", bn: "বন্ধ করুন" },

  addPhone: { en: "Add mobile number", bn: "মোবাইল নম্বর যোগ করুন" },
  changePhone: { en: "Change number", bn: "নম্বর বদলান" },
  phoneHint: {
    en: "We send a 6-digit code by SMS to check it's yours.",
    bn: "নম্বরটি আপনার কি না দেখতে SMS-এ 6 সংখ্যার কোড পাঠাব।",
  },
  phonePlaceholder: { en: "01XXXXXXXXX", bn: "01XXXXXXXXX" },
  badPhone: { en: "Enter a valid number (01XXXXXXXXX).", bn: "সঠিক নম্বর লিখুন (01XXXXXXXXX)।" },
  sendCode: { en: "Send code", bn: "কোড পাঠান" },
  sending: { en: "Sending...", bn: "পাঠানো হচ্ছে..." },
  codeSent: (phone: string): Bilingual => ({ en: `Code sent to ${phone}`, bn: `${phone} নম্বরে কোড পাঠানো হয়েছে` }),
  codePlaceholder: { en: "6-digit code", bn: "6 সংখ্যার কোড" },
  verify: { en: "Verify", bn: "যাচাই করুন" },
  verifying: { en: "Checking...", bn: "যাচাই হচ্ছে..." },
  resendIn: (seconds: number): Bilingual => ({ en: `Resend in ${seconds}s`, bn: `${seconds} সেকেন্ড পর আবার পাঠান` }),
  resend: { en: "Send again", bn: "আবার পাঠান" },
  editNumber: { en: "Edit number", bn: "নম্বর বদলান" },
  phoneSaved: { en: "Mobile number verified!", bn: "মোবাইল নম্বর যাচাই হয়েছে!" },
  mergeNote: {
    en: "An empty Gamlish account already uses this number. Verifying moves the number here and removes that empty account.",
    bn: "এই নম্বরে একটি খালি Gamlish অ্যাকাউন্ট আছে। যাচাই করলে নম্বরটি এখানে আসবে আর খালি অ্যাকাউন্টটি মুছে যাবে।",
  },
} as const;

/** The public /u/<handle> page for learners of the new game. */
export const PUBLIC_UI = {
  learner: { en: "Gamlish learner", bn: "Gamlish শিক্ষার্থী" },
  joined: (date: string): Bilingual => ({ en: `Joined ${date}`, bn: `যোগ দিয়েছেন ${date}` }),
  levelTitle: { en: "Level 1 · English Fundamentals", bn: "লেভেল 1 · ইংরেজির ভিত্তি" },
  topicsDone: (done: number, total: number): Bilingual => ({ en: `${done} of ${total} done`, bn: `${total}টির মধ্যে ${done}টি শেষ` }),
  gamesWon: { en: "Games won", bn: "জেতা গেম" },
  streak: { en: "Day streak", bn: "টানা দিন" },
  finalTest: { en: "Final Test", bn: "ফাইনাল টেস্ট" },
  notYet: { en: "Not yet", bn: "এখনো নয়" },
  share: { en: "Share profile", bn: "প্রোফাইল শেয়ার করুন" },
  copied: { en: "Link copied!", bn: "লিংক কপি হয়েছে!" },
  clap: { en: "Clap", bn: "হাততালি" },
  claps: (n: number): Bilingual => ({ en: `${n} claps`, bn: `${n}টি হাততালি` }),
  loginToClap: { en: "Log in to clap", bn: "লগইন করে হাততালি দিন" },
  topicsLeft: (done: number, left: number): Bilingual => ({
    en: `${done} topics done · ${left} left`,
    bn: `${done}টি টপিক শেষ · ${left}টি বাকি`,
  }),
  levelTwoSoon: { en: "Level 2 · coming soon", bn: "লেভেল 2 · শিগগিরই আসছে" },
  v1Title: { en: "Gamlish v1 · Fundamental English", bn: "Gamlish v1 · Fundamental English" },
  v1Completed: { en: "Completed all 21 levels", bn: "21টি লেভেল সম্পূর্ণ করেছেন" },
  v1CompletedOn: (date: string): Bilingual => ({ en: `Completed on ${date}`, bn: `সম্পূর্ণ করেছেন ${date}` }),
  v1Progress: (done: number, total: number): Bilingual => ({
    en: `${done} of ${total} levels played`,
    bn: `${total}টির মধ্যে ${done}টি লেভেল খেলেছেন`,
  }),
  editProfile: { en: "Edit my profile", bn: "আমার প্রোফাইল বদলান" },
  playCta: { en: "Play Gamlish free", bn: "ফ্রিতে Gamlish খেলুন" },
  playCtaSub: {
    en: "Learn English grammar as a game. Level 1 starts easy.",
    bn: "খেলার ছলে ইংরেজি গ্রামার শিখুন। লেভেল 1 শুরু হয় সহজ দিয়ে।",
  },
  privateNote: { en: "This profile is private.", bn: "এই প্রোফাইলটি প্রাইভেট।" },
  shareText: (name: string): string => `${name} is learning English on Gamlish 🎮`,
} as const;

/** The /player home: Level 1 is open, Levels 2-21 are on the way. */
export const HOME_UI = {
  greetKnown: { en: "Welcome back, {name}!", bn: "{name}, আবার স্বাগতম!" },
  greetNew: { en: "Welcome to Gamlish!", bn: "Gamlish-এ আপনাকে স্বাগতম!" },
  sub: {
    en: "Learn English the fun way, one level at a time.",
    bn: "খেলার ছলে ইংরেজি শিখুন, এক লেভেল করে।",
  },
  levelOneTag: { en: "Level 1 · Camp 01", bn: "লেভেল 1 · ক্যাম্প 01" },
  start: { en: "Start Level 1", bn: "লেভেল 1 শুরু করুন" },
  continue: { en: "Continue", bn: "চালিয়ে যান" },
  review: { en: "Review Level 1", bn: "লেভেল 1 আবার দেখুন" },
  progress: (done: number, total: number): Bilingual => ({
    en: `${done} of ${total} done`,
    bn: `${total}টির মধ্যে ${done}টি সম্পন্ন`,
  }),
  nextLabel: { en: "Next lesson", bn: "পরের লেসন" },
  complete: { en: "Level 1 complete!", bn: "লেভেল 1 সম্পন্ন!" },
  freeStart: { en: "Free to start", bn: "ফ্রি শুরু" },
  comingSoon: { en: "Coming soon", bn: "শিগগিরই আসছে" },
  upcomingTitle: { en: "Levels 2-21", bn: "লেভেল 2-21" },
  camp: { en: "Camp", bn: "ক্যাম্প" },
  level: { en: "Level", bn: "লেভেল" },
} as const;
