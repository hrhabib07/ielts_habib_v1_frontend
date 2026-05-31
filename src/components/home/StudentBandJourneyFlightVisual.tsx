"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { Plane } from "lucide-react";
import { buildQuadraticFlightPath } from "@/src/components/home/studentJourneyHeroConfig";
import { WORLD_LAND_CLIP_PATH_D } from "@/src/components/home/worldLandClipPath.generated";

/** Lucide `Plane` nose aims ~upper-right in viewBox coords; add to path tangent so it follows the arc. */
const PLANE_ICON_ROTATION_OFFSET_DEG = 42;

/** Subtle idle drift along the route (% of path length). */
const BREATH_PATH_AMPLITUDE = 1.05;
/** Perpendicular float in SVG units. */
const BREATH_BOB_AMPLITUDE = 0.65;
/** Scale pulse around 1. */
const BREATH_SCALE_AMPLITUDE = 0.028;
const BREATH_PERIOD_MS = 4_200;

type PlanePose = {
  x: number;
  y: number;
  angle: number;
  scale: number;
  glow: number;
};

function initialHeadingDeg(
  from: { x: number; y: number },
  to: { x: number; y: number },
): number {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
}

function samplePlaneOnPath(
  el: SVGPathElement,
  pathLen: number,
  pct: number,
  perpBob = 0,
  scale = 1,
  glow = 0.5,
): PlanePose {
  const clamped = Math.min(100, Math.max(0, pct));
  const t = (clamped / 100) * pathLen;
  const pt = el.getPointAtLength(t);
  const delta = Math.max(1, Math.min(14, pathLen * 0.02));
  const ahead = Math.min(pathLen, t + delta);
  const pt2 = el.getPointAtLength(ahead);
  const angle = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI;
  const rad = (angle * Math.PI) / 180;
  const bobX = -Math.sin(rad) * perpBob;
  const bobY = Math.cos(rad) * perpBob;
  return {
    x: pt.x + bobX,
    y: pt.y + bobY,
    angle,
    scale,
    glow,
  };
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
  const planeGlowGradId = `${uid}-plane-glow-grad`;

  const geometryRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);
  const [visualPct, setVisualPct] = useState(0);
  const visualPctRef = useRef(0);
  const [plane, setPlane] = useState<PlanePose>({
    x: from.x,
    y: from.y,
    angle: initialHeadingDeg(from, to),
    scale: 1,
    glow: 0.45,
  });

  const clampedPct = Math.min(100, Math.max(0, Math.round(journeyProgressPct)));

  useLayoutEffect(() => {
    const el = geometryRef.current;
    if (!el) return;
    setPathLen(el.getTotalLength());
  }, [pathD]);

  useEffect(() => {
    visualPctRef.current = visualPct;
  }, [visualPct]);

  useEffect(() => {
    const el = geometryRef.current;
    if (!el || pathLen <= 0) return;

    const applyPct = (pct: number) => {
      visualPctRef.current = pct;
      setVisualPct(pct);
    };

    if (reduceMotion) {
      applyPct(clampedPct);
      setPlane(samplePlaneOnPath(el, pathLen, clampedPct));
      return;
    }

    const controls = animate(visualPctRef.current, clampedPct, {
      duration: 1.95,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => applyPct(v),
    });
    return () => controls.stop();
  }, [clampedPct, pathLen, reduceMotion]);

  useEffect(() => {
    const el = geometryRef.current;
    if (!el || pathLen <= 0 || reduceMotion) return;

    let raf = 0;
    const t0 = performance.now();

    const tick = (now: number) => {
      const phase = ((now - t0) % BREATH_PERIOD_MS) / BREATH_PERIOD_MS;
      const wave = Math.sin(phase * Math.PI * 2);
      const eased = wave * 0.92 + Math.sin(phase * Math.PI * 4) * 0.08;
      const pct = visualPctRef.current + eased * BREATH_PATH_AMPLITUDE;
      const bob = eased * BREATH_BOB_AMPLITUDE;
      const scale = 1 + eased * BREATH_SCALE_AMPLITUDE;
      const glow = 0.38 + (eased + 1) * 0.12;

      setPlane(samplePlaneOnPath(el, pathLen, pct, bob, scale, glow));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pathLen, reduceMotion]);

  const completedLen =
    pathLen > 0 ? Math.max(0, (visualPct / 100) * pathLen) : 0;
  const colorStrokeDash =
    completedLen > 0.5 ? `${completedLen} ${pathLen}` : null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
      aria-hidden
    >
      <div className="relative aspect-[2/1] w-[min(88vw,72rem)] max-h-[min(52dvh,480px)] min-h-[200px] shrink-0">
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

            <radialGradient id={planeGlowGradId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#1e3a8a" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
            </radialGradient>

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
            className="hero-map-origin-pulse fill-primary/55 stroke-background stroke-2 dark:fill-sky-400/50"
          />
          <circle
            cx={to.x}
            cy={to.y}
            r={5.5}
            className="hero-map-dest-pulse fill-emerald-500/50 stroke-background stroke-2 dark:fill-emerald-400/40"
          />

          <path
            ref={geometryRef}
            d={pathD}
            fill="none"
            stroke="none"
            strokeWidth={0}
          />

          <path
            d={pathD}
            fill="none"
            className="stroke-muted-foreground/55 dark:stroke-slate-500/45"
            strokeWidth={2.35}
            strokeLinecap="round"
            strokeDasharray="7 12"
            vectorEffect="non-scaling-stroke"
          />

          {colorStrokeDash ? (
            <path
              d={pathD}
              fill="none"
              stroke={`url(#${flightGradId})`}
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeDasharray={colorStrokeDash}
              vectorEffect="non-scaling-stroke"
              className="hero-flight-trail-glow"
            />
          ) : null}

          {pathLen > 0 ? (
            <g
              filter={`url(#${planeShadowId})`}
              transform={`translate(${plane.x}, ${plane.y}) rotate(${plane.angle + PLANE_ICON_ROTATION_OFFSET_DEG}) scale(${plane.scale})`}
            >
              <ellipse
                cx={0}
                cy={2}
                rx={22}
                ry={10}
                fill={`url(#${planeGlowGradId})`}
                opacity={plane.glow}
                className="hero-plane-glow"
              />
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

          <g className="select-none">
            <text
              x={from.x}
              y={from.y + 22}
              textAnchor="middle"
              className="fill-muted-foreground text-[11px] font-semibold uppercase tracking-wide"
              style={{ fontSize: 11 }}
            >
              {currentCountryLabel.length > 18
                ? `${currentCountryLabel.slice(0, 16)}…`
                : currentCountryLabel}
            </text>
            <text
              x={to.x}
              y={to.y + 22}
              textAnchor="middle"
              className="fill-emerald-700 text-[11px] font-bold uppercase tracking-wide dark:fill-emerald-300"
              style={{ fontSize: 11 }}
            >
              {dreamCountryLabel.length > 18
                ? `${dreamCountryLabel.slice(0, 16)}…`
                : dreamCountryLabel}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
