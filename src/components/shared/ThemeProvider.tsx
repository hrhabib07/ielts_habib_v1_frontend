"use client";

import { type ReactNode, useEffect, useState } from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";

const THEME_STORAGE_KEY = "ielts-habib-theme";

/**
 * Theme is locked to light. System preference and a saved dark choice are ignored.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    } catch {
      /* ignore */
    }
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      storageKey={THEME_STORAGE_KEY}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}

type Theme = "light" | "dark";

/** useTheme: locked to light. toggleTheme cannot switch to dark. */
export function useTheme(): {
  theme: Theme;
  toggleTheme: () => void;
  mounted: boolean;
} {
  const { setTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    setTheme("light");
  };

  return { theme: "light", toggleTheme, mounted };
}
