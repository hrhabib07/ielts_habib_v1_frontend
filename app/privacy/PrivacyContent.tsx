"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import {
  SUPPORT_EMAIL,
  SUPPORT_EMAIL_HREF,
} from "@/src/lib/contact";
import { PRIVACY_PAGE_COPY } from "@/src/lib/privacy-page-copy";
import { cn } from "@/lib/utils";

function linkifySupportEmail(text: string): ReactNode {
  if (!text.includes(SUPPORT_EMAIL)) return text;
  const parts = text.split(SUPPORT_EMAIL);
  return parts.reduce<ReactNode[]>((acc, part, i) => {
    acc.push(part);
    if (i < parts.length - 1) {
      acc.push(
        <a
          key={`email-${i}`}
          href={SUPPORT_EMAIL_HREF}
          className="font-semibold text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
        >
          {SUPPORT_EMAIL}
        </a>,
      );
    }
    return acc;
  }, []);
}

export function PrivacyContent() {
  const { locale } = useUiLocale();
  const copy = PRIVACY_PAGE_COPY[locale];

  return (
    <main
      className={cn(
        "relative isolate",
        locale === "bn" && "font-bengali",
      )}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(56,189,248,0.12),transparent_60%)]"
        aria-hidden
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16">
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

        <header className="space-y-3">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-800 dark:text-sky-200">
            <Shield className="h-3.5 w-3.5" aria-hidden />
            Privacy
          </p>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {copy.title}
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {copy.subtitle}
          </p>
          <p className="text-sm font-medium text-foreground/70">
            {copy.lastUpdated}
          </p>
        </header>

        {/* Table of contents */}
        <nav
          aria-label={copy.tocTitle}
          className="mt-10 rounded-2xl border border-border/80 bg-muted/30 p-5 sm:p-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
            {copy.tocTitle}
          </h2>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2">
            {copy.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="block rounded-lg px-2 py-1.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-sky-500/10 hover:text-sky-800 dark:hover:text-sky-200"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-12 space-y-12">
          {copy.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24"
              aria-labelledby={`${section.id}-heading`}
            >
              <h2
                id={`${section.id}-heading`}
                className="border-l-4 border-sky-500 pl-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
              >
                {section.title}
              </h2>

              {section.paragraphs?.map((para) => (
                <p
                  key={para.slice(0, 40)}
                  className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground"
                >
                  {linkifySupportEmail(para)}
                </p>
              ))}

              {section.bullets ? (
                <ul className="mt-5 space-y-3">
                  {section.bullets.map((item) => (
                    <li
                      key={item.label}
                      className="rounded-xl border border-border/70 bg-card/40 px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {item.text}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : null}

              {section.callout ? (
                <aside className="mt-5 rounded-xl border border-amber-500/35 bg-amber-500/[0.08] p-5 sm:p-6">
                  <h3 className="text-base font-semibold text-foreground">
                    {section.callout.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                    {linkifySupportEmail(section.callout.body)}
                  </p>
                </aside>
              ) : null}

              {section.metaLine ? (
                <p className="mt-4 text-sm font-semibold text-foreground/80">
                  {section.metaLine}
                </p>
              ) : null}

              {section.contact ? (
                <div className="mt-6 rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/10 to-transparent p-5 sm:p-7">
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="font-semibold text-foreground">
                        {section.contact.emailLabel}
                      </dt>
                      <dd className="mt-1">
                        <a
                          href={SUPPORT_EMAIL_HREF}
                          className="font-semibold text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
                        >
                          {SUPPORT_EMAIL}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-foreground">
                        {section.contact.orgLabel}
                      </dt>
                      <dd className="mt-1 text-muted-foreground">
                        {section.contact.orgValue}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-foreground">
                        {section.contact.locationLabel}
                      </dt>
                      <dd className="mt-1 text-muted-foreground">
                        {section.contact.locationValue}
                      </dd>
                    </div>
                  </dl>
                  <Button
                    className="mt-6 h-11 rounded-xl bg-sky-600 text-white hover:bg-sky-500"
                    asChild
                  >
                    <a href={SUPPORT_EMAIL_HREF}>
                      <Mail className="mr-2 h-4 w-4" aria-hidden />
                      {copy.emailCta}
                    </a>
                  </Button>
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
