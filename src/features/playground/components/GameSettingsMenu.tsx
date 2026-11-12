"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BookOpen, Languages, MessageCircle, Settings, Volume2, VolumeX, X } from "lucide-react";
import { setLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import { setAutoVoice } from "@/src/features/playground/hooks/useAutoVoice";
import { PG_UI } from "@/src/features/playground/lib/copy";
import { cn } from "@/lib/utils";

export const ICON_BUTTON =
  "flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 active:scale-95";

const FOCUSABLE = "button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])";

function Row({ icon, children, onClick }: { icon: ReactNode; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[15px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">{icon}</span>
      {children}
    </button>
  );
}

/**
 * Everything that is not gameplay: language, auto voice, the topic notes and a note to Gamlish.
 * A bottom sheet on phones, a popover under the gear on larger screens.
 */
export function GameSettingsMenu({
  lang,
  autoVoice,
  onNotes,
  onHelp,
}: {
  lang: LessonLanguage;
  autoVoice: boolean;
  onNotes?: () => void;
  onHelp?: (origin: { x: number; y: number }) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const face = LANG_FACE[lang];

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !panelRef.current) return;
    const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={pick(PG_UI.settings, lang)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={pick(PG_UI.settings, lang)}
        className={cn(ICON_BUTTON, open && "bg-slate-100 text-slate-800")}
      >
        <Settings className="size-5" aria-hidden />
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              key="backdrop"
              aria-hidden
              onClick={close}
              className="fixed inset-0 z-[70] bg-slate-900/40 sm:bg-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              key="panel"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={pick(PG_UI.settings, lang)}
              onKeyDown={trapFocus}
              className={cn(
                face,
                "fixed inset-x-0 bottom-0 z-[71] rounded-t-3xl bg-white px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3 shadow-2xl",
                "sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 sm:rounded-3xl sm:pb-3 sm:ring-1 sm:ring-slate-200",
              )}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            >
              <span aria-hidden className="mx-auto mb-2 block h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
              <div className="flex items-center justify-between gap-3 px-1">
                <p className="text-lg font-black text-slate-900">{pick(PG_UI.settings, lang)}</p>
                <button
                  type="button"
                  onClick={close}
                  autoFocus
                  aria-label={pick(PG_UI.closeSettings, lang)}
                  title={pick(PG_UI.closeSettings, lang)}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 active:scale-95"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>

              <div className="mt-3 space-y-1">
                <div className="px-3 py-2">
                  <p className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <Languages className="size-4" aria-hidden />
                    {pick(PG_UI.language, lang)}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 ring-1 ring-slate-200">
                    {(["bn", "en"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setLessonLanguage(option)}
                        aria-pressed={lang === option}
                        className={cn(
                          LANG_FACE[option],
                          "h-10 rounded-xl font-bold transition-all",
                          option === "bn" ? "text-[17px]" : "text-base",
                          lang === option ? "bg-white text-accent shadow-sm ring-1 ring-accent/30" : "text-slate-500 hover:text-slate-700",
                        )}
                      >
                        {option === "bn" ? "বাংলা" : "English"}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={autoVoice}
                  onClick={() => setAutoVoice(!autoVoice)}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[15px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    {autoVoice ? <Volume2 className="size-5" aria-hidden /> : <VolumeX className="size-5" aria-hidden />}
                  </span>
                  <span className="flex-1">{pick(PG_UI.autoVoice, lang)}</span>
                  <span
                    aria-hidden
                    className={cn(
                      "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                      autoVoice ? "bg-accent" : "bg-slate-300",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
                        autoVoice ? "left-[1.375rem]" : "left-0.5",
                      )}
                    />
                  </span>
                </button>

                {onNotes ? (
                  <Row
                    icon={<BookOpen className="size-5" aria-hidden />}
                    onClick={() => {
                      setOpen(false);
                      onNotes();
                    }}
                  >
                    {pick(PG_UI.openNotes, lang)}
                  </Row>
                ) : null}

                {onHelp ? (
                  <Row
                    icon={<MessageCircle className="size-5" aria-hidden />}
                    onClick={() => {
                      const rect = triggerRef.current?.getBoundingClientRect();
                      setOpen(false);
                      onHelp(rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : { x: 0, y: 0 });
                    }}
                  >
                    {pick(PG_UI.feedback, lang)}
                  </Row>
                ) : null}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
