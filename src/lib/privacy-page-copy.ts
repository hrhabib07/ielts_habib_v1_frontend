import type { UiLocale } from "@/src/lib/ui-locale";

export const PRIVACY_SEO = {
  title: "Privacy Policy | Gamlish - Secure & Gamified English Learning",
  description:
    "Read the official Gamlish Privacy Policy. Learn how we secure your data on Vercel and Railway, protect your learning progress, and respect your privacy.",
  path: "/privacy-policy",
  /** Short alias that redirects to /privacy-policy */
  aliasPath: "/privacy",
} as const;

export type PrivacyBulletBlock = {
  readonly label: string;
  readonly text: string;
};

export type PrivacySection = {
  readonly id: string;
  readonly title: string;
  readonly paragraphs?: readonly string[];
  readonly bullets?: readonly PrivacyBulletBlock[];
  readonly callout?: {
    readonly title: string;
    readonly body: string;
  };
  readonly metaLine?: string;
  readonly contact?: {
    readonly emailLabel: string;
    readonly orgLabel: string;
    readonly orgValue: string;
    readonly locationLabel: string;
    readonly locationValue: string;
  };
};

export type PrivacyPageCopy = {
  readonly back: string;
  readonly title: string;
  readonly subtitle: string;
  readonly tocTitle: string;
  readonly lastUpdated: string;
  readonly emailCta: string;
  readonly sections: readonly PrivacySection[];
};

