"use client";

import { BadgeCheck, Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { FounderAvatar } from "@/src/components/shared/FounderAvatar";
import { useGuestHomeSectionsCopy } from "@/src/components/home/guest/useGuestHomeSectionsCopy";
import { cn } from "@/lib/utils";

export function GuestCompareFounder() {
  const copy = useGuestHomeSectionsCopy();
  const reduceMotion = useReducedMotion();
  const headers = copy.compareHeaders;

  return (
    <section
      className="relative border-y border-border/40 bg-muted/30 py-14 dark:bg-muted/15 sm:py-16 md:py-20"
      aria-labelledby="guest-compare-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: GUEST_EASE }}
        >
          <h2
            id="guest-compare-title"
            className="text-center text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            {copy.compareTitle}
          </h2>

          {/* Mobile: stacked feature cards (readable, no horizontal squeeze) */}
          <ul className="mt-8 space-y-4 md:hidden" aria-label={copy.compareTitle}>
            {copy.compareRows.map((row) => (
              <li
                key={row.feature}
                className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm"
              >
                <div className="border-b border-border/70 bg-muted/40 px-4 py-3">
                  <h3 className="text-sm font-bold text-foreground">
                    {row.feature}
                  </h3>
                </div>

                <div className="space-y-0 divide-y divide-border/60">
                  <CompareMobileRow
                    label={headers.traditional}
                    value={row.traditional}
                  />
                  <CompareMobileRow
                    label={headers.apps}
                    value={row.apps}
                  />
                  <div className="relative bg-sky-500/[0.08] px-4 py-3.5 dark:bg-sky-400/[0.1]">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                        {headers.gamlish}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        <Check className="h-3 w-3" aria-hidden />
                        {headers.recommended}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-foreground">
                      {row.gamlish}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop / tablet: full comparison table */}
          <div className="mt-8 hidden overflow-visible md:block">
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/50 shadow-sm">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="w-[18%] px-4 py-4 font-semibold text-foreground">
                      {headers.feature}
                    </th>
                    <th className="w-[24%] px-4 py-4 font-semibold text-muted-foreground">
                      {headers.traditional}
                    </th>
                    <th className="w-[24%] px-4 py-4 font-semibold text-muted-foreground">
                      {headers.apps}
                    </th>
                    <th className="w-[34%] bg-sky-500/10 px-4 py-4 dark:bg-sky-400/10">
                      <div className="flex flex-col items-start gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                          <Check className="h-3 w-3" aria-hidden />
                          {headers.recommended}
                        </span>
                        <span className="font-semibold text-sky-800 dark:text-sky-200">
                          {headers.gamlish}
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {copy.compareRows.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-b border-border/70 last:border-0"
                    >
                      <th
                        scope="row"
                        className="px-4 py-4 align-top font-semibold text-foreground"
                      >
                        {row.feature}
                      </th>
                      <td className="px-4 py-4 align-top leading-relaxed text-muted-foreground">
                        {row.traditional}
                      </td>
                      <td className="px-4 py-4 align-top leading-relaxed text-muted-foreground">
                        {row.apps}
                      </td>
                      <td className="bg-sky-500/[0.07] px-4 py-4 align-top font-medium leading-relaxed text-foreground dark:bg-sky-400/[0.09]">
                        {row.gamlish}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        <motion.blockquote
          className="mx-auto mt-10 max-w-3xl rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-500/[0.08] to-transparent p-5 sm:p-7"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, delay: 0.08, ease: GUEST_EASE }}
        >
          <p className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-200">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
            {copy.founderBadge}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-foreground/90 sm:text-[15px]">
            &ldquo;{copy.founderQuote}&rdquo;
          </p>
          <footer className="mt-5 flex items-center gap-3">
            <FounderAvatar size={44} className="rounded-xl" />
            <div>
              <cite className="not-italic text-sm font-semibold text-foreground">
                {copy.founderSign}
              </cite>
            </div>
          </footer>
        </motion.blockquote>
      </div>
    </section>
  );
}

function CompareMobileRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-foreground/85">{value}</p>
    </div>
  );
}
