"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { writeStoredUiLocale, type UiLocale } from "@/src/lib/ui-locale";

export const UI_LOCALE_CHANGE_EVENT = "gamlish-ui-locale-change";

interface UiLocaleContextValue {
  locale: UiLocale;
  setLocale: (locale: UiLocale) => void;
}

const LOCKED_LOCALE: UiLocale = "bn";

const UiLocaleContext = createContext<UiLocaleContextValue | null>(null);

export function UiLocaleProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    writeStoredUiLocale(LOCKED_LOCALE);
    document.documentElement.lang = "bn";
    document.body.classList.add("font-bengali");
    document.body.classList.remove("font-sans");
  }, []);

  const setLocale = useCallback((_next: UiLocale) => {
    /* Language is locked to Bangla. */
  }, []);

  const value = useMemo(
    () => ({ locale: LOCKED_LOCALE, setLocale }),
    [setLocale],
  );

  return <UiLocaleContext.Provider value={value}>{children}</UiLocaleContext.Provider>;
}

export function useUiLocale(): UiLocaleContextValue {
  const ctx = useContext(UiLocaleContext);
  if (!ctx) {
    throw new Error("useUiLocale must be used within UiLocaleProvider");
  }
  return ctx;
}
