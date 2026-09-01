import type { UiLocale } from "@/src/lib/ui-locale";

const OAUTH_ERROR_COPY = {
  en: {
    google_denied: "Google sign-in was cancelled. Try again when you are ready.",
    google_invalid: "Google sign-in did not finish. Tap Continue with Google again.",
    google_expired: "Google sign-in expired. Tap Continue with Google again.",
    google_retry: "Google sign-in did not finish. Tap Continue with Google again.",
    google_unavailable:
      "Google sign-in is temporarily unavailable. Create an account with email or mobile instead.",
    google_email_conflict:
      "This email is already linked to a different Google account. Use that account, or sign in with email / mobile.",
    google_profile: "Could not read your Google profile. Try again.",
    google_unverified_email:
      "That Google email is not verified. Verify it with Google, or use email / mobile signup.",
    google_failed:
      "Google sign-in failed. Try again, or create an account with email or mobile.",
    google_missing_token:
      "Google sign-in did not return a session. Tap Continue with Google again.",
    google_sync_failed: "Could not finish Google sign-in. Try again.",
  },
  bn: {
    google_denied: "গুগল সাইন-ইন বাতিল হয়েছে। প্রস্তুত হলে আবার চেষ্টা করুন।",
    google_invalid: "গুগল সাইন-ইন শেষ হয়নি। আবার Continue with Google চাপুন।",
    google_expired: "গুগল সাইন-ইন মেয়াদ শেষ। আবার Continue with Google চাপুন।",
    google_retry: "গুগল সাইন-ইন শেষ হয়নি। আবার Continue with Google চাপুন।",
    google_unavailable:
      "গুগল সাইন-ইন এখন কাজ করছে না। ইমেইল বা মোবাইল দিয়ে অ্যাকাউন্ট খুলুন।",
    google_email_conflict:
      "এই ইমেইল অন্য একটি গুগল অ্যাকাউন্টের সাথে যুক্ত। সেই অ্যাকাউন্ট, ইমেইল অথবা মোবাইল ব্যবহার করুন।",
    google_profile: "গুগল প্রোফাইল পড়া যায়নি। আবার চেষ্টা করুন।",
    google_unverified_email:
      "এই গুগল ইমেইল ভেরিফাই করা নেই। গুগলে ভেরিফাই করুন, অথবা ইমেইল/মোবাইল ব্যবহার করুন।",
    google_failed:
      "গুগল সাইন-ইন হয়নি। আবার চেষ্টা করুন, অথবা ইমেইল/মোবাইল দিয়ে অ্যাকাউন্ট খুলুন।",
    google_missing_token:
      "গুগল সাইন-ইন সেশন দেয়নি। আবার Continue with Google চাপুন।",
    google_sync_failed: "গুগল সাইন-ইন শেষ করা যায়নি। আবার চেষ্টা করুন।",
  },
} as const;

type OAuthErrorCode = keyof typeof OAUTH_ERROR_COPY.en;

const LEGACY_FAILED = "Google sign-in failed. Please try again.";

function isOAuthErrorCode(value: string): value is OAuthErrorCode {
  return value in OAUTH_ERROR_COPY.en;
}

export function formatAuthQueryError(raw: string, locale: UiLocale): string {
  const value = raw.trim();
  const table = OAUTH_ERROR_COPY[locale];
  if (!value || value === LEGACY_FAILED) return table.google_failed;
  if (isOAuthErrorCode(value)) return table[value];
  return value;
}
