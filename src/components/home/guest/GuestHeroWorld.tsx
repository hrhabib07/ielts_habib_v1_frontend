"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { cn } from "@/lib/utils";

const FLOAT_WORDS = ["Subject", "Verb", "Object", "I", "eat", "rice"] as const;

/**
 * Full-bleed camp journey visual — the product’s world, not a browser chrome mockup.
 * Dominant first-viewport image for the guest landing.
 */
export function GuestHeroWorld({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const { copy } = useGuestLandingLocale();
  const zones = copy.mockupZones;
  const preferReduced = Boolean(reduceMotion);

  return (
    <motion.div
      className={cn(
        "guest-hero-world relative mx-auto w-full max-w-5xl overflow-hidden",
        className,
      )}
      aria-hidden
      initial={preferReduced ? false : { opacity: 0, y: 28, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.85, delay: 0.18, ease: GUEST_EASE }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[color-mix(in_srgb,var(--primary)_92%,#1e3a8a)] via-[color-mix(in_srgb,var(--primary)_88%,#1e293b)] to-[color-mix(in_srgb,var(--primary)_75%,#0f172a)] dark:from-primary dark:via-primary/95 dark:to-background" />
      <div className="guest-hero-world-mesh absolute inset-0 opacity-40" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/25 to-transparent" />

      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        {FLOAT_WORDS.map((word, i) => (
          <motion.span
            key={word}
            className="guest-float-chip absolute rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white/85 backdrop-blur-md"
            style={{
              left: `${8 + (i % 3) * 28 + (i > 2 ? 12 : 0)}%`,
              top: `${10 + (i % 4) * 8}%`,
            }}
            animate={
              preferReduced
                ? undefined
                : { y: [0, -6, 0], opacity: [0.55, 0.9, 0.55] }
            }
            transition={{
              duration: 4.5 + i * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.35,
            }}
          >
            {word}
          </motion.span>
        ))}
      </div>

      <div className="relative px-3 pb-5 pt-8 sm:px-6 sm:pb-7 sm:pt-10">
        <svg
          viewBox="0 0 960 320"
          className="h-auto w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="guest-path-stroke" x1="40" y1="220" x2="920" y2="80">
              <stop offset="0%" stopColor="#b4cce8" stopOpacity="0.35" />
              <stop offset="55%" stopColor="#b4cce8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.85" />
            </linearGradient>
            <filter id="guest-soft-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d="M0 260 C120 220 200 280 320 240 C440 200 480 280 620 230 C760 180 860 250 960 210 L960 320 L0 320 Z"
            fill="rgba(180,204,232,0.08)"
          />
          <path
            d="M0 290 C160 250 280 300 420 270 C560 240 700 300 960 260 L960 320 L0 320 Z"
            fill="rgba(15,23,42,0.35)"
          />

          <motion.path
            d="M 70 230 C 180 210, 220 160, 300 150 S 460 190, 520 140 S 680 80, 760 110 S 880 150, 900 90"
            stroke="url(#guest-path-stroke)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="8 10"
            initial={preferReduced ? undefined : { pathLength: 0, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.6, delay: 0.35, ease: GUEST_EASE }}
          />

          {[
            { cx: 70, cy: 230, label: zones[0]?.zoneLabel ?? "Camp 1", title: zones[0]?.title ?? "" },
            { cx: 300, cy: 150, label: zones[1]?.zoneLabel ?? "Camp 2", title: zones[1]?.title ?? "" },
            { cx: 520, cy: 140, label: zones[2]?.zoneLabel ?? "Camp 3", title: zones[2]?.title ?? "" },
            { cx: 760, cy: 110, label: zones[3]?.zoneLabel ?? "Camp 4", title: zones[3]?.title ?? "" },
          ].map((node, i) => (
            <g key={node.label}>
              <motion.circle
                cx={node.cx}
                cy={node.cy}
                r={i === 0 ? 18 : 14}
                fill={i === 0 ? "#b4cce8" : "rgba(180,204,232,0.2)"}
                stroke="#f8fafc"
                strokeWidth={i === 0 ? 2.5 : 1.5}
                strokeOpacity={i === 0 ? 1 : 0.45}
                filter={i === 0 ? "url(#guest-soft-glow)" : undefined}
                initial={preferReduced ? false : { scale: 0.35, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.55 + i * 0.12, type: "spring", stiffness: 220, damping: 16 }}
                style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
              />
              {i === 0 && !preferReduced ? (
                <motion.circle
                  cx={node.cx}
                  cy={node.cy}
                  r={28}
                  stroke="#b4cce8"
                  strokeWidth="1.5"
                  fill="none"
                  initial={{ scale: 0.85, opacity: 0.55 }}
                  animate={{ scale: [0.85, 1.2, 0.85], opacity: [0.55, 0.1, 0.55] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                />
              ) : null}
              {i === 0 && preferReduced ? (
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r={28}
                  stroke="#b4cce8"
                  strokeWidth="1.5"
                  fill="none"
                  opacity={0.35}
                />
              ) : null}
              <text
                x={node.cx}
                y={node.cy - 28}
                textAnchor="middle"
                className="fill-white/90"
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}
              >
                {node.label.toUpperCase()}
              </text>
              <text
                x={node.cx}
                y={node.cy + 36}
                textAnchor="middle"
                className="fill-white/55"
                style={{ fontSize: 12, fontWeight: 500 }}
              >
                {node.title}
              </text>
            </g>
          ))}

          <motion.g
            animate={
              preferReduced
                ? undefined
                : { x: [0, 8, 0], y: [0, -4, 0] }
            }
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <circle cx={70} cy={230} r={6} fill="#0f172a" />
            <circle cx={70} cy={230} r={3.5} fill="#f8fafc" />
          </motion.g>
        </svg>

        <div className="mt-1 flex items-center justify-center gap-2 px-2 text-center sm:mt-0">
          <span className="h-1.5 w-1.5 rounded-full bg-steel" />
          <p className="text-[11px] font-medium tracking-wide text-white/70 sm:text-xs">
            {copy.mockupJourneyTitle} · {copy.heroEyebrow}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
