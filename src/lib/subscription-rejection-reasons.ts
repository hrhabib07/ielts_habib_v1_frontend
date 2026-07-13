export const SUBSCRIPTION_REJECTION_REASON_CODES = [
  "INVALID_TRX_ID",
  "AMOUNT_MISMATCH",
  "WRONG_NUMBER",
  "DUPLICATE_TRX",
  "INCOMPLETE_INFO",
  "CUSTOM",
] as const;

export type SubscriptionRejectionReasonCode =
  (typeof SUBSCRIPTION_REJECTION_REASON_CODES)[number];

export interface SubscriptionRejectionReasonOption {
  code: SubscriptionRejectionReasonCode;
  labelBn: string;
  labelEn: string;
}

export const SUBSCRIPTION_REJECTION_REASONS: readonly SubscriptionRejectionReasonOption[] = [
  {
    code: "INVALID_TRX_ID",
    labelBn: "Transaction ID সঠিক নয় বা bKash-এ পাওয়া যায়নি",
    labelEn: "Transaction ID is invalid or not found on bKash",
  },
  {
    code: "AMOUNT_MISMATCH",
    labelBn: "পাঠানো টাকার পরিমাণ মিলছে না",
    labelEn: "Paid amount does not match",
  },
  {
    code: "WRONG_NUMBER",
    labelBn: "ভুল bKash নম্বরে টাকা পাঠানো হয়েছে",
    labelEn: "Money was sent to the wrong bKash number",
  },
  {
    code: "DUPLICATE_TRX",
    labelBn: "এই Transaction ID আগেই ব্যবহার করা হয়েছে",
    labelEn: "This Transaction ID was already used",
  },
  {
    code: "INCOMPLETE_INFO",
    labelBn: "জমা দেওয়া তথ্য অসম্পূর্ণ (নম্বর বা TrxID)",
    labelEn: "Submitted details are incomplete",
  },
  {
    code: "CUSTOM",
    labelBn: "অন্য কারণ (নিজে লিখুন)",
    labelEn: "Other reason (write your own)",
  },
] as const;
