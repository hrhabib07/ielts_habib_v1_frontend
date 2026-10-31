"use client";

import { useSyncExternalStore } from "react";
import type { LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";

const STORAGE_KEY = "gamlish-lab-lesson-language";
const CHANGE_EVENT = "gamlish-lab-language-change";
const DEFAULT_LANGUAGE: LessonLanguage = "en";

function read(): LessonLanguage {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "bn" ? "bn" : "en";
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function setLessonLanguage(lang: LessonLanguage): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** One display language for the whole lesson, remembered across steps. */
export function useLessonLanguage(): LessonLanguage {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_LANGUAGE);
}
