import type { UiLocale } from "@/src/lib/ui-locale";

export interface CheckoutCopy {
  readonly statusLock: string;
  readonly statusNext: string;
  readonly urgencyEyebrow: string;
  readonly urgencyTitle: string;
  readonly urgencyBody: string;
  readonly amountLabel: string;
  readonly regularPriceLabel: string;
  readonly founderPriceLabel: string;
  readonly youSaveLabel: string;
  readonly stepsTitle: string;
  readonly step1: string;
  readonly step2: string;
  readonly step3: string;
  readonly bkashNumberLabel: string;
  readonly copy: string;
  readonly copied: string;
  readonly copyFailed: string;
  readonly numberSoon: string;
  readonly senderLabel: string;
  readonly senderHint: string;
  readonly trxLabel: string;
  readonly trxHint: string;
  readonly trxPlaceholder: string;
  readonly submit: string;
  readonly submitting: string;
  readonly stickySubmit: string;
  readonly back: string;
  readonly perkSecure: string;
  readonly perkManual: string;
  readonly perkFounder: string;
  readonly trustBadge: string;
  readonly preOrderNote: string;
  readonly invalidSender: string;
  readonly invalidTrx: string;
  readonly missingBkash: string;
  readonly submitFailed: string;
  readonly sessionExpired: string;
  readonly networkError: string;
  readonly sessionPreparing: string;
  readonly pageEyebrow: string;
  readonly pageTitle: string;
  readonly pageSub: string;
}

