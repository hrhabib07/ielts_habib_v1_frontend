"use client";

import { type ReactNode } from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";

/**
 * Theme: class-based dark mode (Tailwind darkMode: "class").
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="ielts-habib-theme"
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}

type Theme = "light" | "dark";

function readDomTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** useTheme: theme + toggleTheme for nav controls. */
export function useTheme(): {
  theme: Theme;
  toggleTheme: () => void;
} {
  const { setTheme, resolvedTheme } = useNextTheme();

  const theme: Theme =
    resolvedTheme === "dark" || resolvedTheme === "light"
      ? resolvedTheme
      : readDomTheme();

  const toggleTheme = () => {
    const currentlyDark =
      resolvedTheme === "dark" ||
      (resolvedTheme !== "light" && readDomTheme() === "dark");
    setTheme(currentlyDark ? "light" : "dark");
  };

  return { theme, toggleTheme };
}
