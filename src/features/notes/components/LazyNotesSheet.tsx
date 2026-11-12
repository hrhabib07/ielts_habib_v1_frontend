"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { pick } from "@/src/features/chat-lesson/lib/uiCopy";
import { NOTES_UI } from "@/src/features/notes/copy";

const loadNotesSheet = () => import("@/src/features/notes/components/NotesSheet");

function NotesLoading() {
  const lang = useLessonLanguage();
  return (
    <div
      role="status"
      aria-label={pick(NOTES_UI.loading, lang)}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background"
    >
      <Loader2 className="size-8 animate-spin text-accent" aria-hidden />
    </div>
  );
}

/** Lesson content and clips stay out of the game bundle until a learner opens the notes. */
export const LazyNotesSheet = dynamic(loadNotesSheet, { ssr: false, loading: () => <NotesLoading /> });

/** Starts downloading the notes early, e.g. when a Learn button is on screen. */
export function preloadNotesSheet(): void {
  void loadNotesSheet();
}
