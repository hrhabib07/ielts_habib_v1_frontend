"use client";

import { useEffect, useState } from "react";
import { getPublicLearnerFeedback } from "@/src/lib/api/learnerFeedback";
import type { LearnerFeedbackPublicItem } from "@/src/lib/learner-feedback";
import { LearnerFeedbackCard } from "@/src/components/feedback/LearnerFeedbackCard";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { cn } from "@/lib/utils";

export function GuestLearnerStoriesStrip() {
  const { locale } = useGuestLandingLocale();
  const [items, setItems] = useState<LearnerFeedbackPublicItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    void getPublicLearnerFeedback(12)
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (items.length === 0) return null;

  const isBn = locale === "bn";

  return (
    <section
      className={cn(
        "relative border-y border-border/50 bg-muted/20 px-4 py-10 sm:py-12",
        isBn && "font-bengali",
      )}
      lang={locale}
      aria-label={isBn ? "লার্নার স্টোরিজ" : "Learner stories"}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
            {isBn ? "রিয়েল লার্নার স্টোরি" : "Real learner stories"}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {isBn ? "যারা আগেই জয়েন করেছেন" : "Learners who already joined"}
          </h2>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <LearnerFeedbackCard
              key={item.id}
              displayName={item.displayName}
              title={item.title}
              rating={item.rating}
              body={item.body}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
