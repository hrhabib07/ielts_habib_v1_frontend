import type { UiLocale } from "@/src/lib/ui-locale";

export interface UsernameFlowCopy {
  readonly loadError: string;
  readonly claimTitle: string;
  readonly yourTitle: string;
  readonly claimSub: string;
  readonly yourSub: string;
  readonly permanentBadge: string;
  readonly available: (name: string) => string;
  readonly rules: string;
  readonly takenFallback: string;
  readonly saveError: string;
  readonly claimCta: string;
  readonly waitPurchase: string;
  readonly saved: string;
  readonly pickVisibleHint: string;
  readonly suggestionsLabel: string;
  readonly continuePlaying: string;
  readonly goToPricing: string;
  readonly bannerClaimTitle: string;
  readonly bannerClaimBody: string;
  readonly bannerClaimFounderExtra: string;
  readonly bannerClaimCta: string;
  readonly bannerFounderTitle: (n: string) => string;
  readonly bannerPublicTitle: string;
  readonly bannerSharePrefix: string;
  readonly bannerFounderBody: string;
  readonly bannerPublicBody: string;
  readonly viewPublic: string;
  readonly foundersWall: string;
  readonly usernameAria: string;
}

function buildUsernameFlowCopy(locale: UiLocale): UsernameFlowCopy {
  if (locale === "bn") {
    return {
      loadError: "ইউজারনেম স্ট্যাটাস লোড করা যায়নি।",
      claimTitle: "আপনার ইউজারনেম নিন",
      yourTitle: "আপনার ইউজারনেম",
      claimSub:
        "একটা স্থায়ী, ইউনিক ইউজারনেম বাছুন। একবার সেভ হলে আর বদলানো যাবে না। Display name যেকোনো সময় বদলাতে পারবেন।",
      yourSub: "এটাই আপনার স্থায়ী পাবলিক প্রোফাইল লিংক। Display name আলাদা · প্রোফাইল থেকে যেকোনো সময় বদলান।",
      permanentBadge: "স্থায়ী  ·  বদলানো যাবে না",
      available: (name) => `@${name} পাওয়া যাচ্ছে।`,
      rules: "3-30 অক্ষর · ছোট হাতের ইংরেজি অক্ষর, সংখ্যা ও আন্ডারস্কোর।",
      takenFallback: "এই ইউজারনেম নেওয়া আছে।",
      saveError: "ইউজারনেম সেভ হয়নি। অন্যটা চেষ্টা করুন।",
      claimCta: "ইউজারনেম নিন",
      waitPurchase:
        "কেনাকাটা অনুমোদন হলেই স্থায়ী ইউজারনেম বাছতে পারবেন। এখনো অনুমোদন হয়নি হলে Pricing পেজে যান।",
      saved: "সেভ হয়েছে! আপনার পাবলিক প্রোফাইল লাইভ।",
      pickVisibleHint: "নিচের অপশনগুলো থেকে একটা বেছে নিন  ·  অথবা নিজে লিখুন",
      suggestionsLabel: "প্রস্তাবিত ইউজারনেম · ট্যাপ করে বাছুন",
      continuePlaying: "খেলায় ফিরে যান",
      goToPricing: "Pricing-এ যান",
      bannerClaimTitle: "স্থায়ী ইউজারনেম নিন",
      bannerClaimBody:
        "কেনাকাটা অনুমোদিত। পাবলিক প্রোফাইলের জন্য ইউনিক ইউজারনেম বাছুন  ·  একবার সেভ হলে লক। Display name পরেও বদলাতে পারবেন।",
      bannerClaimFounderExtra: " Founder হলে সেই প্রোফাইলে স্থায়ী ব্যাজও থাকবে।",
      bannerClaimCta: "ইউজারনেম বাছুন",
      bannerFounderTitle: (n) => `আপনি Founder #${n}`,
      bannerPublicTitle: "আপনার পাবলিক Gamlish প্রোফাইল",
      bannerSharePrefix: "শেয়ার করুন",
      bannerFounderBody: "  ·  এখানেই Founder ব্যাজ, টিয়ার ও প্রগ্রেস।",
      bannerPublicBody: "  ·  লেভেল, XP, স্ট্রিক, মিশন কার্ড ও অ্যাচিভমেন্ট।",
      viewPublic: "পাবলিক প্রোফাইল দেখুন",
      foundersWall: "Founders' Wall",
      usernameAria: "ইউজারনেম",
    };
  }

  return {
    loadError: "Could not load your username status.",
    claimTitle: "Claim your username",
    yourTitle: "Your username",
    claimSub:
      "Pick a permanent, unique username. Once saved it cannot be changed. You can still edit your display name anytime on Profile.",
    yourSub:
      "This is your permanent public profile link. Display name is separate · edit it anytime on Profile.",
    permanentBadge: "Permanent · cannot be changed",
    available: (name) => `@${name} is available.`,
    rules: "3-30 characters · lowercase letters, numbers and underscores.",
    takenFallback: "This username is taken.",
    saveError: "Could not save this username. Try another one.",
    claimCta: "Claim username",
    waitPurchase:
      "You can choose your permanent username once your purchase is approved. If it is still pending, go to Pricing.",
    saved: "Saved! Your public profile is live.",
    pickVisibleHint: "Tap a suggestion below · or type your own",
    suggestionsLabel: "Suggested usernames · tap to pick",
    continuePlaying: "Back to playing",
    goToPricing: "Go to Pricing",
    bannerClaimTitle: "Claim your permanent username",
    bannerClaimBody:
      "Your purchase is approved. Choose a unique username for your public profile · once saved it locks forever. Display name can still be edited anytime.",
    bannerClaimFounderExtra:
      " Founders get a permanent badge on that profile too.",
    bannerClaimCta: "Choose username",
    bannerFounderTitle: (n) => `You're Founder #${n}`,
    bannerPublicTitle: "Your public Gamlish profile",
    bannerSharePrefix: "Share",
    bannerFounderBody: " · your Founder badge, tier, and progress live there.",
    bannerPublicBody: " · level, XP, streak, mission cards, and achievements.",
    viewPublic: "View public profile",
    foundersWall: "Founders' Wall",
    usernameAria: "Username",
  };
}

export const USERNAME_FLOW_COPY: Record<UiLocale, UsernameFlowCopy> = {
  bn: buildUsernameFlowCopy("bn"),
  en: buildUsernameFlowCopy("en"),
};
