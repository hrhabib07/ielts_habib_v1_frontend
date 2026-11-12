"use client";

import { useEffect, useState, type PointerEvent, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Check, Flag, Loader2, MessageCircleHeart, Sparkles, X } from "lucide-react";
import { GuideAvatarPreview } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { useLessonFlags } from "@/src/features/chat-lesson/hooks/useLessonFlags";
import { FEEDBACK_UI, LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import { useAuth } from "@/src/hooks/useAuth";
import {
  LESSON_FEEDBACK_CATEGORIES,
  submitLessonFeedback,
  type LessonFeedbackCategory,
} from "@/src/lib/api/lessonFeedback";
import { cn } from "@/lib/utils";

const SPRING = { type: "spring", stiffness: 380, damping: 32 } as const;
const THANKS_CLOSE_MS = 2400;

function BottomSheet({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        aria-label={label}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-900/40 backdrop-blur-[2px]"
      />
      <motion.section
        role="dialog"
        aria-modal="true"
        className="relative max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={SPRING}
      >
        <span className="mx-auto mt-2.5 block h-1.5 w-12 rounded-full bg-slate-200" aria-hidden />
        {children}
      </motion.section>
    </motion.div>
  );
}

function CloseButton({ lang, onClose }: { lang: LessonLanguage; onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={pick(FEEDBACK_UI.close, lang)}
      className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/80 text-slate-500 transition-colors hover:bg-slate-100"
    >
      <X className="size-5" aria-hidden />
    </button>
  );
}

const PROFILE_SPRING = { type: "spring", stiffness: 340, damping: 30, mass: 0.9 } as const;

/** Social-style profile that grows out of the tapped avatar and shrinks back into it on close. */
export function GamlishProfileCard({
  lang,
  allowFlagging = true,
}: {
  lang: LessonLanguage;
  /** Flagging points at chat messages, so it is hidden where there are none (e.g. the level map). */
  allowFlagging?: boolean;
}) {
  const flags = useLessonFlags();
  if (!flags) return null;
  const face = LANG_FACE[lang];
  const origin = flags.profileOrigin;
  const from = origin
    ? { x: origin.x - window.innerWidth / 2, y: origin.y - window.innerHeight / 2 }
    : { x: 0, y: 60 };
  const collapsed = { opacity: 0, scale: 0.1, x: from.x, y: from.y, borderRadius: 999 };

  return (
    <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4" exit={{ opacity: 1 }}>
      <motion.button
        type="button"
        aria-label={pick(FEEDBACK_UI.close, lang)}
        onClick={flags.closeSheet}
        className="absolute inset-0 cursor-default bg-slate-900/45 backdrop-blur-[3px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label={pick(FEEDBACK_UI.name, lang)}
        className="relative w-full max-w-sm overflow-hidden bg-white shadow-2xl"
        initial={collapsed}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0, borderRadius: 28 }}
        exit={collapsed}
        transition={PROFILE_SPRING}
      >
        <div className="relative h-28 overflow-hidden bg-accent">
          <span className="absolute -right-8 -top-10 size-36 rounded-full bg-white/15" aria-hidden />
          <span className="absolute -left-6 bottom-[-46px] size-28 rounded-full bg-white/10" aria-hidden />
          <button
            type="button"
            onClick={flags.closeSheet}
            aria-label={pick(FEEDBACK_UI.close, lang)}
            className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/30"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="px-5 pb-5">
          <div className="-mt-12 flex items-end justify-between">
            <motion.span
              className="flex size-24 items-center justify-center rounded-full bg-white shadow-lg"
              initial={{ scale: 0.4, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 15, delay: 0.12 }}
            >
              <span className="scale-[2.15]">
                <GuideAvatarPreview />
              </span>
            </motion.span>
            <span
              className={cn(
                face,
                "mb-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200",
              )}
            >
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" aria-hidden />
                <span className="relative size-2 rounded-full bg-emerald-500" aria-hidden />
              </span>
              {pick(FEEDBACK_UI.status, lang)}
            </span>
          </div>

          <h2 className="mt-3 flex items-center gap-1.5 font-sans text-2xl font-black tracking-tight text-slate-900">
            {pick(FEEDBACK_UI.name, lang)}
            <BadgeCheck className="size-6 fill-accent text-white" aria-label="Official" />
          </h2>
          <p className={cn(face, "text-sm font-semibold text-slate-400")}>{pick(FEEDBACK_UI.handle, lang)}</p>

          <p className={cn(face, "mt-3 text-[15px] leading-relaxed text-slate-700")}>{pick(FEEDBACK_UI.bio, lang)}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {FEEDBACK_UI.facts.map((fact) => (
              <span
                key={fact.en}
                className={cn(
                  face,
                  "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-bold text-slate-600",
                )}
              >
                <Sparkles className="size-3 text-amber-500" aria-hidden />
                {pick(fact, lang)}
              </span>
            ))}
          </div>

          <motion.p
            className={cn(
              face,
              "relative mt-4 rounded-2xl rounded-tl-md bg-accent/5 px-4 py-3 text-[15px] font-semibold text-accent ring-1 ring-accent/10",
            )}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {pick(FEEDBACK_UI.ask, lang)}
          </motion.p>

          <div className={cn("mt-4 grid gap-2", allowFlagging && "grid-cols-2")}>
            {allowFlagging ? (
              <ProfileAction
                tone="orange"
                icon={<Flag className="size-4 fill-white" aria-hidden />}
                title={pick(FEEDBACK_UI.flagCta, lang)}
                sub={pick(FEEDBACK_UI.flagCtaSub, lang)}
                lang={lang}
                onClick={flags.startFlagging}
              />
            ) : null}
            <ProfileAction
              tone="sky"
              icon={<MessageCircleHeart className="size-4" aria-hidden />}
              title={pick(FEEDBACK_UI.noteCta, lang)}
              sub={pick(FEEDBACK_UI.noteCtaSub, lang)}
              lang={lang}
              onClick={flags.openFeedback}
            />
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

function ProfileAction({
  tone,
  icon,
  title,
  sub,
  lang,
  onClick,
}: {
  tone: "orange" | "sky";
  icon: ReactNode;
  title: string;
  sub: string;
  lang: LessonLanguage;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center rounded-2xl border-b-4 px-3 py-3 text-center transition-all active:translate-y-0.5 active:border-b-2",
        tone === "orange"
          ? "border-orange-700 bg-orange-500 text-white hover:bg-orange-500/90"
          : "border-accent/20 bg-white text-accent ring-2 ring-inset ring-accent/20 hover:bg-accent/5",
      )}
    >
      <span className={cn(LANG_FACE[lang], "flex items-center gap-1.5 text-[15px] font-black")}>
        {icon}
        {title}
      </span>
      <span
        className={cn(
          LANG_FACE[lang],
          "mt-0.5 text-[11.5px] font-semibold",
          tone === "orange" ? "text-orange-50" : "text-slate-500",
        )}
      >
        {sub}
      </span>
    </button>
  );
}

