"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { GamlishLogo } from "@/src/components/shared/GamlishLogo";
import { SocialLinks } from "@/src/components/shared/SocialLinks";
import {
  SUPPORT_WHATSAPP_DISPLAY,
  SUPPORT_WHATSAPP_HREF,
} from "@/src/lib/contact";
import { useSiteShellCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

/**
 * Compact closing band for the guest marketing homepage.
 * Main site Footer is hidden on `/`, so social presence lives here.
 */
export function GuestLandingFooter() {
  const shell = useSiteShellCopy();
  const { locale } = useUiLocale();
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "relative border-t border-border/60 bg-muted/25",
        locale === "bn" && "font-bengali",
      )}
    >
      <div className="mx-auto max-w-5xl px-4 py-12 pb-24 sm:px-6 sm:py-14 sm:pb-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm space-y-3">
            <GamlishLogo iconMark className="text-lg" />
            <p className="text-sm leading-relaxed text-foreground/75">
              {shell.footerBlurb}
            </p>
            <p className="text-sm font-semibold text-primary">
              {shell.footerTagline}
            </p>
          </div>

          <div className="flex flex-col gap-8 sm:items-end">
            <SocialLinks label={shell.followGamlish} />
            <a
              href={SUPPORT_WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2.5 text-sm font-semibold text-sky-900 transition-colors hover:bg-sky-500/15 dark:text-sky-100"
            >
              <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
              WhatsApp {SUPPORT_WHATSAPP_DISPLAY}
            </a>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border/60 bg-muted/40 p-5 text-center">
          <p className="text-base font-bold text-foreground">
            {locale === "bn"
              ? "পূর্ণ কোর্স চান? VIP অ্যাক্সেস নিন"
              : "Want the full course? Take VIP access"}
          </p>
          <Link
            href="/pricing"
            className="mt-3 inline-flex h-12 w-full max-w-xs items-center justify-center rounded-2xl bg-foreground px-6 text-base font-bold text-background transition-opacity hover:opacity-90"
          >
            {locale === "bn" ? "VIP হিসেবে যোগ দিন" : "Join as VIP"}
          </Link>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border/50 pt-6 text-xs text-foreground/65 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <p>{shell.footerRights(year)}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link
              href="/pricing"
              className="font-semibold text-amber-800 transition-colors hover:text-foreground dark:text-amber-300"
            >
              {shell.plansPricing}
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-foreground"
            >
              {shell.about}
            </Link>
            <Link
              href="/login"
              className="transition-colors hover:text-foreground"
            >
              {shell.login}
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-foreground"
            >
              {shell.terms}
            </Link>
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-foreground"
            >
              {shell.privacy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
