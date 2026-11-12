"use client";

import { useSyncExternalStore } from "react";
import { UI_LOCALE_STORAGE_KEY, writeStoredUiLocale, type UiLocale } from "@/src/lib/ui-locale";

/** The game used its own key before the site and the game shared one language. */
const LEGACY_GAME_KEY = "gamlish-lab-lesson-language";
export const SITE_LANGUAGE_CHANGE_EVENT = "gamlish-ui-locale-change";
/** Most learners are beginners: Bangla until they choose English. */
export const DEFAULT_SITE_LANGUAGE: UiLocale = "bn";

function asLanguage(value: string | null): UiLocale | null {
  return value === "bn" || value === "en" ? value : null;
}

/** One language for every page (landing, login, profile, games, notes), kept after logout. */
export function readSiteLanguage(): UiLocale {
  try {
    return (
      asLanguage(window.localStorage.getItem(UI_LOCALE_STORAGE_KEY)) ??
      asLanguage(window.localStorage.getItem(LEGACY_GAME_KEY)) ??
      DEFAULT_SITE_LANGUAGE
    );
  } catch {
    return DEFAULT_SITE_LANGUAGE;
  }
}

export function setSiteLanguage(language: UiLocale): void {
  writeStoredUiLocale(language);
  try {
    window.localStorage.setItem(LEGACY_GAME_KEY, language);
  } catch {
    return;
  }
  window.dispatchEvent(new Event(SITE_LANGUAGE_CHANGE_EVENT));
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(SITE_LANGUAGE_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SITE_LANGUAGE_CHANGE_EVENT, onChange);
  };
}

export function useSiteLanguage(): UiLocale {
  return useSyncExternalStore(subscribe, readSiteLanguage, () => DEFAULT_SITE_LANGUAGE);
}