type DragState = { x: number; y: number } | null;

function refAt(x: number, y: number): string | null {
  return document.elementFromPoint(x, y)?.closest("[data-flag-ref]")?.getAttribute("data-flag-ref") ?? null;
}

/** Replaces the action tray while flagging: a draggable flag plus the flagged count. */
export function FlagModeBar({ lang }: { lang: LessonLanguage }) {
  const flags = useLessonFlags();
  const [drag, setDrag] = useState<DragState>(null);
  if (!flags) return null;
  const face = LANG_FACE[lang];
  const count = flags.flagged.length;

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ x: event.clientX, y: event.clientY });
  };
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    setDrag({ x: event.clientX, y: event.clientY });
    flags.setDragOverRef(refAt(event.clientX, event.clientY));
  };
  const finishDrag = (event: PointerEvent<HTMLButtonElement>, drop: boolean) => {
    if (drop) {
      const ref = refAt(event.clientX, event.clientY);
      const target = ref ? flags.targetFor(ref) : undefined;
      if (target && !flags.isFlagged(target.refId)) flags.toggleFlag(target);
    }
    setDrag(null);
    flags.setDragOverRef(null);
  };

  return (
    <motion.div
      className="shrink-0 border-t-2 border-orange-200 bg-orange-50/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur-md"
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={SPRING}
    >
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={pick(FEEDBACK_UI.dragMe, lang)}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(event) => finishDrag(event, true)}
            onPointerCancel={(event) => finishDrag(event, false)}
            className={cn(
              "flex size-14 shrink-0 touch-none select-none flex-col items-center justify-center rounded-2xl border-b-4 border-orange-700 bg-orange-500 text-white shadow-md transition-transform active:scale-95",
              drag && "opacity-40",
            )}
          >
            <motion.span
              className="flex"
              animate={drag ? { rotate: 0 } : { rotate: [0, -14, 12, -6, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 1.4 }}
            >
              <Flag className="size-6 fill-white" aria-hidden />
            </motion.span>
            <span className={cn(face, "mt-0.5 text-[9px] font-black uppercase leading-none")}>
              {pick(FEEDBACK_UI.dragMe, lang)}
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <p className={cn(face, "text-sm font-black text-orange-900")}>
              {pick(FEEDBACK_UI.flagCount(count), lang)}
            </p>
            <p className={cn(face, "text-xs leading-snug text-orange-800/80")}>{pick(FEEDBACK_UI.flagBarHint, lang)}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-[auto_1fr] gap-2">
          <button
            type="button"
            onClick={() => {
              flags.stopFlagging();
              flags.clearFlags();
            }}
            className={cn(face, "rounded-2xl px-4 py-3 text-sm font-bold text-orange-800 transition-colors hover:bg-orange-100")}
          >
            {pick(FEEDBACK_UI.cancel, lang)}
          </button>
          <button
            type="button"
            onClick={flags.openFeedback}
            className={cn(
              face,
              "flex h-12 items-center justify-center gap-2 rounded-2xl border-b-4 border-orange-700 bg-orange-500 text-base font-extrabold text-white transition-all active:translate-y-0.5 active:border-b-2",
              lang === "en" && "uppercase tracking-wide",
            )}
          >
            {pick(FEEDBACK_UI.writeFeedback, lang)}
          </button>
        </div>
      </div>

      {drag ? (
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-[70] flex size-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-xl ring-4 ring-orange-200"
          initial={false}
          animate={{ x: drag.x - 24, y: drag.y - 40, rotate: -12 }}
          transition={{ duration: 0 }}
          aria-hidden
        >
          <Flag className="size-6 fill-white" />
        </motion.div>
      ) : null}
    </motion.div>
  );
}

