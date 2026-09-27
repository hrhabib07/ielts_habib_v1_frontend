import type { PublicPricing } from "@/src/lib/api/pricing";
import {
  JOURNEY_LIST_PRICE_BDT,
  JOURNEY_OFFER_PRICE_BDT,
} from "@/src/lib/journey-prices";
import type { UiLocale } from "@/src/lib/ui-locale";
import { localizeDigits } from "@/src/lib/ui-locale";
import {
  PLAYERS_PLAYING_PROOF_FLOOR,
  resolvePlayersPlayingCount,
} from "@/src/lib/demo-social-proof";

export const LIFETIME_PAID_PROOF_FLOOR = 40;

/** One sentence for every page. Do not rewrite this in local copy files. */
export function lifetimePaidProofLine(locale: UiLocale): string {
  const floor = localizeDigits(LIFETIME_PAID_PROOF_FLOOR, locale);
  return locale === "bn"
    ? `${floor}+ শিক্ষার্থী ইতিমধ্যে ফুল জার্নির জন্য পেমেন্ট করেছেন।`
    : `${LIFETIME_PAID_PROOF_FLOOR}+ learners have already paid for the full journey.`;
}

/** Live registered players. Pass the real student count from /demo/stats. */
export function playersPlayingProofLine(
  registeredStudents: number | null | undefined,
  locale: UiLocale,
): string {
  const count = resolvePlayersPlayingCount(
    registeredStudents,
    PLAYERS_PLAYING_PROOF_FLOOR,
  );
  const label = localizeDigits(count, locale);
  return locale === "bn"
    ? `${label}+ জন শিক্ষার্থী ইতিমধ্যে এই গেম খেলা শুরু করেছে। আপনিও এখনই শুরু করুন।`
    : `${count}+ students have already started playing this game. Start now.`;
}

export function monthLabelFromPricing(
  pricing: PublicPricing | null,
  locale: UiLocale,
): string | null {
  const campaign = pricing?.monthlyCampaign;
  if (!campaign) return null;
  return locale === "bn" ? campaign.monthLabelBn : campaign.monthLabelEn;
}

export function monthlyOfferCopy(locale: UiLocale) {
  return {
    winningEyebrow:
      locale === "bn" ? "আজকের জয়ের অফার" : "Today's winning offer",
    limitedBadge: locale === "bn" ? "এই মাসের বিশেষ অফার" : "This month's special offer",
    onePayment: locale === "bn" ? "একবারের পেমেন্ট" : "one payment",
    lifetimePaid: () => lifetimePaidProofLine(locale),
    firstHundred: (month: string | null) =>
      locale === "bn"
        ? `${month ?? "এই"} মাসের প্রথম ${localizeDigits(100, locale)} জন পেইড শিক্ষার্থীর জন্য।`
        : `For the first 100 paid learners of ${month ?? "this month"}.`,
    seatMeter: (filled: number, cap: number) =>
      locale === "bn"
        ? `এই মাসে ${localizeDigits(filled, locale)} জন / ${localizeDigits(cap, locale)} জন`
        : `${filled} of ${cap} this month`,
    seatMeterHint:
      locale === "bn"
        ? "প্রথম 100 জনের সেরা মূল্য শেষ হয়ে যাচ্ছে।"
        : "The best price for the first 100 is filling up.",
    closedTitle: (month: string | null) => {
      if (locale === "bn") {
        return `${month ?? "এই"} মাসের প্রথম ${localizeDigits(100, locale)} জনের 290 টাকার অফার সম্পন্ন`;
      }
      return month
        ? `${month}'s first 100 at 290 BDT are complete`
        : "This month's first 100 at 290 BDT are complete";
    },
    closedBody: (offerLabel: string, listLabel: string) =>
      locale === "bn"
        ? `এখনো বিশেষ অফারে যোগ দিতে পারেন: ${listLabel}-এর বদলে ${offerLabel}।`
        : `You can still join today for ${offerLabel} instead of ${listLabel}.`,
    closedSoft:
      locale === "bn"
        ? "Gamlish বড় হলে বিশেষ অফার বদলাতে পারে।"
        : "Special offers may change as Gamlish grows.",
    saveWin: (saveLabel: string) =>
      locale === "bn" ? `বাঁচবে ${saveLabel}` : `You save ${saveLabel}`,
    joinNow: locale === "bn" ? "আজই যোগ দিন" : "Join now",
    priceWas: locale === "bn" ? "রেগুলার" : "Regular",
    priceNow: locale === "bn" ? "এখন" : "Now",
  } as const;
}

export function offerAmountFromPricing(pricing: PublicPricing | null): {
  listBdt: number;
  offerBdt: number;
  saveBdt: number;
} {
  const listBdt = pricing?.regularPriceBdt ?? JOURNEY_LIST_PRICE_BDT;
  const offerBdt = pricing?.finalPriceBdt ?? JOURNEY_OFFER_PRICE_BDT;
  return {
    listBdt,
    offerBdt,
    saveBdt: Math.max(0, listBdt - offerBdt),
  };
}
