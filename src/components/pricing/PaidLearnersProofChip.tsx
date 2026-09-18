"use client";

import { GRADUATE_PROOF_PHOTOS } from "@/src/lib/social-proof-photos";
import { lifetimePaidProofLine } from "@/src/lib/monthly-offer-copy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import type { UiLocale } from "@/src/lib/ui-locale";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Override when the page locale is not UiLocaleContext (rare). */
  locale?: UiLocale;
};

/**
 * Canonical 40+ paid proof chip. Use this on every public conversion surface.
 */
export function PaidLearnersProofBar({
  className,
  locale,
}: {
  className?: string;
  locale?: UiLocale;
}) {
  return (
    <div
      className={cn(
        "flex w-full justify-center border-b border-sky-500/20 bg-sky-500/[0.07] px-3 py-2 dark:border-sky-400/20 dark:bg-sky-400/[0.08]",
        className,
      )}
    >
      <PaidLearnersProofChip className="max-w-full" locale={locale} />
    </div>
  );
}

export function PaidLearnersProofChip({ className, locale: localeProp }: Props) {
  const { locale: ctxLocale } = useUiLocale();
  const locale = localeProp ?? ctxLocale;
  const line = lifetimePaidProofLine(locale);

  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-1",
        locale === "bn" && "font-bengali",
        className,
      )}
      role="status"
    >
      <div className="flex shrink-0 -space-x-1.5" aria-hidden>
        {GRADUATE_PROOF_PHOTOS.map((photo) => (
          <span
            key={photo.src}
            className="inline-flex h-6 w-6 overflow-hidden rounded-full border border-background bg-sky-800"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt=""
              width={24}
              height={24}
              className="h-full w-full object-cover"
            />
          </span>
        ))}
      </div>
      <p className="min-w-0 text-left text-xs font-semibold leading-snug text-sky-950 dark:text-sky-100 sm:text-sm">
        {line}
      </p>
    </div>
  );
}
