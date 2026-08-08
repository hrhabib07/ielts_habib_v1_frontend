"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function LearnerFeedbackCard({
  displayName,
  title,
  rating,
  body,
  className,
  pendingBadge,
}: {
  displayName: string;
  title: string;
  rating: number;
  body: string;
  className?: string;
  pendingBadge?: boolean;
}) {
  const stars = Math.min(5, Math.max(0, Math.round(rating)));
  const name = displayName.trim() || "Learner";
  const role = title.trim() || "লার্নার";
  const text = body.trim() || "তোমার মতামত এখানে দেখা যাবে…";

  return (
    <article
      className={cn(
        "rounded-2xl border border-border/70 bg-card/90 p-4 text-left shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-sans text-sm font-black text-foreground">
            {name}
          </p>
          <p className="mt-0.5 font-bengali text-xs font-semibold text-muted-foreground">
            {role}
          </p>
        </div>
        {pendingBadge ? (
          <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200">
            Pending
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex items-center gap-0.5" aria-label={`${stars} of 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < stars
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        ))}
      </div>
      <p className="mt-3 font-bengali text-sm leading-relaxed text-foreground/90">
        {text}
      </p>
    </article>
  );
}
