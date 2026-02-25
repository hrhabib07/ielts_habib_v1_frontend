"use client";

import { type ReactNode } from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";

/**
 * Theme: class-based dark mode (Tailwind darkMode: "class").
 * Semantic tokens in globals.css: --bg-primary, --text-primary, etc.
 * Soft dark: #0f1115, #161a22, #2a2f3a, #e5e7eb, #9ca3af.
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

/** useTheme: theme + toggleTheme for Header/ThemeToggle. resolvedTheme is "light" | "dark". */
export function useTheme(): {
  theme: Theme;
  toggleTheme: () => void;
} {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const effective: Theme = (resolvedTheme as Theme) ?? (theme as Theme) ?? "light";
  const toggleTheme = () => {
    setTheme(effective === "dark" ? "light" : "dark");
  };
  return { theme: effective, toggleTheme };
}
