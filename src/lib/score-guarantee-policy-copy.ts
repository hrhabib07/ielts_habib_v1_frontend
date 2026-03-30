export type ScoreGuaranteePolicyLocale = "en" | "bn";

export interface ScoreGuaranteeCriterionCopy {
  readonly title: string;
  readonly body: string;
}

export interface ScoreGuaranteePolicyCopy {
  readonly backToProfile: string;
  readonly backToPricing: string;
  readonly badge: string;
  readonly badgePublic: string;
  readonly headlineLead: string;
  readonly headlineBrand: string;
  readonly tagline: string;
  readonly intro: string;
  readonly checklistTitle: string;
  readonly checklistLead: string;
  readonly criteria: readonly ScoreGuaranteeCriterionCopy[];
  readonly whyTitle: string;
  readonly whyBody: string;
  readonly whyAffiliateNote: string;
  readonly footerNote: string;
  readonly continuePath: string;
  readonly getStartedPublic: string;
  readonly plansBilling: string;
  readonly languageToggleAria: string;
  readonly languageToggleHint: string;
  readonly englishLabel: string;
  readonly banglaLabel: string;
}

export const SCORE_GUARANTEE_POLICY_COPY: Record<
  ScoreGuaranteePolicyLocale,
  ScoreGuaranteePolicyCopy
