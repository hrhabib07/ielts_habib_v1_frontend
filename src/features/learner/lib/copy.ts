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

  paywallTitle: { en: "{name}, the rest of Mission 1 is waiting!", bn: "{name}, মিশন 1-এর বাকি অংশ অপেক্ষা করছে!" },
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

/** In-chat payment after the free trial. `{name}` is filled per learner. Fixed price, no discounts. */
export const PAY_UI = {
  trialDone: {
    en: "{name}, you finished the free trial! You learned **Subject** and **Number**.",
    bn: "{name}, আপনি ফ্রি ট্রায়াল শেষ করেছেন! আপনি **Subject** আর **Number** শিখেছেন।",
  },
  ifYouLike: {
    en: "If you enjoyed it, unlock the full game to keep going. Next up: **Person, Verb, Object, Word Order** and the **Mission 1 Final Test**.",
    bn: "ভালো লাগলে পুরো গেমটি আনলক করে এগিয়ে চলুন। এরপর আছে **Person, Verb, Object, Word Order** আর **মিশন 1 ফাইনাল টেস্ট**।",
  },
  priceTitle: (price: number, days: number): Bilingual => ({
    en: `${price} BDT · ${days} days`,
    bn: `${price} টাকা · ${days} দিন`,
  }),
  noDiscount: { en: "Fixed price · no discount", bn: "নির্ধারিত দাম · কোনো ছাড় নেই" },
  perks: [
    { en: "Every English grammar topic we release during your access", bn: "আপনার মেয়াদের মধ্যে আমরা যত ইংরেজি গ্রামার টপিক আনব, সব" },
    { en: "Ask us any English grammar question", bn: "ইংরেজি গ্রামার নিয়ে যেকোনো প্রশ্ন আমাদের করতে পারবেন" },
    { en: "Early Adopter · Gamlish v2 badge on your profile, forever", bn: "আপনার প্রোফাইলে Early Adopter · Gamlish v2 ব্যাজ, সবসময়ের জন্য" },
  ] as const,
  honest: {
    en: "Honest note: Gamlish v2 is still being built. Level 1 is ready now, and new levels arrive as we finish them. We plan to finish within 45 days. If it takes longer, we add extra days for free.",
    bn: "সত্যি কথা: Gamlish v2 এখনো তৈরি হচ্ছে। লেভেল 1 এখন রেডি, বাকি লেভেলগুলো তৈরি হলেই আপনি পেয়ে যাবেন। আমরা 45 দিনের মধ্যে শেষ করার পরিকল্পনা করছি। এর বেশি সময় লাগলে আপনাকে বাড়তি দিন ফ্রি দেব।",
  },
  urgency: {
    en: "This offer is only for early learners. Later the price may go up, access will be shorter (around 45 days), and the Early Adopter badge will be gone.",
    bn: "এই অফার শুধু শুরুর দিকের শিক্ষার্থীদের জন্য। পরে দাম বাড়তে পারে, মেয়াদ কমে প্রায় 45 দিন হবে, আর Early Adopter ব্যাজ আর পাওয়া যাবে না।",
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
    en: `Our price is **${price} BDT**. You get **${days} days free**, plus the **Early Adopter · Gamlish v2** badge.`,
    bn: `আমাদের দাম **${price} টাকা**। আপনি পাচ্ছেন **${days} দিন ফ্রি**, সাথে **Early Adopter · Gamlish v2** ব্যাজ।`,
  }),
  claimFree: { en: "Unlock for free", bn: "ফ্রি আনলক করুন" },
  claimed: {
    en: "Unlocked, {name}! Everything in Level 1 is open now. Thank you for being with us from the start.",
    bn: "আনলক হয়ে গেছে, {name}! লেভেল 1-এর সবকিছু এখন খোলা। শুরু থেকে পাশে থাকার জন্য ধন্যবাদ।",
  },
  keepLearning: { en: "Keep learning", bn: "শেখা চালিয়ে যান" },
  badge: { en: "Early Adopter · Gamlish v2", bn: "Early Adopter · Gamlish v2" },
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
