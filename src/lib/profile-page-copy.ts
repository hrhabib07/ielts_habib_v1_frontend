import type { GuestLandingLocale } from "@/src/lib/guest-landing-copy";

export interface ProfilePageCopy {
  readonly workspaceLabel: string;
  readonly openCampMap: string;
  readonly plans: string;
  readonly supportTitle: string;
  readonly supportHeadline: string;
  readonly supportBody: string;
  readonly analyticsLabel: string;
  readonly progressTitle: string;
  readonly accountSecurity: string;
  readonly subscription: string;
  readonly subscriptionHint: string;
  readonly noSubscription: string;
  readonly viewPlans: string;
  readonly profileSettings: string;
  readonly profileSettingsHint: string;
  readonly edit: string;
  readonly nickname: string;
  readonly phone: string;
  readonly save: string;
  readonly saving: string;
  readonly cancel: string;
  readonly saveSuccess: string;
  readonly englishPlayer: string;
  readonly mission01Free: string;
}

export const PROFILE_PAGE_COPY: Record<GuestLandingLocale, ProfilePageCopy> = {
  en: {
    workspaceLabel: "Student workspace",
    openCampMap: "Open camp map",
    plans: "Plans",
    supportTitle: "Support",
    supportHeadline: "WhatsApp only · we reply to messages",
    supportBody: "For billing, access, or product questions, message us on WhatsApp.",
    analyticsLabel: "Analytics",
    progressTitle: "English Foundations progress",
    accountSecurity: "Account security",
    subscription: "Subscription",
    subscriptionHint: "Active plan and renewal window.",
    noSubscription: "No active subscription.",
    viewPlans: "View plans",
    profileSettings: "Profile settings",
    profileSettingsHint: "Update your nickname and phone. You can change your nickname anytime.",
    edit: "Edit",
    nickname: "Nickname",
    phone: "Phone",
    save: "Save changes",
    saving: "Saving…",
    cancel: "Cancel",
    saveSuccess: "Profile updated successfully.",
    englishPlayer: "English Foundations",
    mission01Free: "Mission 01 free",
  },
  bn: {
    workspaceLabel: "স্টুডেন্ট ওয়ার্কস্পেস",
    openCampMap: "ক্যাম্প ম্যাপ খুলুন",
    plans: "প্ল্যান",
    supportTitle: "সাপোর্ট",
    supportHeadline: "শুধু WhatsApp · আমরা রিপ্লাই দিই",
    supportBody: "বিলিং, অ্যাক্সেস বা প্রোডাক্ট প্রশ্নে WhatsApp-এ মেসেজ করুন।",
    analyticsLabel: "অ্যানালিটিক্স",
    progressTitle: "English Foundations প্রোগ্রেস",
    accountSecurity: "অ্যাকাউন্ট সিকিউরিটি",
    subscription: "সাবস্ক্রিপশন",
    subscriptionHint: "অ্যাক্টিভ প্ল্যান ও রিনিউয়াল সময়।",
    noSubscription: "কোনো অ্যাক্টিভ সাবস্ক্রিপশন নেই।",
    viewPlans: "প্ল্যান দেখুন",
    profileSettings: "প্রোফাইল সেটিংস",
    profileSettingsHint: "nickname ও ফোন আপডেট করুন। nickname যেকোনো সময় বদলাতে পারবেন।",
    edit: "এডিট",
    nickname: "ডাকনাম",
    phone: "ফোন",
    save: "সেভ করুন",
    saving: "সেভ হচ্ছে…",
    cancel: "বাতিল",
    saveSuccess: "প্রোফাইল আপডেট হয়েছে।",
    englishPlayer: "English Foundations",
    mission01Free: "Mission 01 ফ্রি",
  },
};
