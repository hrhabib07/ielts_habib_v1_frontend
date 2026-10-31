import type { Bilingual } from "@/src/features/chat-lesson/types";
import type { Diagnosis, NumberKey, PersonKey } from "@/src/features/playground/types";

export const PERSON_KEYS: readonly PersonKey[] = ["first", "second", "third"];
export const NUMBER_KEYS: readonly NumberKey[] = ["singular", "plural"];

export const PERSON_LABEL: Record<PersonKey, Bilingual> = {
  first: { en: "First Person", bn: "First Person" },
  second: { en: "Second Person", bn: "Second Person" },
  third: { en: "Third Person", bn: "Third Person" },
};

export const PERSON_SHORT: Record<PersonKey, string> = { first: "First", second: "Second", third: "Third" };

export const PERSON_SUB: Record<PersonKey, Bilingual> = {
  first: { en: "the speaker (I, We)", bn: "যে বলছে (I, We)" },
  second: { en: "the listener (You)", bn: "যাকে বলা হচ্ছে (You)" },
  third: { en: "someone or something else", bn: "যাকে বা যা নিয়ে বলা হচ্ছে" },
};

export const NUMBER_LABEL: Record<NumberKey, string> = { singular: "Singular", plural: "Plural" };

export const NUMBER_SUB: Record<NumberKey, Bilingual> = {
  singular: { en: "one", bn: "একজন বা একটি" },
  plural: { en: "more than one", bn: "একাধিক" },
};

export const codeLabel = (number: NumberKey, person: PersonKey): string =>
  `${NUMBER_LABEL[number]} · ${PERSON_SHORT[person]}`;

export const DIAGNOSIS_LABEL: Record<Diagnosis, Bilingual> = {
  order: { en: "Wrong order", bn: "শব্দের ক্রম ভুল" },
  verb: { en: "Missing Verb", bn: "Verb নেই" },
  form: { en: "Wrong word form", bn: "শব্দের রূপ ভুল" },
  extra: { en: "Extra word", bn: "বাড়তি শব্দ" },
};

export const DIAGNOSIS_KEYS: readonly Diagnosis[] = ["order", "verb", "form", "extra"];

