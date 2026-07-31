"use client";

import { useState } from "react";
import { ChevronRight, Eye, EyeOff, Loader2, Repeat2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import type { VerbPackDiscover, VerbTrio } from "@/src/lib/verb-pack-discover";

const COPY = {
  bn: {
    eyebrow: "শব্দভাণ্ডার আনলক",
    title: (pack: string) => `Verb Pack ${pack}`,
    subtitle:
      "প্রতিটি verb-এর তিনটি রূপ একসাথে শেখো। Regular নাকি Irregular সেটা এখন বলছি না। তিনটি রূপই মুখস্থ রাখো।",
    countSuffix: "টি verb",
    legendV1: "বর্তমান",
    legendV2: "অতীত",
    legendV3: "Participle",
    hideMeaning: "অর্থ লুকাও",
    showMeaning: "অর্থ দেখাও",
    selfTestHint: "নিজেকে যাচাই করতে অর্থ লুকিয়ে ফেলো",
    sameForms: "একই রূপ",
    footerNote: "পরের ধাপে এই রূপগুলো দিয়েই খেলা হবে। প্রস্তুত হলে এগিয়ে যাও।",
    continue: "খেলা শুরু",
  },
  en: {
    eyebrow: "Vocabulary unlocked",
    title: (pack: string) => `Verb Pack ${pack}`,
    subtitle:
      "Learn all three forms of every verb. We are not labelling regular or irregular yet. Just lock in the three forms.",
    countSuffix: " verbs",
    legendV1: "Present",
    legendV2: "Past",
    legendV3: "Participle",
    hideMeaning: "Hide meanings",
    showMeaning: "Show meanings",
    selfTestHint: "Hide the meanings to test yourself",
    sameForms: "Same forms",
    footerNote: "The next steps turn these forms into a game. Continue when you are ready.",
    continue: "Start playing",
  },
} as const;

const FORM_TONES = {
  v1: "border-slate-400/30 bg-slate-500/10 text-slate-700 dark:text-slate-200",
  v2: "border-amber-400/35 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  v3: "border-emerald-400/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
} as const;

function FormChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: keyof typeof FORM_TONES;
}) {
  return (
    <span
      className={cn(
        "min-w-0 flex-1 rounded-xl border px-2 py-1.5 text-center",
        FORM_TONES[tone],
      )}
    >
      <span className="block text-[9px] font-black uppercase tracking-widest opacity-70">
        {label}
      </span>
      <span className="block truncate text-sm font-bold leading-tight">{value}</span>
    </span>
  );
}

function VerbCard({
  verb,
  index,
  hideMeaning,
  sameFormsLabel,
}: {
  verb: VerbTrio;
  index: number;
  hideMeaning: boolean;
  sameFormsLabel: string;
}) {
  const sameForms =
    verb.v2.length > 0 && verb.v2.toLowerCase() === verb.v3.toLowerCase();

  return (
    <li className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-400/50 hover:shadow-lg hover:shadow-sky-500/5">
      <span
        className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-sky-500/5 transition group-hover:bg-sky-500/10"
        aria-hidden
      />
      <div className="relative flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-[11px] font-black tabular-nums text-sky-700 dark:text-sky-300">
          {String(index).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-lg font-black leading-tight tracking-tight text-foreground">
              {verb.v1}
            </span>
            {sameForms ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                <Repeat2 className="h-3 w-3" />
                {sameFormsLabel}
              </span>
            ) : null}
          </div>
          <p
            className={cn(
              "mt-0.5 truncate text-sm font-medium text-muted-foreground transition",
              hideMeaning && "select-none blur-[6px]",
            )}
          >
            {verb.bn}
          </p>
        </div>
      </div>
      <div className="relative mt-3 flex items-stretch gap-1.5">
        <FormChip label="V1" value={verb.v1} tone="v1" />
        <FormChip label="V2" value={verb.v2} tone="v2" />
        <FormChip label="V3" value={verb.v3} tone="v3" />
      </div>
    </li>
  );
}

export function VerbPackDiscoverStage({
  pack,
  submitting,
  onContinue,
}: {
  pack: VerbPackDiscover;
  submitting: boolean;
  onContinue: () => void;
}) {
  const { locale } = useUiLocale();
  const t = locale === "bn" ? COPY.bn : COPY.en;
  const [hideMeaning, setHideMeaning] = useState(false);
  const packLabel = String(pack.packNumber).padStart(2, "0");

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl border border-sky-400/25 bg-gradient-to-br from-sky-500/12 via-background to-blue-500/10 p-5 sm:p-6">
        <span
          className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-sky-400/15 blur-2xl"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-blue-400/10 blur-2xl"
          aria-hidden
        />
        <div className="relative flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500 text-2xl shadow-lg shadow-sky-500/25">
            🎒
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
              {t.eyebrow}
            </p>
            <h2 className="truncate text-xl font-black leading-tight text-foreground sm:text-2xl">
              {t.title(packLabel)}
            </h2>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-sky-400/30 bg-background/70 px-3 py-1.5 text-xs font-black tabular-nums text-sky-800 dark:text-sky-200">
            <Sparkles className="h-3.5 w-3.5" />
            {pack.verbs.length}
            {t.countSuffix}
          </span>
        </div>

        <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">
          {t.subtitle}
        </p>

        <div className="relative mt-4 flex flex-wrap items-center gap-2">
          <span className={cn("rounded-lg border px-2.5 py-1 text-[11px] font-bold", FORM_TONES.v1)}>
            V1 · {t.legendV1}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden />
          <span className={cn("rounded-lg border px-2.5 py-1 text-[11px] font-bold", FORM_TONES.v2)}>
            V2 · {t.legendV2}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden />
          <span className={cn("rounded-lg border px-2.5 py-1 text-[11px] font-bold", FORM_TONES.v3)}>
            V3 · {t.legendV3}
          </span>
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <p className="hidden text-xs text-muted-foreground sm:block">{t.selfTestHint}</p>
        <button
          type="button"
          onClick={() => setHideMeaning((prev) => !prev)}
          aria-pressed={hideMeaning}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-bold text-foreground transition hover:border-sky-400/50 hover:text-sky-700 dark:hover:text-sky-300"
        >
          {hideMeaning ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          {hideMeaning ? t.showMeaning : t.hideMeaning}
        </button>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {pack.verbs.map((verb, index) => (
          <VerbCard
            key={`${verb.v1}-${index}`}
            verb={verb}
            index={index + 1}
            hideMeaning={hideMeaning}
            sameFormsLabel={t.sameForms}
          />
        ))}
      </ul>

      <p className="rounded-2xl border border-border/50 bg-muted/30 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        {t.footerNote}
      </p>

      <Button
        className="h-14 w-full gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-base font-black text-white shadow-lg shadow-sky-500/25 transition-transform hover:-translate-y-0.5 hover:from-sky-500 hover:to-blue-600"
        size="lg"
        disabled={submitting}
        onClick={onContinue}
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {t.continue}
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