export const PRIVACY_PAGE_COPY: Record<UiLocale, PrivacyPageCopy> = {
  en: {
    back: "Back to home",
    title: "Gamlish Privacy Policy",
    subtitle:
      "Your privacy and data security are just as important to us as your English mastery.",
    tocTitle: "On this page",
    lastUpdated: "Last Updated: July 2026",
    emailCta: "Email support",
    sections: [
      {
        id: "introduction",
        title: "1. Introduction & Scope",
        paragraphs: [
          "Welcome to Gamlish! We are building a gamified, structured English foundation platform based in Sylhet, Bangladesh, designed to help Bengali speakers master English writing and grammar without fear. Your privacy is just as important to us as your educational progress. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website, web application, and our 4 Camps and 21 Missions. By creating an account or using Gamlish, you trust us with your learning journey, and we are committed to protecting that trust.",
        ],
      },
      {
        id: "information-collected",
        title: "2. Information We Collect",
        paragraphs: [
          "To provide a customized and seamless learning experience, we collect specific types of information:",
        ],
        bullets: [
          {
            label: "Account & Profile Data",
            text: "When you register, we collect your full name, email address, phone number, educational background, and profile picture.",
          },
          {
            label: "Learning & Gameplay Data",
            text: "To power our gamified engine, we track your Mission completion rates, XP earned, daily learning streaks, quiz responses, grammar error logs, and Squad interactions. This data is used solely to personalize your learning roadmap.",
          },
          {
            label: "Financial & Payment Verification Data",
            text: "For Founding Member pre-orders and premium enrollments, we use a manual bKash payment verification system. When you make a transfer, you provide your transaction ID (TrxID) and sender mobile number so our admin team can manually verify your payment. We never ask for, collect, or store raw bank account numbers, bKash PINs, or credit card numbers on our servers.",
          },
          {
            label: "Technical & Device Information",
            text: "When you visit our homepage or platform, we automatically collect technical data such as your IP address, browser type, device type (smartphone, tablet, or PC), and operating system to ensure our website loads fast and works smoothly.",
          },
        ],
      },
      {
        id: "how-we-use",
        title: "3. How We Use Your Information",
        paragraphs: [
          "We use your data strictly to improve your English foundation and operate the Gamlish platform effectively:",
        ],
        bullets: [
          {
            label: "To Power Your Learning Engine",
            text: "To calculate your daily XP, update your Squad leaderboard, unlock new Missions, and track your progression through the 4 Camps.",
          },
          {
            label: "To Send Critical Communications",
            text: "Using our secure email partner, Resend, we send transactional notifications, account verifications, daily streak reminders, and important platform updates.",
          },
          {
            label: "To Verify Transactions",
            text: "Our admin team uses your submitted bKash transaction details solely to confirm your payment and unlock your Founding Member badge or course access.",
          },
          {
            label: "To Optimize Performance",
            text: "We analyze learning metrics and grammar error trends to identify which lessons need better video explanations or extra practice challenges.",
          },
        ],
      },
      {
        id: "data-sharing",
        title: "4. How We Share and Disclose Your Data",
        paragraphs: [
          "We never sell, rent, or trade your personal data to third-party advertisers or data brokers. We only share your data with strict, trusted infrastructure partners necessary to run our platform:",
        ],
        bullets: [
          {
            label: "Frontend Hosting (Vercel)",
            text: "Our web interface is hosted on Vercel, which securely delivers our website content to your browser with high speed and SSL encryption.",
          },
          {
            label: "Backend & Database Infrastructure (Railway)",
            text: "All user profiles, XP history, and learning progress are securely stored in our encrypted database hosted on Railway.",
          },
          {
            label: "Email Delivery (Resend)",
            text: "We share your email address and name with Resend strictly for sending you essential platform notifications and learning reminders.",
          },
          {
            label: "Analytics (Google Analytics)",
            text: "We use Google Analytics on our homepage to understand website visitor traffic and improve user experience. Google Analytics collects anonymous usage behavior without identifying your personal account secrets.",
          },
          {
            label: "Public Visibility",
            text: "Other learners in your Squad can only see your public username, current Level, total XP, earned badges, and Founding Member number. Your email address, phone number, and payment details remain 100% private.",
          },
        ],
      },
      {
        id: "cookies",
        title: "5. Cookies and Tracking Technologies",
        paragraphs: [
          "Gamlish uses essential session cookies and tracking tools to ensure a smooth user experience. Essential cookies keep you logged into your account so you do not have to enter your password every time you start a new Mission. We also use Google Analytics cookies on our homepage to measure traffic sources and understand how visitors discover our ESL platform. You can modify your browser settings to refuse cookies, but doing so may prevent you from logging in or saving your mission progress.",
        ],
      },
      {
        id: "security",
        title: "6. Data Security & Retention",
        paragraphs: [
          "We employ industry-standard security measures, including modern SSL/TLS encryption, secure API connections between Vercel and Railway, and password hashing, to protect your personal information from unauthorized access or alteration. We retain your profile data, XP, and learning progress for as long as your Gamlish account remains active. This ensures that even if you take a break from learning, you can return at any time and resume your roadmap exactly where you left off.",
        ],
      },
      {
        id: "user-rights",
        title: "7. Your Privacy Rights & Data Deletion",
        paragraphs: [
          "You have full control over your personal data on Gamlish. You can access and update your profile information, display name, and educational details at any time directly through your account dashboard.",
        ],
        callout: {
          title: "How to Request Account and Data Deletion",
          body: 'If you wish to permanently delete your Gamlish account, your XP history, and all associated personal data from our Railway servers, you must send an email request from your registered email address to our official support team at support@gamlish.com with the subject line: "Account Deletion Request". Our admin team will verify your identity and permanently erase all your data from our active databases within 7 to 14 business days. Please note that account deletion is permanent and irreversible; all earned XP, badges, and Founding Member status will be lost.',
        },
      },
      {
        id: "childrens-privacy",
        title: "8. Children's Privacy (Age 13+ Policy)",
        paragraphs: [
          "Gamlish is structured to help students of various educational backgrounds build a strong English foundation. However, our platform requires users to be at least 13 years of age to create an independent account. We do not knowingly collect personal or contact information from children under the age of 13 without verifiable parental or guardian consent. If you are a parent or guardian and believe your child under 13 has created an account without your approval, please contact us immediately at support@gamlish.com, and we will promptly remove the account and its associated data from our servers.",
        ],
      },
      {
        id: "third-party",
        title: "9. Third-Party Links and External Resources",
        paragraphs: [
          "Our educational blog posts, lessons, or community forums may occasionally contain links to external third-party websites, educational references, or social media platforms (such as our official YouTube channel or Facebook page). Please be aware that once you click an external link and leave the Gamlish platform, this Privacy Policy no longer applies. We encourage you to read the privacy statements of any external website you visit, as we are not responsible for their data collection practices or content.",
        ],
      },
      {
        id: "updates",
        title: "10. Updates to This Privacy Policy",
        paragraphs: [
          "As Gamlish grows and we introduce new Camps, Missions, or interactive features, we may update this Privacy Policy to reflect those technological enhancements. When we make material changes to how we handle your data, we will notify you by sending an email via Resend to your registered email address or by displaying a prominent announcement banner on your account dashboard. We encourage you to review this page periodically to stay informed about how we protect your information.",
        ],
        metaLine: "Last Updated: July 2026",
      },
      {
        id: "contact",
        title: "11. Contact Us",
        paragraphs: [
          "If you have any questions, concerns, feedback, or requests regarding this Privacy Policy, your learning data, or our security infrastructure on Railway and Vercel, please reach out to our official support team. We are dedicated to providing clear, transparent answers to our learner community.",
        ],
        contact: {
          emailLabel: "Official Support Email",
          orgLabel: "Operating Identity",
          orgValue: "Gamlish Educational Platform",
          locationLabel: "Location",
          locationValue:
            "Sylhet, Bangladesh (Serving Bengali-speaking learners globally)",
        },
      },
    ],
  },
  bn: {
    back: "হোমে ফিরুন",
    title: "Gamlish প্রাইভেসি পলিসি",
    subtitle:
      "আপনার ব্যক্তিগত তথ্যের নিরাপত্তা আমাদের কাছে আপনার ইংরেজি শেখার মতোই গুরুত্বপূর্ণ।",
    tocTitle: "এই পেজে যা আছে",
    lastUpdated: "সর্বশেষ আপডেট: জুলাই 2026",
    emailCta: "ইমেইল সাপোর্ট",
    sections: [
      {
        id: "introduction",
        title: "1. সূচনা এবং আওতা",
        paragraphs: [
          "Gamlish এ আপনাকে স্বাগতম! আমরা সিলেট, বাংলাদেশ ভিত্তিক একটি গেমভিত্তিক Structured English Foundation প্ল্যাটফর্ম, যা বাংলাভাষী শিক্ষার্থীদের কোনো রকম ভয় ছাড়াই ইংরেজি গ্রামার ও লেখার দক্ষতা অর্জনে সাহায্য করার জন্য তৈরি করা হয়েছে। আপনার শিক্ষাগতি যেমন আমাদের কাছে গুরুত্বপূর্ণ, তেমনই আপনার ব্যক্তিগত তথ্যের নিরাপত্তাও আমাদের কাছে অত্যন্ত মূল্যবান। আপনি যখন আমাদের ওয়েবসাইট, ওয়েব অ্যাপ্লিকেশন এবং আমাদের 4টি Camp ও 21টি Mission ব্যবহার করেন, তখন আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার, সংরক্ষণ এবং সুরক্ষিত রাখি, তা এই প্রাইভেসি পলিসিতে বিস্তারিত ব্যাখ্যা করা হয়েছে। Gamlish এ অ্যাকাউন্ট তৈরি বা ব্যবহার করার মাধ্যমে আপনি আমাদের ওপর যে আস্থা রেখেছেন, আমরা তা সম্পূর্ণ সুরক্ষিত রাখতে প্রতিশ্রুতিবদ্ধ।",
        ],
      },
      {
        id: "information-collected",
        title: "2. আমরা যেসব তথ্য সংগ্রহ করি",
        paragraphs: [
          "আপনাকে একটি সাজানো এবং নিরবচ্ছিন্ন শেখার অভিজ্ঞতা দিতে আমরা কিছু নির্দিষ্ট তথ্য সংগ্রহ করি:",
        ],
        bullets: [
          {
            label: "অ্যাকাউন্ট এবং প্রোফাইল তথ্য",
            text: "রেজিস্ট্রেশন করার সময় আমরা আপনার পুরো নাম, ইমেইল অ্যাড্রেস, ফোন নম্বর, শিক্ষাগত যোগ্যতা এবং প্রোফাইল ছবি সংগ্রহ করি।",
          },
          {
            label: "লার্নিং এবং গেমপ্লে তথ্য",
            text: "আমাদের গেমভিত্তিক ইঞ্জিনটি সঠিকভাবে পরিচালনার জন্য আমরা আপনার Mission সম্পন্ন করার হার, অর্জিত XP, প্রতিদিনের শেখার Streak, কুইজের উত্তর, গ্রামার ভুলের লগ এবং Squad এর কার্যক্রম ট্র্যাক করি। এই তথ্য শুধুমাত্র আপনার শেখার রোডম্যাপকে আরও ব্যক্তিগত ও কার্যকর করার জন্য ব্যবহার করা হয়।",
          },
          {
            label: "আর্থিক এবং পেমেন্ট ভেরিফিকেশন তথ্য",
            text: "Founding Member প্রি-অর্ডার এবং প্রিমিয়াম কোর্সে যুক্ত হওয়ার জন্য আমরা bKash ম্যানুয়াল পেমেন্ট ভেরিফিকেশন সিস্টেম ব্যবহার করি। আপনি পেমেন্ট করার পর আপনার ট্রানজেকশন আইডি (TrxID) এবং প্রেরক মোবাইল নম্বর আমাদের প্রদান করেন, যা আমাদের অ্যাডমিন টিম ম্যানুয়ালি ভেরিফাই করে। আমরা কখনোই আপনার bKash পিন, মূল ব্যাংক অ্যাকাউন্ট নম্বর বা ক্রেডিট কার্ডের তথ্য আমাদের সার্ভারে সংরক্ষণ করি না বা জানতে চাই না।",
          },
          {
            label: "টেকনিক্যাল এবং ডিভাইস তথ্য",
            text: "আপনি যখন আমাদের হোমপেজ বা প্ল্যাটফর্ম ভিজিট করেন, তখন আমরা স্বয়ংক্রিয়ভাবে আপনার আইপি অ্যাড্রেস, ব্রাউজারের ধরন, ডিভাইসের ধরন (মোবাইল, ট্যাবলেট বা কম্পিউটার) এবং অপারেটিং সিস্টেমের তথ্য সংগ্রহ করি, যাতে আমাদের ওয়েবসাইট দ্রুত লোড হয় এবং সব ডিভাইসে সঠিকভাবে কাজ করে।",
          },
        ],
      },
      {
        id: "how-we-use",
        title: "3. আপনার তথ্য আমরা কীভাবে ব্যবহার করি",
        paragraphs: [
          "আমরা আপনার তথ্য শুধুমাত্র আপনার ইংরেজির ভিত্তি শক্ত করার এবং Gamlish প্ল্যাটফর্মটি সুষ্ঠুভাবে পরিচালনার কাজে ব্যবহার করি:",
        ],
        bullets: [
          {
            label: "শেখার ইঞ্জিন পরিচালনার জন্য",
            text: "আপনার প্রতিদিনের XP হিসাব করতে, Squad লিডারবোর্ড আপডেট করতে, নতুন Mission আনলক করতে এবং 4টি Camp এ আপনার অগ্রগতি ট্র্যাক করতে।",
          },
          {
            label: "জরুরি যোগাযোগ ও নোটিফিকেশনের জন্য",
            text: "আমাদের সুরক্ষিত ইমেইল পার্টনার Resend ব্যবহার করে আমরা আপনাকে ট্রানজেকশনাল ইমেইল, অ্যাকাউন্ট ভেরিফিকেশন, প্রতিদিনের Streak রিমাইন্ডার এবং প্ল্যাটফর্মের গুরুত্বপূর্ণ আপডেট পাঠাই।",
          },
          {
            label: "পেমেন্ট ভেরিফিকেশনের জন্য",
            text: "আমাদের অ্যাডমিন টিম আপনার প্রদান করা bKash ট্রানজেকশন তথ্য ব্যবহার করে শুধুমাত্র আপনার পেমেন্ট নিশ্চিত করে এবং আপনার Founding Member ব্যাজ বা কোর্সের একসেস চালু করে।",
          },
          {
            label: "প্ল্যাটফর্মের মানোন্নয়নের জন্য",
            text: "শিক্ষার্থীরা কোন ধরনের গ্রামার রুলে সবচেয়ে বেশি ভুল করছে, তা বিশ্লেষণ করে আমরা আমাদের ভিডিও লেসন এবং প্র্যাকটিস চ্যালেঞ্জগুলোকে আরও সহজ ও কার্যকর করে তুলি।",
          },
        ],
      },
      {
        id: "data-sharing",
        title: "4. আমরা কীভাবে আপনার তথ্য শেয়ার করি",
        paragraphs: [
          "আমরা কখনোই তৃতীয় পক্ষের কোনো বিজ্ঞাপনদাতা বা ডেটা ব্রোকারের কাছে আপনার ব্যক্তিগত তথ্য বিক্রি, ভাড়া বা বাণিজ্য করি না। প্ল্যাটফর্মটি সুষ্ঠুভাবে চালানোর জন্য শুধুমাত্র আমাদের বিশ্বস্ত এবং সুরক্ষিত টেকনিক্যাল পার্টনারদের সঙ্গে প্রয়োজনীয় তথ্য শেয়ার করা হয়:",
        ],
        bullets: [
          {
            label: "ফ্রন্টএন্ড হোস্টিং (Vercel)",
            text: "আমাদের ওয়েব ইন্টারফেসটি Vercel এ হোস্ট করা হয়েছে, যা দ্রুতগতি এবং SSL এনক্রিপশনের মাধ্যমে আপনার ব্রাউজারে আমাদের ওয়েবসাইটটি নিরাপদে পৌঁছে দেয়।",
          },
          {
            label: "ব্যাকএন্ড এবং ডেটাবেস (Railway)",
            text: "আপনার ইউজার প্রোফাইল, অর্জিত XP এবং শেখার সব অগ্রগতি Railway তে হোস্ট করা আমাদের এনক্রিপ্টেড ডেটাবেসে সম্পূর্ণ নিরাপদে সংরক্ষিত থাকে।",
          },
          {
            label: "ইমেইল ডেলিভারি (Resend)",
            text: "আপনাকে জরুরি নোটিফিকেশন এবং শেখার রিমাইন্ডার পাঠানোর জন্য আমরা শুধুমাত্র আপনার নাম এবং ইমেইল অ্যাড্রেস Resend এর মাধ্যমে ব্যবহার করি।",
          },
          {
            label: "অ্যানালিটিক্স (Google Analytics)",
            text: "আমাদের হোমপেজে ভিজিটরদের ট্রাফিক বুঝতে এবং ইউজার এক্সপেরিয়েন্স উন্নত করতে আমরা Google Analytics ব্যবহার করি। এটি আপনার ব্যক্তিগত গোপনীয়তা অক্ষুণ্ণ রেখে শুধুমাত্র সাধারণ ব্যবহারের পরিসংখ্যান সংগ্রহ করে।",
          },
          {
            label: "পাবলিক প্রোফাইল",
            text: "আপনার Squad এর অন্যান্য সদস্যরা শুধুমাত্র আপনার পাবলিক ইউজারনেম, বর্তমান Level, মোট XP, অর্জিত ব্যাজ এবং Founding Member নম্বর দেখতে পাবেন। আপনার ইমেইল অ্যাড্রেস, ফোন নম্বর এবং পেমেন্টের তথ্য 100% গোপন থাকে।",
          },
        ],
      },
      {
        id: "cookies",
        title: "5. কুকিজ এবং ট্র্যাকিং প্রযুক্তি",
        paragraphs: [
          "Gamlish এর ব্যবহারকারীদের নিরবচ্ছিন্ন অভিজ্ঞতা দেওয়ার জন্য আমরা প্রয়োজনীয় সেশন কুকিজ এবং ট্র্যাকিং প্রযুক্তি ব্যবহার করি। এসেনশিয়াল কুকিজ আপনাকে আপনার অ্যাকাউন্টে লগইন রাখতে সাহায্য করে, যাতে প্রতিটি নতুন Mission শুরু করার সময় আপনাকে বারবার পাসওয়ার্ড দিতে না হয়। এছাড়াও, ভিজিটররা কীভাবে আমাদের ওয়েবসাইট খুঁজে পাচ্ছেন তা বোঝার জন্য আমরা হোমপেজে Google Analytics কুকিজ ব্যবহার করি। আপনি চাইলে আপনার ব্রাউজার সেটিংস থেকে কুকিজ বন্ধ করতে পারেন, তবে এতে অ্যাকাউন্টে লগইন করা বা মিশন প্রগ্রেস সেভ করতে সমস্যা হতে পারে।",
        ],
      },
      {
        id: "security",
        title: "6. ডেটা নিরাপত্তা এবং সংরক্ষণ",
        paragraphs: [
          "আপনার ব্যক্তিগত তথ্য যেকোনো ধরনের অননুমোদিত প্রবেশ বা পরিবর্তন থেকে সুরক্ষিত রাখতে আমরা আধুনিক SSL/TLS এনক্রিপশন, Vercel ও Railway এর মধ্যে সুরক্ষিত API সংযোগ এবং পাসওয়ার্ড হ্যাশিং সহ আধুনিক নিরাপত্তা ব্যবস্থা ব্যবহার করি। যতদিন আপনার Gamlish অ্যাকাউন্টটি সক্রিয় থাকবে, ততদিন আমরা আপনার প্রোফাইল তথ্য, XP এবং শেখার অগ্রগতি সংরক্ষণ করব। এর ফলে আপনি শেখার মাঝে বিরতি নিলেও পরবর্তীতে ফিরে এসে ঠিক যেখান থেকে শেষ করেছিলেন, সেখান থেকেই আপনার রোডম্যাপ শুরু করতে পারবেন।",
        ],
      },
      {
        id: "user-rights",
        title: "7. আপনার গোপনীয়তা অধিকার এবং ডেটা মুছে ফেলা",
        paragraphs: [
          "Gamlish এ আপনার ব্যক্তিগত তথ্যের ওপর আপনার সম্পূর্ণ নিয়ন্ত্রণ রয়েছে। আপনি যেকোনো সময় আপনার অ্যাকাউন্ট ড্যাশবোর্ডে প্রবেশ করে নিজের প্রোফাইল তথ্য, নাম এবং শিক্ষাগত বিবরণ দেখতে ও আপডেট করতে পারবেন।",
        ],
        callout: {
          title: "অ্যাকাউন্ট এবং তথ্য মুছে ফেলার নিয়ম (Data Deletion Request)",
          body: 'আপনি যদি আপনার Gamlish অ্যাকাউন্ট, অর্জিত XP এবং আমাদের Railway সার্ভারে সংরক্ষিত সমস্ত ব্যক্তিগত তথ্য স্থায়ীভাবে মুছে ফেলতে চান, তবে আপনার রেজিস্টার্ড ইমেইল অ্যাড্রেস থেকে আমাদের অফিসিয়াল সাপোর্ট টিমের কাছে একটি ইমেইল পাঠাতে হবে। ইমেইল পাঠাবেন: support@gamlish.com ঠিকানায় এবং Subject লাইনে লিখবেন: "Account Deletion Request"। আমাদের অ্যাডমিন টিম আপনার পরিচয় যাচাই করার পর 7 থেকে 14 কর্মদিবসের মধ্যে আমাদের সক্রিয় ডেটাবেস থেকে আপনার সমস্ত তথ্য স্থায়ীভাবে মুছে ফেলবে। মনে রাখবেন, অ্যাকাউন্ট মুছে ফেলার এই প্রক্রিয়াটি স্থায়ী এবং এটি আর ফিরিয়ে আনা সম্ভব নয়; আপনার সমস্ত অর্জিত XP, ব্যাজ এবং Founding Member স্ট্যাটাস চিরতরে মুছে যাবে।',
        },
      },
      {
        id: "childrens-privacy",
        title: "8. শিশুদের গোপনীয়তা নীতি (13+ বছর)",
        paragraphs: [
          "Gamlish বিভিন্ন শিক্ষাগত ব্যাকগ্রাউন্ডের শিক্ষার্থীদের ইংরেজির ভিত্তি শক্ত করার জন্য তৈরি করা হয়েছে। তবে, আমাদের প্ল্যাটফর্মে স্বাধীনভাবে একটি অ্যাকাউন্ট তৈরি করার জন্য শিক্ষার্থীর বয়স ন্যূনতম 13 বছর হওয়া আবশ্যক। আমরা জেনেশুনে 13 বছরের কম বয়সী কোনো শিশুর কাছ থেকে পিতা-মাতা বা অভিভাবকের স্পষ্ট অনুমতি ছাড়া ব্যক্তিগত তথ্য সংগ্রহ করি না। আপনি যদি একজন অভিভাবক হন এবং জানতে পারেন যে 13 বছরের কম বয়সী আপনার সন্তান আপনার অনুমতি ছাড়া অ্যাকাউন্ট তৈরি করেছে, তবে অনুগ্রহ করে অবিলম্বে আমাদের সঙ্গে support@gamlish.com ঠিকানায় যোগাযোগ করুন। আমরা দ্রুততম সময়ের মধ্যে আমাদের সার্ভার থেকে উক্ত অ্যাকাউন্ট এবং সমস্ত তথ্য মুছে ফেলব।",
        ],
      },
      {
        id: "third-party",
        title: "9. বহিরাগত লিংক এবং এক্সটার্নাল রিসোর্স",
        paragraphs: [
          "আমাদের শিক্ষামূলক ব্লগ পোস্ট, লেসন বা কমিউনিটি ফোরামে মাঝে মাঝে বহিরাগত ওয়েবসাইট, শিক্ষামূলক রেফারেন্স বা সোশ্যাল মিডিয়া প্ল্যাটফর্মের (যেমন আমাদের অফিসিয়াল ইউটিউব চ্যানেল বা ফেসবুক পেজ) লিংক থাকতে পারে। মনে রাখবেন, আপনি যখন কোনো এক্সটার্নাল লিংকে ক্লিক করে Gamlish প্ল্যাটফর্মের বাইরে চলে যাবেন, তখন এই প্রাইভেসি পলিসি আর কার্যকর থাকবে না। বহিরাগত কোনো ওয়েবসাইটের তথ্য সংগ্রহ করার পদ্ধতি বা কনটেন্টের জন্য আমরা দায়ী নই, তাই যেকোনো নতুন ওয়েবসাইট ভিজিট করার সময় তাদের নিজস্ব প্রাইভেসি পলিসি পড়ে নেওয়ার জন্য আমরা পরামর্শ দিচ্ছি।",
        ],
      },
      {
        id: "updates",
        title: "10. এই পলিসির আপডেট",
        paragraphs: [
          "Gamlish এর বৃদ্ধির সঙ্গে সঙ্গে এবং নতুন কোনো Camp, Mission বা ইন্টারেক্টিভ ফিচার যুক্ত হওয়ার পর প্রয়োজন অনুযায়ী আমরা এই প্রাইভেসি পলিসি আপডেট করতে পারি। আমরা যখন আপনার তথ্যের ব্যবহার বা নিরাপত্তায় কোনো গুরুত্বপূর্ণ পরিবর্তন আনব, তখন আপনার রেজিস্টার্ড ইমেইল অ্যাড্রেসে Resend এর মাধ্যমে ইমেইল পাঠিয়ে অথবা আপনার ড্যাশবোর্ডে একটি স্পষ্ট নোটিশ ব্যানার দেখিয়ে আপনাকে জানিয়ে দেওয়া হবে। আমরা কীভাবে আপনার তথ্য সুরক্ষিত রাখছি, তা জানতে মাঝে মাঝে এই পেজটি ভিজিট করার জন্য আমরা উৎসাহিত করছি।",
        ],
        metaLine: "সর্বশেষ আপডেট: জুলাই 2026",
      },
      {
        id: "contact",
        title: "11. আমাদের সঙ্গে যোগাযোগ",
        paragraphs: [
          "এই প্রাইভেসি পলিসি, আপনার লার্নিং ডেটা, অথবা আমাদের Railway ও Vercel টেকনিক্যাল ইনফ্রাস্ট্রাকচার নিয়ে আপনার যদি কোনো প্রশ্ন, জিজ্ঞাসা, মতামত বা অনুরোধ থাকে, তবে নির্দ্বিধায় আমাদের অফিসিয়াল সাপোর্ট টিমের সঙ্গে যোগাযোগ করুন। আমাদের শিক্ষার্থী কমিউনিটিকে স্পষ্ট ও স্বচ্ছ সহযোগিতা প্রদান করতে আমরা সর্বদা প্রস্তুত।",
        ],
        contact: {
          emailLabel: "অফিসিয়াল সাপোর্ট ইমেইল",
          orgLabel: "পরিচালনাকারী প্রতিষ্ঠান",
          orgValue: "Gamlish Educational Platform",
          locationLabel: "অবস্থান",
          locationValue:
            "সিলেট, বাংলাদেশ (বিশ্বব্যাপী বাংলাভাষী শিক্ষার্থীদের জন্য পরিচালিত)",
        },
      },
    ],
  },
};
