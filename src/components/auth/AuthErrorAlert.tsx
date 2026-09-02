"use client";

import { MessageCircle } from "lucide-react";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import {
  SUPPORT_WHATSAPP_DISPLAY,
  supportWhatsAppHrefWithText,
} from "@/src/lib/contact";
import { cn } from "@/lib/utils";

const COPY = {
  en: {
    hint: "Take a screenshot, then message us on WhatsApp. We will help you in.",
    cta: "WhatsApp us",
    prefill: (page: string, message: string) =>
      `Gamlish error\nPage: ${page}\nMessage: ${message}\nI am sending a screenshot.`,
  },
  bn: {
    hint: "একটা স্ক্রিনশট নিন, তারপর WhatsApp-এ পাঠান। আমরা আপনাকে ঢুকতে সাহায্য করব।",
    cta: "WhatsApp করুন",
    prefill: (page: string, message: string) =>
      `Gamlish error\nPage: ${page}\nMessage: ${message}\nআমি স্ক্রিনশট পাঠাচ্ছি।`,
  },
} as const;

export function AuthErrorAlert({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  const { locale } = useUiLocale();
  const copy = COPY[locale];
  const page =
    typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : "/";
  const href = supportWhatsAppHrefWithText(copy.prefill(page, message.trim()));

  return (
    <div
      className={cn(
        "rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2.5",
        className,
      )}
      role="alert"
    >
      <p className="text-sm text-destructive">{message}</p>
      <p className="mt-2 text-[12px] leading-relaxed text-destructive/90">
        {copy.hint}{" "}
        <span className="font-semibold tabular-nums">{SUPPORT_WHATSAPP_DISPLAY}</span>
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-3 text-[12px] font-semibold text-white hover:bg-[#1ebe5d]"
      >
        <MessageCircle className="h-3.5 w-3.5" aria-hidden />
        {copy.cta}
      </a>
    </div>
  );
}
