"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { Plane } from "lucide-react";
import { buildQuadraticFlightPath } from "@/src/components/home/studentJourneyHeroConfig";
import { WORLD_LAND_CLIP_PATH_D } from "@/src/components/home/worldLandClipPath.generated";

/** Lucide `Plane` nose aims ~upper-right in viewBox coords; add to path tangent so it follows the arc. */
const PLANE_ICON_ROTATION_OFFSET_DEG = 42;

function initialHeadingDeg(
  from: { x: number; y: number },
  to: { x: number; y: number },
): number {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
}

export interface StudentBandJourneyFlightVisualProps {
  currentCountryLabel: string;
  dreamCountryLabel: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  /** 0–100: completed route length and plane position along path. */
  journeyProgressPct: number;
}

export function StudentBandJourneyFlightVisual({
  currentCountryLabel,
  dreamCountryLabel,
  from,
  to,
  journeyProgressPct,
}: StudentBandJourneyFlightVisualProps) {
  const reduceMotion = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const pathD = buildQuadraticFlightPath(from, to);

  const clipId = `${uid}-world-clip`;
  const dotPatternId = `${uid}-map-squares`;
  const flightGradId = `${uid}-flight-grad`;
  const glowFilterId = `${uid}-dot-glow`;
  const planeShadowId = `${uid}-plane-shadow`;

  const geometryRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);
  const [visualPct, setVisualPct] = useState(0);
  const [plane, setPlane] = useState({
    x: from.x,
    y: from.y,
    angle: initialHeadingDeg(from, to),
  });

  const clampedPct = Math.min(100, Math.max(0, Math.round(journeyProgressPct)));

  useLayoutEffect(() => {
    const el = geometryRef.current;
    if (!el) return;
    setPathLen(el.getTotalLength());
  }, [pathD]);

  useEffect(() => {
    const el = geometryRef.current;
    if (!el || pathLen <= 0) return;

    const sample = (pct: number) => {
      setVisualPct(pct);
      const t = (pct / 100) * pathLen;
      const pt = el.getPointAtLength(t);
      const delta = Math.max(1, Math.min(14, pathLen * 0.02));
      const ahead = Math.min(pathLen, t + delta);
      const pt2 = el.getPointAtLength(ahead);
      const angle = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI;
      setPlane({ x: pt.x, y: pt.y, angle });
    };

    if (reduceMotion) {
      sample(clampedPct);
      return;
    }

    const controls = animate(0, clampedPct, {
      duration: 1.95,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => sample(v),
    });
    return () => controls.stop();
  }, [clampedPct, pathLen, reduceMotion]);

  const completedLen =
    pathLen > 0 ? Math.max(0, (visualPct / 100) * pathLen) : 0;
  /** First dash = colored length from origin; gap = rest of line (gray shows through). */
  const colorStrokeDash =
    completedLen > 0.5 ? `${completedLen} ${pathLen}` : null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
      aria-hidden
    >
      <div className="relative aspect-[2/1] w-[min(78vw,72rem)] max-h-[min(48dvh,440px)] min-h-[180px] shrink-0">
        <svg
          className="absolute inset-0 h-full w-full [--hero-map-dot:rgb(51_65_85_/_0.88)] [--hero-map-glow:rgb(30_58_138_/_0.35)] dark:[--hero-map-dot:rgb(148_163_184_/_0.42)] dark:[--hero-map-glow:rgb(125_211_252_/_0.28)]"
          viewBox="0 0 1000 500"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Flight from ${currentCountryLabel} to ${dreamCountryLabel}`}
        >
          <title>
            Map and flight path from {currentCountryLabel} to {dreamCountryLabel}
          </title>

          <defs>
            <clipPath id={clipId}>
              <path d={WORLD_LAND_CLIP_PATH_D} fillRule="evenodd" />
            </clipPath>

            <pattern
              id={dotPatternId}
              width={8}
              height={8}
              patternUnits="userSpaceOnUse"
            >
              <rect
                x={1}
                y={1}
                width={3.25}
                height={3.25}
                className="fill-gray-200/50 dark:fill-slate-800/50"
              />
            </pattern>

            <filter
              id={glowFilterId}
              x="-40%"
              y="-40%"
              width="180%"
              height="180%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.85" result="b" />
              <feFlood floodColor="var(--hero-map-glow)" floodOpacity="1" result="f" />
              <feComposite in="f" in2="b" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter
              id={planeShadowId}
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feDropShadow
                dx="0"
                dy="1.2"
                stdDeviation="1.4"
                floodOpacity="0.4"
                floodColor="#0f172a"
              />
            </filter>

            <linearGradient
              id={flightGradId}
              gradientUnits="userSpaceOnUse"
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
            >
              <stop offset="0%" stopColor="#0e7490" />
              <stop offset="42%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#a5f3fc" />
            </linearGradient>
          </defs>

          <g clipPath={`url(#${clipId})`} filter={`url(#${glowFilterId})`}>
            <rect x={0} y={0} width={1000} height={500} fill={`url(#${dotPatternId})`} />
          </g>

          <path
            d={WORLD_LAND_CLIP_PATH_D}
            fill="none"
            fillRule="evenodd"
            strokeWidth={0.4}
            vectorEffect="non-scaling-stroke"
            className="stroke-gray-200/45 dark:stroke-slate-700/40"
          />

          <circle
            cx={from.x}
            cy={from.y}
            r={5.5}
            className="fill-primary/55 stroke-background stroke-2 dark:fill-sky-400/50"
          />
          <circle
            cx={to.x}
            cy={to.y}
            r={5.5}
            className="fill-emerald-500/50 stroke-background stroke-2 dark:fill-emerald-400/40"
          />

          <path
            ref={geometryRef}
            d={pathD}
            fill="none"
            stroke="none"
            strokeWidth={0}
          />

          {/* Full route — gray; gradient layer paints only completed segment on top */}
          <path
            d={pathD}
            fill="none"
            className="stroke-muted-foreground/55 dark:stroke-slate-500/45"
            strokeWidth={2.35}
            strokeLinecap="round"
            strokeDasharray="7 12"
            vectorEffect="non-scaling-stroke"
          />

          {/* Completed segment only — gradient; remainder of route stays gray above */}
          {colorStrokeDash ? (
            <path
              d={pathD}
              fill="none"
              stroke={`url(#${flightGradId})`}
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeDasharray={colorStrokeDash}
              vectorEffect="non-scaling-stroke"
            />
          ) : null}

          {pathLen > 0 ? (
            <g
              filter={`url(#${planeShadowId})`}
              transform={`translate(${plane.x}, ${plane.y}) rotate(${plane.angle + PLANE_ICON_ROTATION_OFFSET_DEG})`}
            >
              <g transform="translate(-19, -19)">
                <Plane
                  size={38}
                  strokeWidth={2.35}
                  absoluteStrokeWidth
                  className="text-slate-900 dark:text-slate-50"
                  aria-hidden
                />
              </g>
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  );
}
