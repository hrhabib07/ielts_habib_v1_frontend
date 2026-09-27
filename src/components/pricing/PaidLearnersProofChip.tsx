"use client";

import { useEffect, useState } from "react";
import {
  LEARNER_PROOF_PHOTOS,
  pickLearnerProofPhotos,
  type SocialProofPhoto,
} from "@/src/lib/social-proof-photos";
import { playersPlayingProofLine } from "@/src/lib/monthly-offer-copy";
import {
  PLAYERS_PLAYING_PROOF_FLOOR,
  resolvePlayersPlayingCount,
} from "@/src/lib/demo-social-proof";
import { getDemoStats } from "@/src/lib/api/demo";
import { getPublicLearnerFeedback } from "@/src/lib/api/learnerFeedback";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import type { UiLocale } from "@/src/lib/ui-locale";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Override when the page locale is not UiLocaleContext (rare). */
  locale?: UiLocale;
};

let cachedRegisteredStudents: number | null = null;
let inflightStats: Promise<number> | null = null;
let cachedLearnerPhotos: SocialProofPhoto[] | null = null;
let inflightPhotos: Promise<SocialProofPhoto[]> | null = null;

async function loadRegisteredStudentCount(): Promise<number> {
  if (cachedRegisteredStudents != null) {
    return resolvePlayersPlayingCount(cachedRegisteredStudents);
  }
  if (!inflightStats) {
    inflightStats = getDemoStats()
      .then((stats) => {
        const n = Math.max(0, Math.floor(stats.registeredStudents ?? 0));
        /** Only cache a real production-like count. Never cache a failed/empty local DB. */
        if (n >= PLAYERS_PLAYING_PROOF_FLOOR) {
          cachedRegisteredStudents = n;
        }
        return resolvePlayersPlayingCount(n);
      })
      .catch(() => resolvePlayersPlayingCount(cachedRegisteredStudents))
      .finally(() => {
        inflightStats = null;
      });
  }
  return inflightStats;
}

async function loadLearnerProofPhotos(): Promise<SocialProofPhoto[]> {
  if (cachedLearnerPhotos != null) return cachedLearnerPhotos;
  if (!inflightPhotos) {
    inflightPhotos = getPublicLearnerFeedback(24)
      .then((rows) => {
        const photos = pickLearnerProofPhotos(rows, 3);
        if (photos.length >= 3) cachedLearnerPhotos = photos;
        return photos.length > 0 ? photos : [...LEARNER_PROOF_PHOTOS];
      })
      .catch(() => [...LEARNER_PROOF_PHOTOS])
      .finally(() => {
        inflightPhotos = null;
      });
  }
  return inflightPhotos;
}

/**
 * Live registered-player proof chip. Use this on every public conversion surface.
 */
export function PaidLearnersProofBar({
  className,
  locale,
}: {
  className?: string;
  locale?: UiLocale;
}) {
  return (
    <div
      className={cn(
        "flex w-full justify-center border-b border-sky-500/20 bg-sky-500/[0.07] px-3 py-2 dark:border-sky-400/20 dark:bg-sky-400/[0.08]",
        className,
      )}
    >
      <PaidLearnersProofChip className="max-w-full" locale={locale} />
    </div>
  );
}

export function PaidLearnersProofChip({ className, locale: localeProp }: Props) {
  const { locale: ctxLocale } = useUiLocale();
  const locale = localeProp ?? ctxLocale;
  const [count, setCount] = useState<number>(() =>
    resolvePlayersPlayingCount(cachedRegisteredStudents),
  );
  const [photos, setPhotos] = useState<readonly SocialProofPhoto[]>(
    () => cachedLearnerPhotos ?? LEARNER_PROOF_PHOTOS,
  );

  useEffect(() => {
    let alive = true;
    void loadRegisteredStudentCount().then((n) => {
      if (alive) setCount(n);
    });
    void loadLearnerProofPhotos().then((next) => {
      if (alive && next.length > 0) setPhotos(next);
    });
    return () => {
      alive = false;
    };
  }, []);

  const line = playersPlayingProofLine(count, locale);

  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-1.5",
        locale === "bn" && "font-bengali",
        className,
      )}
      role="status"
    >
      <div className="flex shrink-0 -space-x-1.5" aria-hidden>
        {photos.map((photo) => (
          <span
            key={photo.src}
            className="inline-flex h-6 w-6 overflow-hidden rounded-full border border-background bg-sky-800"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt=""
              width={24}
              height={24}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </span>
        ))}
      </div>
      <p className="min-w-0 flex-1 whitespace-normal text-left text-xs font-semibold leading-snug text-sky-950 dark:text-sky-100 sm:text-sm">
        {line}
      </p>
    </div>
  );
}
