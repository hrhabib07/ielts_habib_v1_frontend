/**
 * Premium reading-path surface tokens — Gamlish navy palette only.
 * accent #1e3a8a · primary #0f172a · slate neutrals · dark accent #38bdf8
 */

export const readingPathPremium = {
  page: "bg-background",
  pageTexture:
    "bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(30,58,138,0.05),transparent_55%)] dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(56,189,248,0.06),transparent_55%)]",

  glassNav:
    "sticky top-0 z-50 shrink-0 border-b border-border/50 bg-background/70 shadow-[0_1px_0_0_rgba(15,23,42,0.04)] backdrop-blur-md dark:bg-background/60 dark:shadow-[0_1px_0_0_rgba(0,0,0,0.2)]",

  microLabel:
    "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground",

  heroTitle: "text-2xl font-semibold tracking-tight text-foreground sm:text-3xl",
  heroBody: "text-sm leading-relaxed text-muted-foreground",

  zoneSticky:
    "sticky top-14 z-10 mb-8 border-b border-border/40 bg-background/95 py-4 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 dark:bg-background/90",

  /** Locked level — soft lift, hairline ring, no harsh border */
  cardLocked:
    "border border-[color:var(--primary)]/[0.04] bg-muted/25 shadow-[0_2px_10px_-3px_rgba(15,23,42,0.04)] ring-1 ring-[color:var(--accent)]/[0.03] dark:border-white/[0.04] dark:bg-muted/15 dark:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.35)]",

  /** Unlocked, not current */
  cardDefault:
    "border border-border/35 bg-card shadow-[0_2px_14px_-4px_rgba(15,23,42,0.06)] ring-1 ring-[color:var(--accent)]/[0.05] dark:border-border/50 dark:shadow-[0_2px_16px_-6px_rgba(0,0,0,0.4)]",

  /** Active level — elevated + accent glow ring */
  cardActive:
    "border border-border/50 bg-card shadow-[0_8px_30px_-8px_rgba(15,23,42,0.1)] ring-1 ring-accent/15 dark:border-accent/20 dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)] dark:ring-accent/25",

  cardActiveGlow:
    "pointer-events-none absolute -inset-1 rounded-[1.2rem] bg-accent/10 blur-2xl dark:bg-accent/15",

  stepRowDefault:
    "rounded-xl border border-border/30 bg-card/80 px-3 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.03)] ring-1 ring-[color:var(--accent)]/[0.03] transition-all dark:border-border/40",

  stepRowCurrent:
    "rounded-xl border border-accent/25 bg-accent/[0.04] px-3 py-3 shadow-[0_2px_8px_-2px_rgba(30,58,138,0.12)] ring-1 ring-accent/15 dark:border-accent/30 dark:bg-accent/10",

  stepRowLocked:
    "rounded-xl border border-border/25 bg-muted/20 px-3 py-3 opacity-80 ring-1 ring-transparent dark:bg-muted/10",

  progressTrack: "h-1.5 overflow-hidden rounded-full bg-muted dark:bg-muted/80",
  progressFill:
    "h-full rounded-full bg-gradient-to-r from-primary via-accent to-accent/80 transition-all duration-700 ease-out dark:from-accent dark:via-accent dark:to-primary/80",
} as const;

export type PathLineSegment = "completed" | "available" | "locked";

export function pathLineSegmentClass(segment: PathLineSegment): string {
  switch (segment) {
    case "completed":
      return "w-0.5 rounded-full bg-gradient-to-b from-accent via-accent/90 to-accent/60 shadow-[0_0_8px_rgba(30,58,138,0.25)] dark:from-accent dark:via-accent/80 dark:to-accent/50";
    case "available":
      return "w-px rounded-full bg-border-muted/90 dark:bg-border/80";
    case "locked":
      return "w-0 border-l border-dashed border-border-muted/80 bg-transparent dark:border-border/60";
  }
}

export function pathNodeClass(state: "completed" | "current" | "unlocked" | "locked"): string {
  switch (state) {
    case "completed":
      return "border-transparent bg-accent text-accent-foreground shadow-[0_2px_8px_rgba(30,58,138,0.35)] dark:bg-accent dark:text-primary-foreground";
    case "current":
      return "border-accent bg-primary text-primary-foreground shadow-[0_0_0_4px_rgba(30,58,138,0.12)] dark:border-accent dark:bg-accent dark:text-primary-foreground dark:shadow-[0_0_0_4px_rgba(56,189,248,0.15)]";
    case "unlocked":
      return "border-border/60 bg-card text-foreground ring-1 ring-accent/10 dark:border-border dark:bg-card";
    case "locked":
      return "border-border/40 bg-muted/40 text-muted-foreground dark:bg-muted/25";
  }
}
