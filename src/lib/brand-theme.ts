/**
 * Gamlish brand — midnight navy only. Use these tokens instead of rainbow Tailwind hues.
 * Semantic CSS vars live in app/globals.css (--primary, --accent, etc.).
 */

/** Four camp zones: same midnight palette, stepped depth (not separate hues). */
export const CAMP_ZONE_THEMES = [
  {
    header:
      "border-primary/15 bg-gradient-to-br from-primary/[0.06] via-background to-muted/40 dark:border-primary/25 dark:from-primary/10 dark:via-card dark:to-background",
    eyebrow: "text-primary/80 dark:text-primary/70",
    title: "text-foreground",
    subtitle: "text-muted-foreground",
    orderBadge:
      "bg-primary/10 text-primary ring-primary/20 dark:bg-primary/15 dark:text-primary-foreground dark:ring-primary/30",
    statBadge: "bg-primary/8 text-primary ring-primary/15 dark:bg-primary/12 dark:text-primary-foreground",
    statMuted: "text-muted-foreground",
    progressTrack: "bg-primary/10 dark:bg-primary/15",
    progressFill: "bg-primary/70 dark:bg-primary/60",
    ring: "ring-primary/30",
    node: "border-primary/25 bg-primary/5 text-primary dark:border-primary/35 dark:bg-primary/10 dark:text-primary-foreground",
    spine: "from-primary/30 to-primary/10",
  },
  {
    header:
      "border-primary/20 bg-gradient-to-br from-primary/[0.09] via-background to-muted/50 dark:border-primary/30 dark:from-primary/14 dark:via-card dark:to-background",
    eyebrow: "text-primary/85 dark:text-primary/75",
    title: "text-foreground",
    subtitle: "text-muted-foreground",
    orderBadge:
      "bg-primary/12 text-primary ring-primary/22 dark:bg-primary/18 dark:text-primary-foreground dark:ring-primary/32",
    statBadge: "bg-primary/10 text-primary ring-primary/18 dark:bg-primary/14 dark:text-primary-foreground",
    statMuted: "text-muted-foreground",
    progressTrack: "bg-primary/12 dark:bg-primary/18",
    progressFill: "bg-primary/75 dark:bg-primary/65",
    ring: "ring-primary/35",
    node: "border-primary/30 bg-primary/8 text-primary dark:border-primary/40 dark:bg-primary/12 dark:text-primary-foreground",
    spine: "from-primary/35 to-primary/12",
  },
  {
    header:
      "border-primary/25 bg-gradient-to-br from-primary/[0.12] via-background to-muted/60 dark:border-primary/35 dark:from-primary/18 dark:via-card dark:to-background",
    eyebrow: "text-primary dark:text-primary/80",
    title: "text-foreground",
    subtitle: "text-muted-foreground",
    orderBadge:
      "bg-primary/14 text-primary ring-primary/25 dark:bg-primary/20 dark:text-primary-foreground dark:ring-primary/35",
    statBadge: "bg-primary/12 text-primary ring-primary/20 dark:bg-primary/16 dark:text-primary-foreground",
    statMuted: "text-muted-foreground",
    progressTrack: "bg-primary/14 dark:bg-primary/20",
    progressFill: "bg-primary/80 dark:bg-primary/70",
    ring: "ring-primary/40",
    node: "border-primary/35 bg-primary/10 text-primary dark:border-primary/45 dark:bg-primary/14 dark:text-primary-foreground",
    spine: "from-primary/40 to-primary/15",
  },
  {
    header:
      "border-primary/30 bg-gradient-to-br from-primary/[0.15] via-background to-primary/5 dark:border-primary/40 dark:from-primary/22 dark:via-card dark:to-background",
    eyebrow: "text-primary dark:text-primary/85",
    title: "text-foreground",
    subtitle: "text-muted-foreground",
    orderBadge:
      "bg-primary/16 text-primary ring-primary/28 dark:bg-primary/22 dark:text-primary-foreground dark:ring-primary/38",
    statBadge: "bg-primary/14 text-primary ring-primary/22 dark:bg-primary/18 dark:text-primary-foreground",
    statMuted: "text-muted-foreground",
    progressTrack: "bg-primary/16 dark:bg-primary/22",
    progressFill: "bg-primary dark:bg-primary/75",
    ring: "ring-primary/45",
    node: "border-primary/40 bg-primary/12 text-primary dark:border-primary/50 dark:bg-primary/16 dark:text-primary-foreground",
    spine: "from-primary/45 to-primary/18",
  },
] as const;

