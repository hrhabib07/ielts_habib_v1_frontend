"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Sparkles,
  Trophy,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import {
  MASTER_PATH_MODAL_STORAGE_KEY,
  MASTER_PATH_UI_COPY,
} from "@/src/lib/master-path-ui-copy";
import { cn } from "@/lib/utils";

const MISSION_02_SLUG = "mission-02-meet-the-words";

export function MasterPathModal({
  missionSlug,
  enabled,
}: {
  missionSlug: string;
  enabled: boolean;
}) {
  const { locale } = useUiLocale();
  const reduce = useReducedMotion();
  const copy = useMemo(() => MASTER_PATH_UI_COPY[locale], [locale]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled || missionSlug !== MISSION_02_SLUG) return;
    try {
      if (localStorage.getItem(MASTER_PATH_MODAL_STORAGE_KEY) === "1") return;
    } catch {
      /* ignore storage errors */
    }
    setOpen(true);
  }, [enabled, missionSlug]);

  const dismiss = () => {
    try {
      localStorage.setItem(MASTER_PATH_MODAL_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-3 sm:items-center sm:p-6"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="master-path-title"
        >
          <motion.div
            className={cn(
              "max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-amber-400/30 bg-card shadow-2xl",
              locale === "bn" && "font-bengali",
            )}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: 16 }}
          >
            <div className="bg-gradient-to-br from-amber-400/20 via-card to-sky-500/15 px-5 pb-5 pt-6 sm:px-6">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-900 dark:text-amber-200">
                <Sparkles className="h-3.5 w-3.5" />
                {copy.eyebrow}
              </p>
              <h2
                id="master-path-title"
                className="mt-3 text-xl font-black tracking-tight sm:text-2xl"
              >
                {copy.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{copy.lead}</p>

              <div className="mt-5 space-y-4">
                <section className="rounded-2xl border border-amber-400/30 bg-card/80 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold">
                    <Trophy className="h-4 w-4 text-amber-600" />
                    {copy.whyTitle}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {copy.whyBody}
                  </p>
                </section>

                <section className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4">
                  <p className="text-sm font-bold">{copy.rewardTitle}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {copy.rewardBody}
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-300">
                    {copy.conditionsTitle}
                  </p>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                      <span>{copy.conditionMaster}</span>
                    </li>
                    <li className="flex gap-2">
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                      <span>{copy.conditionMonth}</span>
                    </li>
                  </ul>
                </section>

                <section className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                  <p className="text-sm font-bold">{copy.tipsTitle}</p>
                  <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                      <span>{copy.tipLearn}</span>
                    </li>
                    <li className="flex gap-2">
                      <Video className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                      <span>{copy.tipVideo}</span>
                    </li>
                    <li className="flex gap-2">
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                      <span>{copy.tipPace}</span>
                    </li>
                    <li className="flex gap-2">
                      <Brain className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                      <span>{copy.tipBrain}</span>
                    </li>
                    <li className="flex gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                      <span>{copy.tipHonesty}</span>
                    </li>
                  </ul>
                </section>
              </div>

              <Button
                type="button"
                className="mt-5 w-full rounded-full bg-amber-500 font-bold text-amber-950 hover:bg-amber-400"
                size="lg"
                onClick={dismiss}
              >
                {copy.cta}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
