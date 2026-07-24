"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import {
  SUPPORT_WHATSAPP_DISPLAY,
  SUPPORT_WHATSAPP_HREF,
} from "@/src/lib/contact";
import { cn } from "@/lib/utils";
import type { UiLocale } from "@/src/lib/ui-locale";

const PRIVACY_COPY: Record<
  UiLocale,
  {
    back: string;
    eyebrow: string;
    title: string;
    updated: string;
    s1Title: string;
    s1Items: readonly string[];
    s2Title: string;
    s2Items: readonly string[];
    s2Note: string;
    s3Title: string;
    s3Body: string;
    s4Title: string;
    s4Body: string;
    s5Title: string;
    s5Body: string;
    s6Title: string;
    s6Body: string;
    draftNote: string;
    termsLink: string;
  }
> = {
  bn: {
    back: "হোমে ফিরুন",
    eyebrow: "আইনগত",
    title: "গোপনীয়তা নীতি",
    updated: "সর্বশেষ আপডেট: জুলাই ২০২৬",
    s1Title: "১. আমরা কী সংগ্রহ করি",
    s1Items: [
      "অ্যাকাউন্ট তথ্য (নাম, ইমেইল, ফোন — যেগুলো আপনি দেন)",
      "শেখার অগ্রগতি ও ব্যবহারের ডেটা (মিশন, স্কোর, সেশন)",
      "পেমেন্ট প্রুফ (bKash নম্বর, Transaction ID, পরিমাণ) — সাবস্ক্রিপশন যাচাইয়ের জন্য",
      "ডিভাইস/ব্রাউজার সম্পর্কিত সাধারণ লগ (সার্ভিস চালু ও নিরাপত্তার জন্য)",
    ],
    s2Title: "২. কীভাবে ব্যবহার করি",
    s2Items: [
      "অ্যাকাউন্ট ও সাবস্ক্রিপশন পরিচালনা",
      "শেখার অভিজ্ঞতা ও প্রোডাক্ট উন্নতি",
      "পেমেন্ট যাচাই ও সাপোর্ট",
      "গুরুত্বপূর্ণ নোটিশ (ইমেইল/ইন-অ্যাপ) পাঠানো",
    ],
    s2Note: "আমরা আপনার ব্যক্তিগত ডেটা বিক্রি করি না।",
    s3Title: "৩. শেয়ারিং",
    s3Body:
      "সার্ভিস চালাতে প্রয়োজনীয় প্রোভাইডারদের (যেমন হোস্টিং, ইমেইল) সাথে সীমিত ডেটা শেয়ার হতে পারে। আইনি বাধ্যবাধকতা ছাড়া আমরা আপনার ডেটা তৃতীয় পক্ষের কাছে বাণিজ্যিকভাবে বিক্রি বা ভাড়া দিই না।",
    s4Title: "৪. কুকি ও অ্যানালিটিক্স",
    s4Body:
      "লগইন সেশন ও সাইটের কার্যকারিতার জন্য কুকি/লোকাল স্টোরেজ ব্যবহার হতে পারে। বিজ্ঞাপন পরিমাপের জন্য (যেমন Meta Pixel) পেজ ভিউ ট্র্যাক করা হতে পারে — যাতে আমরা জানতে পারি কোন ক্যাম্পেইন থেকে কেউ চেকআউট বা পেমেন্ট সাবমিট করেছে।",
    s5Title: "৫. আপনার অধিকার",
    s5Body:
      "অ্যাকাউন্ট তথ্য আপডেট, ডেটা সম্পর্কে প্রশ্ন, বা ডিলিট রিকোয়েস্টের জন্য WhatsApp এ যোগাযোগ করুন:",
    s6Title: "৬. পরিবর্তন",
    s6Body: "এই নীতি আপডেট হতে পারে। গুরুত্বপূর্ণ পরিবর্তন সাইটে প্রকাশ করা হবে।",
    draftNote: "এটি বর্তমান প্রোডাক্টের জন্য খসড়া নীতি। পরে পূর্ণ আইনি রিভিউ হতে পারে।",
    termsLink: "শর্তাবলি দেখুন →",
  },
  en: {
    back: "Back to home",
    eyebrow: "Legal",
    title: "Privacy Policy",
    updated: "Last updated: July 2026",
    s1Title: "1. What we collect",
    s1Items: [
      "Account details you provide (name, email, phone)",
      "Learning progress and usage data (missions, scores, sessions)",
      "Payment proof (bKash number, Transaction ID, amount) to verify subscriptions",
      "Basic device/browser logs needed to run and secure the service",
    ],
    s2Title: "2. How we use data",
    s2Items: [
      "Operate accounts and subscriptions",
      "Improve learning outcomes and the product",
      "Verify payments and provide support",
      "Send important notices (email / in-app)",
    ],
    s2Note: "We do not sell your personal data.",
    s3Title: "3. Sharing",
    s3Body:
      "We may share limited data with providers needed to run the service (e.g. hosting, email). We do not sell or rent your personal data for commercial marketing, except where required by law.",
    s4Title: "4. Cookies & analytics",
    s4Body:
      "We may use cookies or local storage for login sessions and site function. Advertising measurement tools (e.g. Meta Pixel) may track page views so we can see which campaigns lead to checkout or payment submission.",
    s5Title: "5. Your rights",
    s5Body:
      "To update account details, ask about your data, or request deletion, contact us on WhatsApp:",
    s6Title: "6. Changes",
    s6Body:
      "We may update this policy. Material changes will be posted on this page.",
    draftNote:
      "Draft policy for current product operations. A fuller legal review can follow later.",
    termsLink: "See Terms →",
  },
};

export function PrivacyContent() {
  const { locale } = useUiLocale();
  const copy = PRIVACY_COPY[locale];

  return (
    <main
      className={cn(
        "mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16",
        locale === "bn" && "font-bengali",
      )}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <Button
        variant="ghost"
        size="sm"
        className="mb-8 -ml-2 gap-2 text-muted-foreground"
        asChild
      >
        <Link href="/">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {copy.back}
        </Link>
      </Button>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {copy.eyebrow}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {copy.title}
        </h1>
        <p className="text-sm text-muted-foreground">{copy.updated}</p>
      </div>

      <div className="mt-10 space-y-10">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{copy.s1Title}</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            {copy.s1Items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{copy.s2Title}</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            {copy.s2Items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {copy.s2Note}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{copy.s3Title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {copy.s3Body}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{copy.s4Title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {copy.s4Body}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{copy.s5Title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {copy.s5Body}{" "}
            <a
              href={SUPPORT_WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              {SUPPORT_WHATSAPP_DISPLAY}
            </a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{copy.s6Title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {copy.s6Body}
          </p>
        </section>

        <p className="text-xs text-muted-foreground">
          {copy.draftNote}{" "}
          <Link href="/terms" className="font-medium text-primary hover:underline">
            {copy.termsLink}
          </Link>
        </p>
      </div>
    </main>
  );
}