export const CAMP_CARD_TONES = [
  "from-steel to-steel-deep",
  "from-steel/95 to-steel-deep/95",
  "from-steel/90 to-steel-deep/90",
  "from-steel/85 to-steel-deep/85",
] as const;

export const brandSurfaces = {
  pageGradient:
    "bg-gradient-to-b from-muted/30 via-background to-primary/[0.04] dark:from-background dark:via-card/30 dark:to-primary/10",
  heroGlow:
    "bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,color-mix(in_srgb,var(--steel)_14%,transparent),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,color-mix(in_srgb,var(--steel)_10%,transparent),transparent)]",
  midnightCard:
    "border-primary/20 bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground shadow-xl shadow-primary/15",
  /** Elevated feature card — midnight base + steel accent (light & dark) */
  featuredCard:
    "border-border/70 bg-card text-foreground shadow-lg ring-1 ring-steel/15 dark:border-steel-deep/35 dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-[color-mix(in_srgb,var(--card)_72%,var(--steel-deep)_28%)] dark:ring-steel/20 dark:shadow-steel-deep/15",
  /** Logo steel blue — solid fills (buttons, badges) */
  steelCard:
    "border-steel-deep/35 bg-gradient-to-br from-steel via-steel/95 to-steel-deep text-steel-foreground shadow-xl shadow-steel-deep/25",
  premiumBanner:
    "border-primary/20 bg-gradient-to-r from-primary/8 via-card to-primary/5 dark:border-steel-deep/25 dark:from-steel/8 dark:via-card dark:to-primary/8",
  pricingCard:
    "border-primary/15 bg-gradient-to-br from-primary/[0.05] via-card to-muted/30 dark:border-primary/25 dark:from-primary/12 dark:via-card dark:to-background",
  eyebrowBadge:
    "border-steel-deep/25 bg-steel/15 text-[color-mix(in_srgb,var(--steel-deep)_70%,var(--foreground))] dark:border-steel/30 dark:bg-steel/12 dark:text-steel",
  ctaButton:
    "bg-steel font-bold text-steel-foreground shadow-lg shadow-steel-deep/25 hover:bg-steel/90 dark:shadow-steel/20",
  ctaButtonOutline:
    "border-2 border-steel-deep/45 bg-transparent text-foreground hover:bg-steel/10 dark:border-steel/40 dark:hover:bg-steel/15",
} as const;

/** Status surfaces — still midnight navy; destructive only for errors/reject. */
export const brandStatus = {
  success: {
    card:
      "border-primary/25 bg-gradient-to-br from-primary/[0.06] via-card to-primary/[0.04] dark:border-primary/35 dark:from-primary/12 dark:via-card dark:to-background",
    icon: "bg-primary/12 text-primary dark:bg-primary/18 dark:text-primary-foreground",
    title: "text-foreground",
    body: "text-muted-foreground",
    button: "bg-primary text-primary-foreground hover:bg-primary/90",
    check: "text-primary",
  },
  pending: {
    card:
      "border-primary/20 bg-gradient-to-br from-muted/50 via-card to-primary/[0.03] dark:border-primary/30 dark:from-card dark:via-background dark:to-primary/8",
    icon: "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary-foreground",
    title: "text-foreground",
    body: "text-muted-foreground",
    detail:
      "border-primary/15 bg-card/80 text-foreground dark:border-primary/25 dark:bg-primary/5",
    label: "text-muted-foreground",
  },
  missionCompleted:
    "border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 text-primary dark:from-primary/20 dark:to-primary/10 dark:text-primary-foreground",
  missionInProgress:
    "border-primary/40 bg-gradient-to-br from-primary/15 to-primary/8 text-primary shadow-primary/15 group-hover:scale-105 dark:from-primary/25 dark:to-primary/12 dark:text-primary-foreground",
  missionNeedsPay:
    "border-primary/35 bg-gradient-to-br from-primary/12 to-primary/6 text-primary group-hover:scale-105 group-active:scale-95 dark:from-primary/22 dark:to-primary/10 dark:text-primary-foreground",
  missionLocked:
    "border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted/80",
  freeBadge:
    "bg-primary/10 text-primary ring-primary/20 dark:bg-primary/15 dark:text-primary-foreground",
  trophyBadge: "bg-primary/15 text-primary ring-primary/25",
} as const;
