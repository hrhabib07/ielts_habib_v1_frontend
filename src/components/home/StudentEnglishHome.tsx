"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";
import {
  getPlayerCourseMap,
  type PlayerCourseMap,
} from "@/src/lib/api/player";
import {
  getFounderCounter,
  type FounderTierLiveStat,
} from "@/src/lib/api/gamlish";
import { FoundingMemberBadge } from "@/src/components/founding-member/FoundingMemberBadge";
import { UsernameClaimBanner } from "@/src/components/profile/UsernameClaimBanner";
import { FounderVipClaimCard } from "@/src/components/home/FounderVipClaimCard";
import { CampMapView } from "@/src/components/player/CampMapView";
import { usePaymentApplicationStatus } from "@/src/hooks/usePaymentApplicationStatus";
import { cn } from "@/lib/utils";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { useStudentHomeCopy } from "@/src/hooks/useLocalizedCopy";
import { formatMissionLabel } from "@/src/lib/ui-locale";
import { brandSurfaces } from "@/src/lib/brand-theme";
import {
  PLAYER_CTA_CLASS,
  PLAYER_EYEBROW_CLASS,
} from "@/src/lib/player-brand-theme";
import { getStudentDisplayName } from "@/src/lib/student-display-name";

/**
 * Logged-in student home: roadmap is the product.
 * Users who have not purchased Founder see VIP claim above Camp 01
 * (even if Mission 01 / QA English access is already open).
 */
export function StudentEnglishHome() {
  const { isFoundingMember, profile, loading: sessionLoading } =
    useStudentSession();
  const payment = usePaymentApplicationStatus(true);
  const { locale } = useUiLocale();
  const copy = useStudentHomeCopy();
  const reduceMotion = useReducedMotion();
  const [map, setMap] = useState<PlayerCourseMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [founderTiers, setFounderTiers] = useState<
    FounderTierLiveStat[] | undefined
  >(undefined);
  const [founderDeadline, setFounderDeadline] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    getPlayerCourseMap()
      .then((data) => {
        if (!cancelled) setMap(data);
      })
      .catch(() => {
        if (!cancelled) setMap(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getFounderCounter()
      .then((counter) => {
        if (cancelled) return;
        if (Array.isArray(counter.tiers) && counter.tiers.length > 0) {
          setFounderTiers(counter.tiers);
        }
        if (counter.launchDateIso) setFounderDeadline(counter.launchDateIso);
      })
      .catch(() => {
        /* card falls back to default Gold progress */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const paymentBusy = sessionLoading || payment.loading;
  const hasPaidOrPending =
    payment.hasPurchased ||
    isFoundingMember ||
    payment.latestRequest?.status === "PENDING" ||
    payment.latestRequest?.status === "APPROVED";

  /** Show conversion offer until a real Founder purchase exists (not gated on English access). */
  const showFounderOffer = !paymentBusy && !hasPaidOrPending;

  const currentSlug = map?.currentMissionSlug;
  const missionHref = currentSlug
    ? `/player/missions/${currentSlug}`
    : "/player/missions/mission-01-word-order";

  const currentOrder =
    map?.camps
      .flatMap((c) => c.missions)
      .find((m) => m.slug === currentSlug)?.order ?? 1;

  const missionLabel = formatMissionLabel(currentOrder);
  const playerName = getStudentDisplayName(profile);
  const greeting = playerName
    ? `${copy.heroGreeting}, ${playerName}`
    : copy.heroGreeting;

  return (
    <div
      className={cn(
        "relative min-h-[calc(100dvh-4rem)] overflow-hidden",
        brandSurfaces.pageGradient,
        locale === "bn" && "font-bengali",
      )}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-64",
          brandSurfaces.heroGlow,
        )}
        aria-hidden
      />

      <div className="relative mx-auto max-w-2xl px-4 pt-5 sm:px-6 sm:pt-6">
        {showFounderOffer ? (
          <FounderVipClaimCard
            tiers={founderTiers}
            deadlineIso={founderDeadline}
            className="mb-5"
            href="/checkout"
          />
        ) : (
          <UsernameClaimBanner className="mb-4" />
        )}

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-2 space-y-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
                PLAYER_EYEBROW_CLASS,
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {copy.heroBadge}
            </span>
            {isFoundingMember ? <FoundingMemberBadge size="sm" /> : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {greeting}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                {copy.roadmapHint}
              </p>
            </div>
            <Button
              size="lg"
              className={cn(
                "h-11 shrink-0 rounded-full px-6 text-sm sm:h-12 sm:text-base",
                PLAYER_CTA_CLASS,
              )}
              asChild
            >
              <Link href={missionHref}>
                <Play className="mr-2 h-4 w-4 fill-current" />
                {copy.progressButton} · {missionLabel}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Camp map stays visible under the offer */}
      <CampMapView map={map} loading={loading} error={null} />
    </div>
  );
}
