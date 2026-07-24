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

const ABOUT_COPY: Record<
  UiLocale,
  {
    back: string;
    eyebrow: string;
    title: string;
    tagline: string;
    whoTitle: string;
    whoP1: string;
    whoP2: string;
    getTitle: string;
    getItems: readonly string[];
    contactTitle: string;
    contactBody: string;
    disclaimer: string;
    draftNote: string;
  }
> = {
  bn: {
    back: "হোমে ফিরুন",
    eyebrow: "আমাদের সম্পর্কে",
    title: "Gamlish সম্পর্কে",
    tagline: "ইংরেজি শেখার গেইম",
    whoTitle: "আমরা কে",
    whoP1:
      "Gamlish (গ্যামলিশ) বাংলাদেশি শিক্ষার্থীদের জন্য একটি গ্যামিফাইড English Foundations প্ল্যাটফর্ম। এখানে ইংরেজি শেখা মানে ক্যাম্প, মিশন, মূল্যায়ন আর দেখা যায় এমন অগ্রগতি — খেলার ছলেই ইংরেজি শেখা।",
    whoP2:
      "আমাদের লক্ষ্য: কঠিন পাঠ্যক্রমকে ছোট, পরিষ্কার ধাপে ভাগ করে শিক্ষার্থীকে প্রতিদিন এগোতে সাহায্য করা — যাতে শেখা অভ্যাস হয়ে ওঠে, শুধু পরীক্ষার চাপ নয়।",
    getTitle: "কী পাবেন",
    getItems: [
      "৪টি ক্যাম্প · ২১টি মিশন — ধাপে ধাপে ইংরেজি ফাউন্ডেশন",
      "ডেমো ও ফ্রি মিশন দিয়ে শুরু — তারপর ফুল অ্যাক্সেসের প্রি-অর্ডার",
      "Founding Member সুবিধা প্রাথমিক সদস্যদের জন্য",
      "bKash দিয়ে সহজ ম্যানুয়াল পেমেন্ট (বাংলাদেশ)",
    ],
    contactTitle: "যোগাযোগ",
    contactBody:
      "সাপোর্ট, পেমেন্ট বা অ্যাক্সেস নিয়ে প্রশ্ন থাকলে WhatsApp এ লিখুন। আমরা চ্যাটে রিপ্লাই দিই।",
    disclaimer:
      "Gamlish IDP, British Council বা Cambridge Assessment English এর সাথে সংযুক্ত নয়। IELTS® সংশ্লিষ্ট মালিকদের নিবন্ধিত ট্রেডমার্ক।",
    draftNote: "এই পেজটি খসড়া; পরে আরও পেশাদারভাবে আপডেট করা হবে।",
  },
  en: {
    back: "Back to home",
    eyebrow: "About",
    title: "About Gamlish",
    tagline: "The game of English",
    whoTitle: "Who we are",
    whoP1:
      "Gamlish is a Bangladesh-first platform for English Foundations. Learning is structured as camps and missions with assessment and visible progress — so English feels like a game you can finish, not a wall of textbooks.",
    whoP2:
      "We break hard curricula into clear steps so students can move every day. The goal is habit and confidence, not only exam pressure.",
    getTitle: "What you get",
    getItems: [
      "4 camps · 21 missions — step-by-step English Foundations",
      "Start with demo / free missions, then pre-order full access",
      "Founding Member benefits for early members",
      "Simple manual bKash payment for Bangladesh",
    ],
    contactTitle: "Contact",
    contactBody:
      "For support, payments, or access questions, message us on WhatsApp. We reply in chat.",
    disclaimer:
      "Gamlish is not affiliated with IDP, British Council, or Cambridge Assessment English. IELTS® is a registered trademark of its respective owners.",
    draftNote:
      "This page is a working draft and will be refined with fuller company details later.",
  },
};

export function AboutContent() {
  const { locale } = useUiLocale();
  const copy = ABOUT_COPY[locale];

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
        <p className="max-w-2xl text-muted-foreground">{copy.tagline}</p>
      </div>

      <div className="mt-10 space-y-10">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{copy.whoTitle}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{copy.whoP1}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{copy.whoP2}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{copy.getTitle}</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            {copy.getItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            {copy.contactTitle}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {copy.contactBody}{" "}
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

        <section className="rounded-2xl border border-dashed border-border bg-muted/20 p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {copy.disclaimer}
          </p>
        </section>

        <p className="text-xs text-muted-foreground">{copy.draftNote}</p>
      </div>
    </main>
  );
}
