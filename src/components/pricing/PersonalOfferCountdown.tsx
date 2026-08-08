"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchPersonalOffer,
  type PersonalOfferView,
} from "@/src/lib/api/visitor-offer";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function partsFromMs(ms: number): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

function TimeCell({
  value,
  label,
  pulse,
  critical,
  size,
}: {
  value: string;
  label: string;
  pulse?: boolean;
  critical?: boolean;
  size: "sm" | "md" | "lg";
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.span
        key={pulse ? value : `static-${value}`}
        animate={
          pulse && !reduceMotion
            ? { scale: [1, 1.1, 1], opacity: [1, 0.82, 1] }
            : undefined
        }
        transition={
          pulse && !reduceMotion
            ? { duration: 0.85, ease: [0.45, 0, 0.55, 1] }
            : undefined
        }
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-sans font-black tabular-nums",
          "bg-gradient-to-b shadow-md",
          size === "sm" && "h-8 min-w-[2rem] px-1.5 text-sm",
          size === "md" && "h-11 min-w-[2.55rem] px-2 text-lg",
          size === "lg" && "h-12 min-w-[2.85rem] px-2.5 text-xl sm:h-14 sm:min-w-[3.15rem] sm:text-2xl",
          critical
            ? "from-rose-500 to-rose-600 text-white shadow-rose-500/35"
            : "from-amber-400 to-amber-500 text-amber-950 shadow-amber-500/35",
        )}
      >
        {value}
      </motion.span>
      <span
        className={cn(
          "font-bold tracking-wide",
          critical ? "text-rose-800/80 dark:text-rose-200/80" : "text-amber-900/75 dark:text-amber-100/75",
          size === "sm" ? "text-[8px]" : "text-[10px]",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function Colon({ critical, size }: { critical?: boolean; size: "sm" | "md" | "lg" }) {
  return (
    <span
      className={cn(
        "mb-5 select-none font-black leading-none",
        critical ? "text-rose-500" : "text-amber-600",
        size === "sm" && "mb-4 text-sm",
        size === "md" && "text-lg",
        size === "lg" && "mb-6 text-xl sm:text-2xl",
      )}
      aria-hidden
    >
      :
    </span>
  );
}

type Props = {
  className?: string;
  /** sm = inline cards · md = default · lg = pricing featured strip */
  size?: "sm" | "md" | "lg";
  /** Optional visitor id override (test pages). Defaults to browser visitor id. */
  visitorId?: string;
  /**
   * Dev/test only · skip API and show an active countdown ending in this many ms.
   * Use for visual QA when the real visitor/IP clock is already expired.
   */
  demoRemainingMs?: number;
};

/**
 * Personal offer countdown UI.
 * Never teases the post-expiry price during the active window.
 */
export function PersonalOfferCountdown({
  className,
  size = "md",
  visitorId,
  demoRemainingMs,
}: Props) {
  const { locale } = useUiLocale();
  const reduceMotion = useReducedMotion();
  const [offer, setOffer] = useState<PersonalOfferView | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (demoRemainingMs != null && demoRemainingMs > 0) {
      const now = Date.now();
      const endsAt = new Date(now + demoRemainingMs).toISOString();
      const demo: PersonalOfferView = {
        visitorId: visitorId ?? "demo-preview",
        listPriceBdt: 1590,
        offerPriceBdt: 690,
        startedAt: new Date(now).toISOString(),
        endsAt,
        isExpired: false,
        remainingMs: demoRemainingMs,
      };
      setOffer(demo);
      setRemainingMs(demoRemainingMs);
      return;
    }

    let cancelled = false;
    void fetchPersonalOffer(visitorId)
      .then((data) => {
        if (cancelled) return;
        setOffer(data);
        setRemainingMs(data.remainingMs);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [demoRemainingMs, visitorId]);

  useEffect(() => {
    if (!offer || offer.isExpired) return;
    const endsAt = new Date(offer.endsAt).getTime();
    const tick = () => {
      const left = Math.max(0, endsAt - Date.now());
      setRemainingMs(left);
      if (left <= 0) {
        setOffer((prev) =>
          prev
            ? {
                ...prev,
                isExpired: true,
                offerPriceBdt: 699,
                remainingMs: 0,
              }
            : prev,
        );
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [offer?.endsAt, offer?.isExpired]);

  if (!offer) {
    return (
      <div
        className={cn(
          "animate-pulse rounded-2xl bg-amber-500/15",
          size === "lg" ? "h-20" : "h-14",
          className,
        )}
        aria-hidden
      />
    );
  }

  const { hours, minutes, seconds } = partsFromMs(remainingMs);
  const critical = !offer.isExpired && remainingMs < 60 * 60 * 1000;

  if (offer.isExpired) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border/70 bg-muted/40 px-4 py-3 text-center",
          locale === "bn" && "font-bengali",
          className,
        )}
      >
        <p className="text-sm font-bold text-foreground">
          {locale === "bn"
            ? "এই মুহূর্তের স্পেশাল উইন্ডো শেষ"
            : "This moment's special window has ended"}
        </p>
        <p className="mt-0.5 text-xs font-medium text-muted-foreground">
          {locale === "bn"
            ? "এখনো রেগুলার মূল্যের চেয়ে কম অফার আছে"
            : "A lower-than-regular offer is still available"}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl border",
        size === "lg" ? "px-4 py-4 sm:px-5 sm:py-4" : "px-3 py-3 sm:px-4",
        critical
          ? "border-rose-500/40 bg-gradient-to-r from-rose-500/15 via-amber-400/10 to-orange-500/10"
          : "border-amber-500/40 bg-gradient-to-r from-amber-400/25 via-amber-50/80 to-orange-400/20 dark:via-amber-950/20",
        locale === "bn" && "font-bengali",
        className,
      )}
      aria-live="polite"
    >
      <motion.span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -left-8 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full blur-2xl",
          critical ? "bg-rose-400/25" : "bg-amber-400/40",
        )}
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.2, 1], opacity: [0.3, 0.55, 0.3] }
        }
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-8 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full blur-2xl",
          critical ? "bg-rose-400/20" : "bg-orange-400/30",
        )}
        animate={
          reduceMotion
            ? undefined
            : { scale: [1.1, 1, 1.1], opacity: [0.25, 0.45, 0.25] }
        }
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        className={cn(
          "relative flex items-center justify-between gap-3",
          size === "lg" ? "flex-col sm:flex-row sm:gap-4" : "flex-wrap",
        )}
      >
        <div className="flex min-w-0 items-start gap-2.5 sm:items-center">
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full shadow-sm",
              size === "lg" ? "h-11 w-11" : size === "md" ? "h-9 w-9" : "h-8 w-8",
              critical
                ? "bg-rose-600 text-white"
                : "bg-amber-500 text-amber-950",
            )}
          >
            <motion.span
              animate={reduceMotion ? undefined : { scale: [1, 1.14, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex"
            >
              <Clock3
                className={size === "lg" ? "h-5 w-5" : "h-4 w-4"}
                aria-hidden
              />
            </motion.span>
          </span>
          <div className="min-w-0 text-left">
            <p
              className={cn(
                "font-black leading-snug",
                size === "lg" ? "text-base sm:text-lg" : size === "md" ? "text-sm" : "text-[12px]",
                critical
                  ? "text-rose-950 dark:text-rose-100"
                  : "text-amber-950 dark:text-amber-50",
              )}
            >
              {locale === "bn"
                ? critical
                  ? "শেষ মুহূর্ত · অফার ধরে রাখো"
                  : "আপনার অফার শেষ হতে চলছে"
                : critical
                  ? "Final moments · hold this offer"
                  : "Your offer is ending soon"}
            </p>
            <p
              className={cn(
                "mt-0.5 font-medium leading-snug",
                size === "lg" ? "text-sm" : "text-[11px]",
                critical
                  ? "text-rose-900/70 dark:text-rose-100/70"
                  : "text-amber-950/65 dark:text-amber-100/65",
              )}
            >
              {locale === "bn"
                ? "সময় শেষ হলে এই মূল্য আর থাকবে না"
                : "When time runs out, this price will not stay"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-end justify-center gap-1.5 sm:gap-2">
          <TimeCell
            value={pad(hours)}
            label={locale === "bn" ? "ঘণ্টা" : "hrs"}
            critical={critical}
            size={size}
          />
          <Colon critical={critical} size={size} />
          <TimeCell
            value={pad(minutes)}
            label={locale === "bn" ? "মিনিট" : "min"}
            critical={critical}
            size={size}
          />
          <Colon critical={critical} size={size} />
          <TimeCell
            value={pad(seconds)}
            label={locale === "bn" ? "সে." : "sec"}
            pulse
            critical={critical}
            size={size}
          />
        </div>
      </div>
    </motion.div>
  );
}
