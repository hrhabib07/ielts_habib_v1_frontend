"use client";

import type { LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import { setSiteLanguage, useSiteLanguage } from "@/src/lib/site-language";

/** The game follows the site language: switching in either place changes both. */
export function setLessonLanguage(lang: LessonLanguage): void {
  setSiteLanguage(lang);
}

export function useLessonLanguage(): LessonLanguage {
  return useSiteLanguage();
}
