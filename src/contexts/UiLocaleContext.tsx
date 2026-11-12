"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { setSiteLanguage, SITE_LANGUAGE_CHANGE_EVENT, useSiteLanguage } from "@/src/lib/site-language";
import type { UiLocale } from "@/src/lib/ui-locale";

export const UI_LOCALE_CHANGE_EVENT = SITE_LANGUAGE_CHANGE_EVENT;

interface UiLocaleContextValue {
  locale: UiLocale;
  setLocale: (locale: UiLocale) => void;
}

const UiLocaleContext = createContext<UiLocaleContextValue | null>(null);

/** Site language (Bangla by default), shared with the game and remembered after logout. */
export function UiLocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSiteLanguage();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.body.classList.toggle("font-bengali", locale === "bn");
    document.body.classList.toggle("font-sans", locale === "en");
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale: setSiteLanguage }), [locale]);

  return <UiLocaleContext.Provider value={value}>{children}</UiLocaleContext.Provider>;
}

export function useUiLocale(): UiLocaleContextValue {
  const ctx = useContext(UiLocaleContext);
  if (!ctx) {
    throw new Error("useUiLocale must be used within UiLocaleProvider");
  }
  return ctx;
}
