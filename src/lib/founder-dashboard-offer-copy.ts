import type { UiLocale } from "@/src/lib/ui-locale";

/** Dashboard Founder offer: user facing copy must not include -, –, or —. */
export interface FounderDashboardOfferCopy {
  readonly alert: (remainingSeats: number) => string;
  readonly tag: string;
  readonly headline: string;
  readonly body: string;
  readonly warning: (remainingSeats: number) => string;
  readonly cta: string;
  readonly trustPayOnce: string;
  readonly trustPayFast: string;
  readonly trustLifetime: string;
  readonly regularLabel: string;
  readonly founderLabel: string;
  readonly saveLabel: string;
}

export const FOUNDER_DASHBOARD_OFFER_COPY: Record<
  UiLocale,
  FounderDashboardOfferCopy
> = {
  bn: {
    alert: (remainingSeats) =>
      `সাবধান! 1590 টাকার বদলে মাত্র 159 টাকায় আজীবন অ্যাক্সেস পাওয়ার সুযোগ শেষ হতে আর মাত্র ${remainingSeats} টি সিট বাকি আছে!`,
    tag: "স্পেশাল ওয়ান টাইম অফার",
    headline: "মিশন 1 শুরু করার আগেই আনলক করুন আপনার আজীবন ফ্রি অ্যাক্সেস!",
    body: "আমাদের প্রথম 100 জন Founder Member কোটা প্রায় শেষ। 100 জন পূর্ণ হওয়ার সাথে সাথেই প্ল্যাটফর্মের মূল্য হয়ে যাবে 1590 টাকা। এখনই মাত্র 159 টাকা দিয়ে নিশ্চিত করুন আপনার সিট এবং বাঁচান 1431 টাকা! সাথে পাচ্ছেন আজীবন ফ্রি অ্যাক্সেস এবং এক্সক্লুসিভ Founder Badge।",
    warning: (remainingSeats) =>
      `সতর্কতা: আর মাত্র ${remainingSeats} টি সিট বাকি আছে! 100 জন পূর্ণ হলে আপনাকে 1590 টাকা পরিশোধ করতে হবে।`,
    cta: "1590 টাকার বদলে মাত্র 159 টাকায় আজীবন অ্যাক্সেস নিন",
    trustPayOnce: "একবারই পেমেন্ট করতে হবে",
    trustPayFast: "বিকাশ বা নগদের মাধ্যমে মাত্র 2 মিনিটে পেমেন্ট সম্ভব",
    trustLifetime: "আজীবন সকল প্রিমিয়াম মিশন ও ক্যাম্প সম্পূর্ণ ফ্রি",
    regularLabel: "রেগুলার",
    founderLabel: "Founder আজ",
    saveLabel: "বাঁচবে",
  },
  en: {
    alert: (remainingSeats) =>
      `Warning! Only ${remainingSeats} seats left to get lifetime access for only 159 BDT instead of the regular 1590 BDT price!`,
    tag: "Special One Time Offer",
    headline: "Unlock Your Lifetime Free Access Before You Even Start Mission 1!",
    body: "Our first 100 Founder Member seats are almost completely sold out. As soon as 100 seats fill up, the price will instantly jump to 1590 BDT. Pay only 159 BDT right now to secure your seat and save 1431 BDT today! You will get lifetime platform access plus your exclusive Founder Badge forever.",
    warning: (remainingSeats) =>
      `Warning: Only ${remainingSeats} seats remaining! Once they are gone, you will have to pay the full 1590 BDT price.`,
    cta: "Get Lifetime Access For Only 159 BDT Instead Of 1590 BDT",
    trustPayOnce: "Pay only one time ever",
    trustPayFast: "Pay in just 2 minutes using bKash or Nagad",
    trustLifetime: "All future premium missions and camps unlocked forever",
    regularLabel: "Regular",
    founderLabel: "Founder today",
    saveLabel: "You save",
  },
};
