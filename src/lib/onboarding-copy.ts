import type { UiLocale } from "@/src/lib/ui-locale";

export type OnboardingMigrationReasonKey = "missingUsername" | "sameCountries";

export interface OnboardingCopy {
  readonly loading: string;
  readonly welcomeTitle: string;
  readonly migrateTitle: string;
  readonly welcomeSubEnglish: string;
  readonly welcomeSubReading: string;
  readonly migrateSub: string;
  /** Extra guidance under the subtitle — especially helpful for Bangla speakers. */
  readonly welcomeTips: readonly string[];
  readonly migrateWhyTitle: string;
  readonly migrationReasons: Record<OnboardingMigrationReasonKey, string>;
  readonly nicknameLabel: string;
  readonly nicknamePlaceholder: string;
  readonly nicknameHelp: string;
  readonly emailLabel: string;
  readonly emailReadonlyHint: string;
  readonly usernameLabel: string;
  readonly usernamePlaceholder: string;
  readonly displayNameLabel: string;
  readonly displayNamePlaceholder: string;
  readonly currentCountryLabel: string;
  readonly currentCountryPlaceholder: string;
  readonly dreamCountryLabel: string;
  readonly dreamCountryPlaceholder: string;
  readonly sameCountryWarning: string;
  readonly bandTitle: string;
  readonly bandHelp: string;
  readonly bandAria: string;
  readonly submitPlaying: string;
  readonly submitReading: string;
  readonly submitMigrate: string;
  readonly submitting: string;
  readonly errLoad: string;
  readonly errNicknameRequired: string;
  readonly errNicknameSave: string;
  readonly errGeneric: string;
  readonly errUsernameFormat: string;
  readonly errDisplayName: string;
  readonly errUsernameTaken: string;
  readonly errUsernameChecking: string;
  readonly errUsernameVerify: string;
  readonly errCompleteFields: string;
  readonly errProfileIncomplete: string;
}