> = {
  en: {
    backToProfile: "Back to profile",
    backToPricing: "Back to pricing",
    badge: "Member assurance",
    badgePublic: "Score Guarantee™ policy",
    headlineLead: "Your target band is backed by the ",
    headlineBrand: "Gamlish Score Guarantee™",
    tagline: "We don't guess your score—we measure it.",
    intro:
      "Most platforms give you materials; we give you a measurable outcome. We are so confident in our 20-Level Mastery System that if you reach our Readiness Zone and do not achieve your declared target band on the official IELTS exam, we will issue a 100% full refund of your course fees.",
    checklistTitle: "Eligibility checklist",
    checklistLead:
      "All of the following must be true for a refund request to be valid. Our team will verify activity, timing, and official results.",
    criteria: [
      {
        title: "100% Curriculum Mastery",
        body:
          "Complete all 20 levels and every mandatory lesson in your personalized path.",
      },
      {
        title: "The 90% Readiness Zone",
        body:
          "Your Water Level (Readiness Meter) must reach 90% or higher, based on our internal AI-evaluated assessments.",
      },
      {
        title: "Academic Integrity",
        body:
          "All quizzes and full-length mock exams must be completed honestly, strictly following standard IELTS timing and rules.",
      },
      {
        title: "The 14-Day Performance Window",
        body:
          "You must sit for the official IELTS exam (IDP or British Council) within 14 days of first hitting 90% Readiness on Gamlish.",
      },
      {
        title: "Rapid Claim",
        body:
          "If you do not hit your target, submit your official Test Report Form (TRF) within 14 days of your results publication.",
      },
    ],
    whyTitle: "Why 90%?",
    whyBody:
      "Our data shows that learners who reach 90% mastery on Gamlish have a 98% success rate on the real exam. We do not merely predict scores—we build the performance that earns them. When your Water Level hits 90%, you are not just ready; you are operating in a verified band of competence.",
    whyAffiliateNote:
      "Gamlish is not affiliated with IDP, British Council, or Cambridge Assessment English.",
    footerNote:
      "The Gamlish Score Guarantee™ applies only when all eligibility conditions are met and verified by our team. Official IELTS results and Gamlish activity logs may be required.",
    continuePath: "Continue your path",
    getStartedPublic: "Get started",
    plansBilling: "Plans & billing",
    languageToggleAria: "Choose page language",
    languageToggleHint: "Language",
    englishLabel: "English",
    banglaLabel: "বাংলা",
  },
  bn: {
    backToProfile: "প্রোফাইলে ফিরুন",
    backToPricing: "প্রাইসিং-এ ফিরুন",
    badge: "সদস্য নিশ্চয়তা",
    badgePublic: "স্কোর গ্যারান্টি পলিসি",
    headlineLead: "আপনার টার্গেট ব্যান্ডের নিশ্চয়তা দিচ্ছে ",
    headlineBrand: "Gamlish Score Guarantee™",
    tagline: "আমরা স্কোরের অনুমান করি না—আমরা তা পরিমাপ করি।",
    intro:
      "বেশিরভাগ প্ল্যাটফর্ম আপনাকে শুধু পড়ার ম্যাটেরিয়াল দেয়; আমরা দিচ্ছি মেজারেবল বা পরিমাপযোগ্য ফলাফল। আমাদের ২০-লেভেলের মাস্টারি সিস্টেমের ওপর আমরা এতটাই আত্মবিশ্বাসী যে, আপনি যদি আমাদের 'রেডিনেস জোন'-এ পৌঁছানোর পরও মেইন আইইএলটিএস (IELTS) পরীক্ষায় আপনার টার্গেট স্কোর না পান, তবে আমরা আপনার কোর্স ফির ১০০% রিফান্ড করে দেব।",
    checklistTitle: "রিফান্ড পলিসি ও শর্তাবলী (Eligibility Checklist)",
    checklistLead:
      "রিফান্ড পাওয়ার জন্য নিচের ৫টি শর্ত অবশ্যই পূরণ করতে হবে। আমাদের টিম আপনার প্ল্যাটফর্ম অ্যাক্টিভিটি, সময় এবং অফিশিয়াল রেজাল্ট ভেরিফাই করবে।",
    criteria: [
      {
        title: "১০০% কারিকুলাম কমপ্লিশন",
        body:
          "আপনার কাস্টমাইজড প্রিপারেশন প্ল্যানের ২০টি লেভেল এবং প্রতিটি বাধ্যতামূলক লেসন সম্পূর্ণ করতে হবে।",
      },
      {
        title: "৯০% রেডিনেস জোন",
        body:
          "Gamlish-এর ইন্টারনাল AI অ্যাসেসমেট অনুযায়ী, আপনার ওয়াটার লেভেল (Readiness Meter) বা প্রস্তুতির মাত্রা অবশ্যই ৯০% বা তার বেশি হতে হবে।",
      },
      {
        title: "সততা (Academic Integrity)",
        body:
          "সকল কুইজ এবং ফুল-লেংথ মক টেস্টগুলো সম্পূর্ণ সততার সাথে এবং আইইএলটিএস-এর স্ট্যান্ডার্ড সময় ও নিয়ম মেনে দিতে হবে।",
      },
      {
        title: "১৪ দিনের উইন্ডো",
        body:
          "Gamlish-এ প্রথমবার ৯০% রেডিনেস অর্জন করার পর, অবশ্যই পরবর্তী ১৪ দিনের মধ্যে মেইন আইইএলটিএস (IDP বা British Council) পরীক্ষায় বসতে হবে।",
      },
      {
        title: "দ্রুত ক্লেইম",
        body:
          "যদি মেইন পরীক্ষায় টার্গেট স্কোর না আসে, তবে অফিশিয়াল রেজাল্ট (Test Report Form) প্রকাশের ১৪ দিনের মধ্যে রিফান্ডের জন্য সাবমিট করতে হবে।",
      },
    ],
    whyTitle: "কেন ৯০%?",
    whyBody:
      "আমাদের ডেটা অনুযায়ী, যেসব শিক্ষার্থী Gamlish-এ ৯০% মাস্টারি অর্জন করে, মেইন পরীক্ষায় তাদের সফলতার হার ৯৮%। আমরা শুধু স্কোর প্রেডিক্ট করি না, আমরা সেই স্কোরের যোগ্য করে তুলি। আপনার ওয়াটার লেভেল যখন ৯০% ছোঁবে, এর মানে আপনি শুধু প্রস্তুতই নন, আপনি আপনার কাঙ্ক্ষিত ব্যান্ডের যোগ্যতায় পৌঁছে গেছেন।",
    whyAffiliateNote:
      "Gamlish কোনোভাবেই IDP, British Council বা Cambridge Assessment English-এর সাথে যুক্ত নয়।",
    footerNote:
      "Gamlish Score Guarantee™ কেবল যখন উপরের সব যোগ্যতার শর্ত পূরণ এবং আমাদের টিম দ্বারা যাচাই করা হয় তখনই প্রযোজ্য। অফিশিয়াল IELTS রেজাল্ট ও Gamlish-এর অ্যাক্টিভিটি লগ প্রয়োজন হতে পারে।",
    continuePath: "আপনার পথ চালিয়ে যান",
    getStartedPublic: "শুরু করুন",
    plansBilling: "প্ল্যান ও বিলিং",
    languageToggleAria: "পৃষ্ঠার ভাষা বেছে নিন",
    languageToggleHint: "ভাষা",
    englishLabel: "English",
    banglaLabel: "বাংলা",
  },
} as const;

export const SCORE_GUARANTEE_LOCALE_STORAGE_KEY = "gamlish-score-guarantee-locale";
