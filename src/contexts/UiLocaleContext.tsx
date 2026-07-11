"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  resolveInitialUiLocale,
  UI_LOCALE_STORAGE_KEY,
  writeStoredUiLocale,
  type UiLocale,
} from "@/src/lib/ui-locale";

export const UI_LOCALE_CHANGE_EVENT = "gamlish-ui-locale-change";

interface UiLocaleContextValue {
  locale: UiLocale;
  setLocale: (locale: UiLocale) => void;
}

const UiLocaleContext = createContext<UiLocaleContextValue | null>(null);

export function UiLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<UiLocale>("bn");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLocaleState(resolveInitialUiLocale());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const onLocaleChange = (event: Event) => {
      const detail = (event as CustomEvent<UiLocale>).detail;
      if (detail === "bn" || detail === "en") {
        setLocaleState(detail);
      }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== UI_LOCALE_STORAGE_KEY) return;
      if (event.newValue === "bn" || event.newValue === "en") {
        setLocaleState(event.newValue);
      }
    };
    window.addEventListener(UI_LOCALE_CHANGE_EVENT, onLocaleChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(UI_LOCALE_CHANGE_EVENT, onLocaleChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = locale === "bn" ? "bn" : "en";
    document.body.classList.toggle("font-bengali", locale === "bn");
  }, [locale, hydrated]);

  const setLocale = useCallback((next: UiLocale) => {
    setLocaleState(next);
    writeStoredUiLocale(next);
    window.dispatchEvent(new CustomEvent(UI_LOCALE_CHANGE_EVENT, { detail: next }));
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return <UiLocaleContext.Provider value={value}>{children}</UiLocaleContext.Provider>;
}

export function useUiLocale(): UiLocaleContextValue {
  const ctx = useContext(UiLocaleContext);
  if (!ctx) {
    throw new Error("useUiLocale must be used within UiLocaleProvider");
  }
  return ctx;
}