function buildOnboardingCopy(locale: UiLocale): OnboardingCopy {
  if (locale === "bn") {
    return {
      loading: "লোড হচ্ছে…",
      welcomeTitle: "Gamlish-এ স্বাগতম",
      migrateTitle: "প্রোফাইল আপডেট করুন",
      welcomeSubEnglish:
        "একটা ডাকনাম দিন — তারপরই Mission 01 শুরু। ইউজারনেম লাগবে না।",
      welcomeSubReading:
        "প্রোফাইল সেট করুন, তারপর সরাসরি Reading-এ ঢুকুন।",
      migrateSub: "চালিয়ে যেতে আরও কয়েকটা তথ্য দরকার।",
      welcomeTips: [
        "ডাকনাম = গেইমে আপনাকে যে নামে দেখাবে (যেমন: তানভীর)। পরে প্রোফাইল থেকে বদলাতে পারবেন।",
        "ইমেইল বদলানো যায় না — এটাই আপনার লগইন পরিচয়।",
        "পরের ধাপ: হোমে গিয়ে Mission 01 খেলুন। ভিডিও দেখে প্রশ্ন উত্তর দিন।",
      ],
      migrateWhyTitle: "কেন জিজ্ঞাসা করছি",
      migrationReasons: {
        missingUsername:
          "স্থায়ী ইউজারনেম দরকার। এতে আপনার পাবলিক প্রোফাইল লিংক তৈরি হয়, পরে বদলানো যায় না।",
        sameCountries:
          "বর্তমান দেশ আর স্বপ্নের দেশ একই। জার্নি ম্যাপ ঠিকমতো কাজ করতে দুটো আলাদা দেশ বাছুন।",
      },
      nicknameLabel: "ডাকনাম",
      nicknamePlaceholder: "আপনাকে কী নামে ডাকব?",
      nicknameHelp:
        "হোম স্ক্রিন ও গেইমে এই নাম দেখাবে। পরে প্রোফাইল সেটিংস থেকে বদলাতে পারবেন।",
      emailLabel: "ইমেইল",
      emailReadonlyHint: "লগইনের জন্য ব্যবহৃত — এখানে বদলানো যায় না।",
      usernameLabel: "ইউজারনেম",
      usernamePlaceholder: "your_handle",
      displayNameLabel: "ডিসপ্লে নাম",
      displayNamePlaceholder: "অন্যরা যেভাবে দেখবে",
      currentCountryLabel: "বর্তমান দেশ",
      currentCountryPlaceholder: "এখন কোথায় থাকেন",
      dreamCountryLabel: "স্বপ্নের দেশ",
      dreamCountryPlaceholder: "কোথায় পড়তে চান",
      sameCountryWarning:
        "সেরা অভিজ্ঞতার জন্য দুটো আলাদা দেশ বেছে নিন।",
      bandTitle: "কাঙ্ক্ষিত IELTS ব্যান্ড স্কোর",
      bandHelp: "যে ব্যান্ড টার্গেট করছেন সেটা বাছুন। ডিফল্ট ৬.৫।",
      bandAria: "ব্যান্ড স্কোর অপশন",
      submitPlaying: "খেলা শুরু করুন",
      submitReading: "Reading যাত্রা শুরু করুন",
      submitMigrate: "সেভ করে চালিয়ে যান",
      submitting: "সেভ হচ্ছে…",
      errLoad: "অ্যাকাউন্ট লোড করা যায়নি।",
      errNicknameRequired: "দয়া করে একটা ডাকনাম লিখুন।",
      errNicknameSave: "ডাকনাম সেভ হয়নি। আবার চেষ্টা করুন।",
      errGeneric: "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
      errUsernameFormat:
        "ইউজারনেম বাছুন (৩–৩০ অক্ষর: ইংরেজি অক্ষর, সংখ্যা, আন্ডারস্কোর)।",
      errDisplayName: "ডিসপ্লে নাম আবশ্যক।",
      errUsernameTaken: "এই ইউজারনেম ইতিমধ্যে নেওয়া। অন্যটা বাছুন।",
      errUsernameChecking: "ইউজারনেম চেক হচ্ছে। একটু পর আবার চেষ্টা করুন।",
      errUsernameVerify: "ইউজারনেম যাচাই করা যায়নি। আবার চেষ্টা করুন।",
      errCompleteFields: "সব ঘর পূরণ করুন।",
      errProfileIncomplete:
        "প্রোফাইল সেভ হয়েছে কিন্তু কিছু এখনও বাদ। পেজ রিফ্রেশ করুন বা সাপোর্টে যোগাযোগ করুন।",
    };
  }

  return {
    loading: "Loading…",
    welcomeTitle: "Welcome to Gamlish",
    migrateTitle: "Update your profile",
    welcomeSubEnglish:
      "Pick a nickname and jump into Mission 01. No username needed.",
    welcomeSubReading: "Set up your profile, then you're straight into Reading.",
    migrateSub: "We need a few details before you can continue.",
    welcomeTips: [
      "Nickname = the name shown in the game (e.g. Tanvir). You can change it later in profile.",
      "Email cannot be changed here — it is your login identity.",
      "Next: go home and play Mission 01 — watch the video, then answer questions.",
    ],
    migrateWhyTitle: "Why we're asking",
    migrationReasons: {
      missingUsername:
        "You need a permanent username. It powers your public profile link and cannot be changed later.",
      sameCountries:
        "Your current country and dream country are the same. Pick two different countries so your journey map works correctly.",
    },
    nicknameLabel: "Nickname",
    nicknamePlaceholder: "What should we call you?",
    nicknameHelp:
      "Shown on your home screen and in the game. You can change it later in profile settings.",
    emailLabel: "Email",
    emailReadonlyHint: "Used for login — cannot be changed here.",
    usernameLabel: "Username",
    usernamePlaceholder: "your_handle",
    displayNameLabel: "Display name",
    displayNamePlaceholder: "How others see you",
    currentCountryLabel: "Current country",
    currentCountryPlaceholder: "Where you live now",
    dreamCountryLabel: "Dream country",
    dreamCountryPlaceholder: "Where you want to study",
    sameCountryWarning:
      "Please set two different countries to get the best experience.",
    bandTitle: "Desired IELTS band score",
    bandHelp: "Pick the band you're aiming for. Default is 6.5.",
    bandAria: "Band score options",
    submitPlaying: "Start playing",
    submitReading: "Start my Reading journey",
    submitMigrate: "Save and continue",
    submitting: "Saving…",
    errLoad: "Failed to load your account.",
    errNicknameRequired: "Please enter a nickname.",
    errNicknameSave: "Could not save your nickname. Please try again.",
    errGeneric: "Something went wrong. Please try again.",
    errUsernameFormat:
      "Choose a username (3–30 characters: letters, numbers, underscores).",
    errDisplayName: "Display name is required.",
    errUsernameTaken: "This username is already taken. Please choose another.",
    errUsernameChecking:
      "Still checking username availability. Try again in a moment.",
    errUsernameVerify: "Could not verify username. Please try again.",
    errCompleteFields: "Please complete every field.",
    errProfileIncomplete:
      "Profile saved but something is still missing. Refresh the page or contact support if this continues.",
  };
}

export const ONBOARDING_COPY: Record<UiLocale, OnboardingCopy> = {
  bn: buildOnboardingCopy("bn"),
  en: buildOnboardingCopy("en"),
};

export function resolveOnboardingMigrationReasons(
  keys: readonly OnboardingMigrationReasonKey[],
  locale: UiLocale,
): string[] {
  const copy = ONBOARDING_COPY[locale];
  return keys.map((key) => copy.migrationReasons[key]);
}