type SendState = "idle" | "sending" | "sent" | "error";

export function LessonFeedbackSheet({
  lang,
  stepId,
  stepTitle,
  level,
}: {
  lang: LessonLanguage;
  stepId: string;
  stepTitle: string;
  level: string;
}) {
  const flags = useLessonFlags();
  const { isAuthenticated, isLoading } = useAuth();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<LessonFeedbackCategory[]>([]);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<SendState>("idle");

  const closeSheet = flags?.closeSheet;
  useEffect(() => {
    if (state !== "sent" || !closeSheet) return;
    const timer = window.setTimeout(closeSheet, THANKS_CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [state, closeSheet]);

  if (!flags) return null;
  const face = LANG_FACE[lang];
  const items = flags.flagged;
  const hasContent = items.length > 0 || categories.length > 0 || comment.trim().length > 0;

  const toggleCategory = (category: LessonFeedbackCategory) =>
    setCategories((current) =>
      current.includes(category) ? current.filter((c) => c !== category) : [...current, category],
    );

  const send = async () => {
    if (!hasContent || state === "sending") return;
    setState("sending");
    try {
      await submitLessonFeedback({
        stepId,
        stepTitle,
        level,
        language: lang,
        categories,
        comment: comment.trim() || undefined,
        items: items.map((item) => ({ ...item, note: notes[item.refId]?.trim() || undefined })),
        pagePath: window.location.pathname,
      });
      flags.clearFlags();
      setState("sent");
    } catch {
      setState("error");
    }
  };

  return (
    <BottomSheet label={pick(FEEDBACK_UI.close, lang)} onClose={flags.closeSheet}>
      <CloseButton lang={lang} onClose={flags.closeSheet} />
      <AnimatePresence mode="wait">
        {state === "sent" ? (
          <motion.div
            key="thanks"
            className="px-6 pb-12 pt-10 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.span
              className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg ring-8 ring-emerald-100"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 14 }}
            >
              <Check className="size-10" strokeWidth={3} aria-hidden />
            </motion.span>
            <h2 className={cn(face, "mt-5 text-2xl font-black text-slate-900")}>{pick(FEEDBACK_UI.thanksTitle, lang)}</h2>
            <p className={cn(face, "mt-1 text-[15px] text-slate-600")}>{pick(FEEDBACK_UI.thanksSub, lang)}</p>
          </motion.div>
        ) : (
          <motion.div key="form" className="px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-4" exit={{ opacity: 0 }}>
            <h2 className={cn(face, "pr-10 text-2xl font-black text-slate-900")}>{pick(FEEDBACK_UI.sheetTitle, lang)}</h2>
            <p className={cn(face, "mt-0.5 text-sm text-slate-500")}>{pick(FEEDBACK_UI.sheetSub, lang)}</p>

            {items.length > 0 ? (
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <p className={cn(face, "text-sm font-black text-orange-700")}>
                    {pick(FEEDBACK_UI.flaggedTitle(items.length), lang)}
                  </p>
                  <button
                    type="button"
                    onClick={flags.startFlagging}
                    className={cn(face, "rounded-full px-2.5 py-1 text-xs font-bold text-orange-700 hover:bg-orange-50")}
                  >
                    + {pick(FEEDBACK_UI.flagMore, lang)}
                  </button>
                </div>
                <ul className="mt-2 space-y-2">
                  {items.map((item) => (
                    <li key={item.refId} className="rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-3">
                      <div className="flex items-start gap-2">
                        <Flag className="mt-0.5 size-4 shrink-0 fill-orange-500 text-orange-500" aria-hidden />
                        <div className="min-w-0 flex-1">
                          <p className={cn(face, "text-[11px] font-black uppercase tracking-wider text-orange-700")}>
                            {pick(FEEDBACK_UI.kinds[item.kind], lang)}
                            {item.part ? <span className="font-semibold normal-case tracking-normal text-orange-600/80"> · {item.part}</span> : null}
                          </p>
                          <p className="mt-0.5 line-clamp-3 text-sm text-slate-700">{item.text}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => flags.removeFlag(item.refId)}
                          aria-label="Remove flag"
                          className="flex size-7 shrink-0 items-center justify-center rounded-full text-orange-700 hover:bg-orange-100"
                        >
                          <X className="size-4" aria-hidden />
                        </button>
                      </div>
                      <input
                        value={notes[item.refId] ?? ""}
                        onChange={(event) => setNotes((current) => ({ ...current, [item.refId]: event.target.value }))}
                        maxLength={500}
                        placeholder={pick(FEEDBACK_UI.notePlaceholder, lang)}
                        className={cn(
                          face,
                          "mt-2 w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100",
                        )}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className={cn(face, "mt-5 text-sm font-black text-slate-800")}>{pick(FEEDBACK_UI.reasonsTitle, lang)}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {LESSON_FEEDBACK_CATEGORIES.map((category) => {
                const on = categories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleCategory(category)}
                    className={cn(
                      face,
                      "rounded-full border-2 px-3.5 py-1.5 text-sm font-bold transition-all active:scale-95",
                      on
                        ? "border-accent bg-accent text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-accent/35",
                    )}
                  >
                    {pick(FEEDBACK_UI.categories[category], lang)}
                  </button>
                );
              })}
            </div>

            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={1500}
              rows={3}
              placeholder={pick(FEEDBACK_UI.commentPlaceholder, lang)}
              className={cn(
                face,
                "mt-4 w-full resize-none rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-[15px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-accent/70 focus:bg-white focus:ring-2 focus:ring-accent/10",
              )}
            />

            {state === "error" ? (
              <p className={cn(face, "mt-2 text-sm font-semibold text-rose-600")}>{pick(FEEDBACK_UI.sendError, lang)}</p>
            ) : null}

            {!isLoading && !isAuthenticated ? (
              <div className="mt-4 rounded-2xl bg-accent/5 p-4 text-center ring-1 ring-accent/10">
                <p className={cn(face, "font-black text-slate-900")}>{pick(FEEDBACK_UI.loginTitle, lang)}</p>
                <p className={cn(face, "text-sm text-slate-500")}>{pick(FEEDBACK_UI.loginSub, lang)}</p>
                <Link
                  href="/login"
                  className={cn(
                    face,
                    "mt-3 inline-flex h-11 items-center justify-center rounded-xl border-b-4 border-primary bg-accent px-6 text-sm font-extrabold text-white",
                  )}
                >
                  {pick(FEEDBACK_UI.loginCta, lang)}
                </Link>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={!hasContent || state === "sending" || isLoading}
                  className={cn(
                    face,
                    "mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-2xl border-b-4 text-base font-extrabold transition-all active:translate-y-0.5 active:border-b-2",
                    lang === "en" && "uppercase tracking-wide",
                    hasContent
                      ? "border-emerald-700 bg-emerald-500 text-white hover:bg-emerald-500/90"
                      : "cursor-not-allowed border-slate-300 bg-slate-200 text-slate-400",
                  )}
                >
                  {state === "sending" ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
                  {pick(state === "sending" ? FEEDBACK_UI.sending : FEEDBACK_UI.send, lang)}
                </button>
                {!hasContent ? (
                  <p className={cn(face, "mt-2 text-center text-xs text-slate-400")}>{pick(FEEDBACK_UI.needSomething, lang)}</p>
                ) : null}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
  );
}
