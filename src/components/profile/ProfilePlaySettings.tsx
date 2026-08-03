"use client";

import { Card } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { useAutoAdvanceCorrectSetting } from "@/src/hooks/useAutoAdvanceCorrect";

const COPY = {
  bn: {
    title: "খেলার সেটিংস",
    hint: "মিশন প্রশ্নের পর কীভাবে এগোবে তা নিয়ন্ত্রণ করো।",
    label: "সঠিক উত্তরের পর স্বয়ংক্রিয়ভাবে এগিয়ে যাও",
    description:
      "চালু থাকলে সঠিক উত্তরের পর দ্রুত পরের প্রশ্নে যাবে। বন্ধ করলে তুমি Next চাপার আগ পর্যন্ত অপেক্ষা করবে। ভুল উত্তরে সবসময় Continue লাগবে।",
    on: "চালু",
    off: "বন্ধ",
  },
  en: {
    title: "Play settings",
    hint: "Control how you move forward after mission questions.",
    label: "Auto-advance after correct answers",
    description:
      "When on, correct answers move to the next question quickly. When off, you stay until you tap Next. Wrong answers always wait for Continue.",
    on: "On",
    off: "Off",
  },
} as const;

export function ProfilePlaySettings() {
  const { locale } = useUiLocale();
  const copy = COPY[locale === "bn" ? "bn" : "en"];
  const { enabled, setEnabled } = useAutoAdvanceCorrectSetting();

  return (
    <Card className="border-border/70 p-6 shadow-sm md:p-8">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
          {copy.title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {copy.hint}
        </p>
      </div>

      <div
        className={cn(
          "flex items-center justify-between gap-4 rounded-xl border border-border/70 px-4 py-3.5 transition-colors",
          enabled ? "bg-muted/10" : "bg-muted/20",
        )}
      >
        <div className="flex min-w-0 items-start gap-3">
          <Zap
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0",
              enabled ? "text-primary" : "text-muted-foreground",
            )}
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{copy.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {copy.description}
            </p>
            <p className="mt-1.5 text-xs font-medium text-foreground/80">
              {enabled ? copy.on : copy.off}
            </p>
          </div>
        </div>
        <input
          id="auto-advance-correct-toggle"
          type="checkbox"
          role="switch"
          aria-checked={enabled}
          aria-label={copy.label}
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-5 w-5 shrink-0 cursor-pointer rounded border-border accent-primary"
        />
      </div>
    </Card>
  );
}