export const CHECKOUT_COPY: Record<UiLocale, CheckoutCopy> = {
  bn: {
    statusLock: "অফার মূল্য এখনো লক করা যায়",
    statusNext: "bKash Send Money → TrxID সাবমিট",
    urgencyEyebrow: "শেষ ধাপ",
    urgencyTitle: "পেমেন্ট সম্পন্ন না হলে অ্যাক্সেস চালু হবে না!",
    urgencyBody:
      "মূল্য লক করতে bKash এ Send Money করুন। পেমেন্ট ভেরিফাই হলে অ্যাক্টিভ হওয়ার পর 45 দিনের ফুল জার্নি অ্যাক্সেস চালু হবে।",
    amountLabel: "পাঠাতে হবে",
    regularPriceLabel: "রেগুলার মূল্য",
    founderPriceLabel: "অফার মূল্য",
    youSaveLabel: "বাঁচবে",
    stepsTitle: "3 ধাপে শেষ করুন",
    step1: "ধাপ 1: bKash অ্যাপে Send Money খুলুন",
    step2: "ধাপ 2: নিচের নম্বরে ঠিক এই পরিমাণ পাঠান",
    step3: "ধাপ 3: আপনার নম্বর + TrxID দিয়ে সাবমিট করুন",
    bkashNumberLabel: "আমাদের bKash নম্বর",
    copy: "কপি",
    copied: "কপি হয়েছে",
    copyFailed: "নম্বর কপি করা যায়নি",
    numberSoon: "শীঘ্রই আপডেট করা হবে",
    senderLabel: "আপনার bKash নম্বর",
    senderHint: "যে নম্বর থেকে টাকা পাঠিয়েছেন সেটি দিন।",
    trxLabel: "Transaction ID (TrxID)",
    trxHint: "bKash SMS বা অ্যাপে পাওয়া TrxID দিন। একই ID দুবার ব্যবহার করা যাবে না।",
    trxPlaceholder: "যেমন: 8N7A2B1C3D",
    submit: "পেমেন্ট সাবমিট করুন",
    submitting: "সাবমিট হচ্ছে…",
    stickySubmit: "সাবমিট করুন",
    back: "প্রাইসিং এ ফিরে যান",
    perkSecure: "নিরাপদ ম্যানুয়াল ভেরিফিকেশন",
    perkManual: "ভুল TrxID হলে সাপোর্ট সাহায্য করবে",
    perkFounder: "অফার ভেরিফাইয়ের পর লক",
    trustBadge:
      "Gamlish: বাংলাদেশের প্রথম ও একমাত্র গ্যামিফাইড ইংলিশ লার্নিং প্ল্যাটফর্ম",
    preOrderNote: "পেমেন্ট ভেরিফাই হলে অ্যাক্সেস চালু হবে।",
    invalidSender: "সঠিক bKash নম্বর দিন (01XXXXXXXXX)",
    invalidTrx: "সঠিক Transaction ID (TrxID) দিন। bKash SMS বা অ্যাপে পাবেন।",
    missingBkash: "bKash নম্বর এখনো সেট করা হয়নি। অ্যাডমিনের সাথে যোগাযোগ করুন।",
    submitFailed: "সাবমিট করা যায়নি। আবার চেষ্টা করুন।",
    sessionExpired:
      "আপনার সেশন শেষ হয়ে গেছে। আবার লগইন করে TrxID সাবমিট করুন  -  দুবার টাকা কাটা হবে না।",
    networkError:
      "নেটওয়ার্ক সমস্যা হয়েছে। আবার সাবমিট করুন  -  একই TrxID দুবার চার্জ হবে না।",
    sessionPreparing: "সেশন প্রস্তুত হচ্ছে… এক মুহূর্ত অপেক্ষা করুন",
    pageEyebrow: "Checkout",
    pageTitle: "ফুল জার্নি অ্যাক্সেস লক করুন",
    pageSub: "bKash Send Money করুন, তারপর TrxID সাবমিট করুন",
  },
  en: {
    statusLock: "Offer price can still be locked",
    statusNext: "bKash Send Money → submit TrxID",
    urgencyEyebrow: "Final step",
    urgencyTitle: "Access does not start until payment is submitted!",
    urgencyBody:
      "Send Money on bKash now to lock this price. After verification, you get 45 days of Full Journey Access from activation.",
    amountLabel: "Amount to send",
    regularPriceLabel: "Regular price",
    founderPriceLabel: "Offer price",
    youSaveLabel: "You save",
    stepsTitle: "Finish in 3 steps",
    step1: "Step 1: Open Send Money in the bKash app",
    step2: "Step 2: Send exactly this amount to the number below",
    step3: "Step 3: Submit your number + TrxID",
    bkashNumberLabel: "Our bKash number",
    copy: "Copy",
    copied: "Copied",
    copyFailed: "Could not copy the number",
    numberSoon: "Will be updated soon",
    senderLabel: "Your bKash number",
    senderHint: "Use the number you sent money from.",
    trxLabel: "Transaction ID (TrxID)",
    trxHint: "Find TrxID in your bKash SMS or app. The same ID cannot be claimed twice.",
    trxPlaceholder: "e.g. 8N7A2B1C3D",
    submit: "Submit payment",
    submitting: "Submitting…",
    stickySubmit: "Submit payment",
    back: "Back to pricing",
    perkSecure: "Secure manual verification",
    perkManual: "Support can help if TrxID is wrong",
    perkFounder: "Offer locks after verify",
    trustBadge:
      "Gamlish: Bangladesh's first and only gamified English learning platform",
    preOrderNote: "Access starts when payment is verified.",
    invalidSender: "Enter a valid bKash number (01XXXXXXXXX)",
    invalidTrx: "Enter a valid Transaction ID (TrxID) from your bKash SMS or app.",
    missingBkash: "bKash number is not set yet. Please contact admin.",
    submitFailed: "Could not submit. Please try again.",
    sessionExpired:
      "Your session expired. Sign in again and resubmit the same TrxID  -  you will not be charged twice.",
    networkError:
      "Network error. Please submit again  -  the same TrxID will not charge you twice.",
    sessionPreparing: "Preparing your session… please wait a moment",
    pageEyebrow: "Checkout",
    pageTitle: "Lock Full Journey Access",
    pageSub: "Send Money on bKash, then submit your TrxID",
  },
};