export const M1_UI = {
  to: (name: string): Bilingual => ({ en: `to ${name}`, bn: `${name}-কে` }),
  whichPerson: { en: "Which Person is the highlighted part?", bn: "হাইলাইট করা অংশটি কোন Person?" },
  personHint: {
    en: "Ask: is it the sender (I, We), the person they write to (You), or someone else?",
    bn: "ভাবুন: এটা কি যে লিখছে (I, We), যাকে লিখছে (You), নাকি অন্য কেউ?",
  },
  swapHint: {
    en: "Boy or man: He. Girl or woman: She. One thing: It. More than one: They. With I inside: We.",
    bn: "ছেলে বা পুরুষ: He। মেয়ে বা মহিলা: She। একটি বস্তু: It। একাধিক: They। ভেতরে I থাকলে: We।",
  },
  respectHint: {
    en: "আপনি, তুমি, তুই are always You. সে, তিনি, উনি become He or She.",
    bn: "আপনি, তুমি, তুই সবসময় You। সে, তিনি, উনি হয় He অথবা She।",
  },
  teamStepPerson: { en: "Step 1 of 2 · Which Person?", bn: "ধাপ ১/২ · কোন Person?" },
  teamStepWord: { en: "Step 2 of 2 · One word for the team", bn: "ধাপ ২/২ · দলের জন্য এক শব্দ" },
  teamRule: {
    en: "Check for I first (First Person). No I, but You? Second Person. Neither? Third Person.",
    bn: "আগে I খুঁজুন (First Person)। I নেই কিন্তু You আছে? Second Person। কোনোটাই নেই? Third Person।",
  },
  dropInBox: { en: "Tap the right box", bn: "সঠিক বাক্সে ট্যাপ করুন" },
  sixBoxHint: {
    en: "Two clues: one or more than one? Speaker, listener, or someone else?",
    bn: "দুটি সূত্র: একজন, নাকি একাধিক? যে বলছে, যাকে বলা হচ্ছে, নাকি অন্য কেউ?",
  },
  lockStepSubject: { en: "Step 1 of 2 · Tap every part of the Subject", bn: "ধাপ ১/২ · Subject-এর সব অংশে ট্যাপ করুন" },
  lockStepWheels: { en: "Step 2 of 2 · Set both wheels", bn: "ধাপ ২/২ · দুটি চাকাই ঘোরান" },
  lockConfirm: { en: "This is the Subject", bn: "এটাই Subject" },
  lockTooShort: {
    en: "Not the whole Subject yet. Ask: Who or what? Take every word of the answer.",
    bn: "পুরো Subject এখনো হয়নি। প্রশ্ন করুন: কে বা কী? উত্তরের সব শব্দ নিন।",
  },
  lockTooLong: {
    en: "Too much! The Subject stops before the Verb.",
    bn: "বেশি হয়ে গেছে! Subject থামে Verb-এর আগে।",
  },
  lockWrongPart: {
    en: "That is not the Subject. Ask: Who or what does the action?",
    bn: "এটা Subject নয়। প্রশ্ন করুন: কাজটি কে বা কী করে?",
  },
  numberWheel: { en: "Number", bn: "Number" },
  personWheel: { en: "Person", bn: "Person" },
  oddPick: { en: "Tap the odd one", bn: "যেটি আলাদা, সেটিতে ট্যাপ করুন" },
  oddHint: {
    en: "Decode all four: one or more? Speaker, listener, or someone else?",
    bn: "চারটিই চিহ্নিত করুন: একজন, নাকি একাধিক? যে বলছে, যাকে বলা হচ্ছে, নাকি অন্য কেউ?",
  },
  buildEmpty: { en: "Tap the tiles to build the Subject", bn: "টাইলে ট্যাপ করে Subject তৈরি করুন" },
  canHelp: "can help.",
  spotlightHint: {
    en: "Find the action. Ask: What does the Subject do? (Or is it am, is, are?)",
    bn: "কাজটি খুঁজুন। প্রশ্ন করুন: Subject কী করে? (নাকি am, is, are?)",
  },
  bridgeHint: {
    en: "I → am. One person or thing → is. You and more than one → are.",
    bn: "I → am। একজন বা একটি → is। You এবং একাধিক → are।",
  },
  looksCorrect: { en: "Looks correct ✓", bn: "ঠিক আছে ✓" },
  binTap: { en: "Tap the extra word, or say it looks correct", bn: "বাড়তি শব্দে ট্যাপ করুন, অথবা বলুন সব ঠিক আছে" },
  binNotExtra: {
    en: "That word is needed. Look for an extra do or make.",
    bn: "এই শব্দটি দরকার। বাড়তি do বা make খুঁজুন।",
  },
  binHasExtra: {
    en: "One word is extra. Bangla করা is not do!",
    bn: "একটি শব্দ বাড়তি। বাংলা “করা” মানে do নয়!",
  },
  binIsCorrect: {
    en: "This sentence is already correct. Every word is needed.",
    bn: "বাক্যটি আগে থেকেই সঠিক। প্রতিটি শব্দ দরকার।",
  },
  typeVerb: { en: "type the Verb", bn: "Verb লিখুন" },
  cameraNoS: {
    en: "With I, We, You or They, no -s is needed. Just the plain word.",
    bn: "I, We, You বা They-এর সঙ্গে -s লাগে না। শুধু মূল শব্দটি লিখুন।",
  },
  cameraOneWord: { en: "One action word only. No do.", bn: "শুধু একটি কাজের শব্দ। do লাগবে না।" },
  cameraLook: { en: "Look at the picture again. What is happening?", bn: "ছবিটা আবার দেখুন। কী হচ্ছে?" },
  passStepAsk: { en: "Step 1 of 2 · What, Whom, or no Object?", bn: "ধাপ ১/২ · কী, কাকে, নাকি Object নেই?" },
  passStepCatch: { en: "Step 2 of 2 · Tap the catcher (the Object)", bn: "ধাপ ২/২ · যে ধরছে (Object), তাতে ট্যাপ করুন" },
  askWhat: { en: "What?", bn: "What? (কী?)" },
  askWhom: { en: "Whom?", bn: "Whom? (কাকে?)" },
  askNone: { en: "No Object", bn: "Object নেই" },
  passAskHint: {
    en: "Is the Object a thing (What?), a person (Whom?), or does nothing receive the action?",
    bn: "Object কি কোনো জিনিস (What?), কোনো মানুষ (Whom?), নাকি কাজটি কারও ওপর হচ্ছে না?",
  },
  passCatchHint: {
    en: "The Object comes after the Verb. Ask the question after the Verb.",
    bn: "Object বসে Verb-এর পরে। Verb-এর পরে প্রশ্নটি করুন।",
  },
  basketObject: { en: "Object", bn: "Object" },
  basketObjectSub: { en: "receives the action", bn: "কাজটি যার ওপর হয়" },
  basketPlace: { en: "Place", bn: "স্থান" },
  basketPlaceSub: { en: "tells where", bn: "কোথায়, তা বলে" },
  placeHint: {
    en: "in, at, on, to usually start a place. Ask: what? or where?",
    bn: "in, at, on, to দিয়ে সাধারণত স্থান শুরু হয়। প্রশ্ন করুন: কী? নাকি কোথায়?",
  },
  mirrorBefore: { en: "Before the Verb", bn: "Verb-এর আগে" },
  mirrorAfter: { en: "After the Verb", bn: "Verb-এর পরে" },
  mirrorHintSubject: {
    en: "The blank is before the Verb, so it is the Subject: I, he, she, we, they.",
    bn: "শূন্যস্থানটি Verb-এর আগে, তাই এটি Subject: I, he, she, we, they।",
  },
  mirrorHintObject: {
    en: "The blank is after the Verb, so it is the Object: me, him, her, us, them.",
    bn: "শূন্যস্থানটি Verb-এর পরে, তাই এটি Object: me, him, her, us, them।",
  },
  completeStep: { en: "Step 1 of 2 · Complete, or needs an Object?", bn: "ধাপ ১/২ · সম্পূর্ণ, নাকি Object লাগবে?" },
  completeStepPick: { en: "Step 2 of 2 · Pick the Object", bn: "ধাপ ২/২ · Object বেছে নিন" },
  completeYes: { en: "Complete ✓", bn: "সম্পূর্ণ ✓" },
  completeNeeds: { en: "Needs an Object", bn: "Object লাগবে" },
  completeNeedsHint: {
    en: "Ask what? after the Verb. If there must be an answer, it needs an Object.",
    bn: "Verb-এর পরে “কী?” প্রশ্ন করুন। উত্তর থাকতেই হলে Object লাগবে।",
  },
  completeIsHint: {
    en: "This action does not need to happen to anything. The sentence is already complete.",
    bn: "এই কাজটি কারও ওপর হওয়ার দরকার নেই। বাক্যটি আগে থেকেই সম্পূর্ণ।",
  },
  completePickHint: {
    en: "The Object answers what? or whom?, not where or when.",
    bn: "Object উত্তর দেয় “কী?” বা “কাকে?”, কোথায় বা কখন নয়।",
  },
  flipHelp: {
    en: "Tap a tile to pick it up, then tap a gap to drop it.",
    bn: "একটি টাইলে ট্যাপ করে তুলুন, তারপর ফাঁকা জায়গায় ট্যাপ করে বসান।",
  },
  flipHint: {
    en: "In English the Verb comes right after the Subject.",
    bn: "ইংরেজিতে Verb বসে Subject-এর ঠিক পরে।",
  },
  roleSubject: "Subject",
  roleVerb: "Verb",
  roleObject: "Object",
  growHelp: { en: "Tap the details in the right order", bn: "তথ্যগুলো সঠিক ক্রমে ট্যাপ করুন" },
  growHint: {
    en: "English puts the place first, then the time.",
    bn: "ইংরেজিতে আগে স্থান, তারপর সময়।",
  },
  placeTag: { en: "place", bn: "স্থান" },
  timeTag: { en: "time", bn: "সময়" },
  doctorStepDiagnose: { en: "Step 1 of 2 · What is the problem?", bn: "ধাপ ১/২ · সমস্যা কী?" },
  doctorStepCure: { en: "Step 2 of 2 · Pick the cure", bn: "ধাপ ২/২ · সঠিক বাক্যটি বেছে নিন" },
  doctorDiagnoseHint: {
    en: "Check: Is the order Subject + Verb + Object? Is there a Verb? Is a word in the wrong form? Is a word extra?",
    bn: "যাচাই করুন: ক্রম কি Subject + Verb + Object? Verb আছে কি? কোনো শব্দের রূপ ভুল? কোনো শব্দ বাড়তি?",
  },
  doctorCureHint: { en: "Pick the sentence that fixes exactly that problem.", bn: "যে বাক্যটি ঠিক ওই সমস্যাটি সারায়, সেটি বেছে নিন।" },
  patient: { en: "Patient", bn: "রোগী" },
  diaryType: { en: "type the English sentence", bn: "ইংরেজি বাক্যটি লিখুন" },
  diaryTiles: { en: "Tap the words in order", bn: "শব্দগুলো ক্রমমতো ট্যাপ করুন" },
  diaryClear: { en: "Clear", bn: "মুছে ফেলুন" },
  myDay: { en: "My Day", bn: "আমার দিন" },
  answerIs: (answer: string): Bilingual => ({ en: `The answer is **${answer}**.`, bn: `উত্তর হলো **${answer}**।` }),
} as const;
