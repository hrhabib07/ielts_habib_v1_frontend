"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggleButton({
  className,
}: {
  className?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  const toggleTheme = useCallback(() => {
    const currentlyDark =
      resolvedTheme === "dark" ||
      (resolvedTheme == null &&
        typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark"));
    setTheme(currentlyDark ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "relative z-[1] h-9 w-9 shrink-0 rounded-full border border-border/50 bg-background/80 hover:bg-muted/60",
        className,
      )}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={mounted ? isDark : undefined}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-4 w-4 text-foreground" />
        ) : (
          <Moon className="h-4 w-4 text-foreground" />
        )
      ) : (
        <span className="block h-4 w-4" aria-hidden />
      )}
    </Button>
  );
}
