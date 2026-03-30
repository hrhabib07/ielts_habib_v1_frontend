"use client";

import type { RefObject } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, type Variants } from "framer-motion";
import { BRAND } from "@/src/lib/constants";
const SCORES = [5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0] as const;
/** Tailwind `md` is 768px — below that, single-column band UI */
const MOBILE_HERO_MAX_WIDTH_PX = 767;

export interface PositionState {
  readonly slot: "left" | "center" | "right";
}

export interface ScoreProps {
  readonly score: number;
  readonly position: PositionState;
  readonly fillCycleKey: number;
}

/** Neutral pipe connects jar mouth → band top (no liquid color yet) */
const PIPE_CONNECT_S = 0.5;
/** Colored water runs top → bottom along pipe; starts after connect (0.5s–2s) */
const PIPE_WATER_S = 1.5;
/** Band fills + jar drains after pipe water completes */
const POUR_DURATION_S = 5;
const SLIDE_DURATION_S = 2.35;
const SLOT_GAP_REM = 1;
const SLOT_COLUMN_W_REM = 18;
/** Side inset inside the clip so scaled center/right glyphs are not cut off */
const CAROUSEL_INLINE_BLEED_REM = 0.75;

const POUR_EASE: [number, number, number, number] = [0.55, 0.02, 0.35, 1];
const PIPE_CONNECT_EASE: [number, number, number, number] = [0.33, 1, 0.68, 1];
const SLIDE_EASE: [number, number, number, number] = [0.42, 0, 0.58, 1];
const TILT_EASE_IN: [number, number, number, number] = [0.55, 0, 1, 1];
const JAR_RETURN_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Tilt right so the lid/mouth aims toward the center band; pivot matches jar artwork */
const JAR_TILT_DEG = 86;
const TILT_DURATION_S = 0.55;
const JAR_RETURN_DURATION_S = 0.42;

const JET_STROKE_W = 11;
const JET_SHIMMER_W = 2.5;
const JET_OUTER_GLOW_W = 28;
const JET_SOFT_HALO_W = 20;
/** Jar SVG width (matches `w-[120px]` = 7.5rem at 16px root) */
const JAR_WIDTH_REM = 7.5;

const JAR_INTERIOR_D =
  "M36 26c0-2 1.5-3.5 3.5-3.5h41c2 0 3.5 1.5 3.5 3.5v48c0 6-4.5 10.5-10.5 10.5H46.5C40.5 84.5 36 80 36 74V26Z";

function formatBand(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

const jarLiquidFull =
  "M40.5 86 L75.5 86 L74.2 36 L41.8 36 Z";
const jarLiquidDrained =
  "M40.5 86 L75.5 86 L75 84.5 L41 84.5 Z";

type CycleStep = "connect" | "pipeFill" | "pour" | "slide";

interface StreamGeomCubic {
  readonly c1x: number;
  readonly c1y: number;
  readonly c2x: number;
  readonly c2y: number;
  readonly ex: number;
  readonly ey: number;
}

interface StreamGeom {
  readonly d: string;
  /** Path start (lip) */
  readonly mouthX: number;
  readonly mouthY: number;
  /** Corner: horizontal meets vertical (L-shape); for smooth cubic, control-2–like anchor */
  readonly elbowX: number;
  readonly elbowY: number;
  /** Top of band text ink (for socket / flange) */
  readonly inkTopY: number;
  /** Pipe end Y (slightly below ink top — overlaps stroked outline) */
  readonly bandTopX: number;
  readonly bandTopY: number;
  /** Smooth cubic path (non–plumb-only): droplets / normals use this */
  readonly cubic?: StreamGeomCubic;
}

/** Extend past the ink top so the pipe visibly meets the stroked band (SVG local px). */
const PIPE_INK_OVERLAP_PX = 14;
/**
 * Spout circle center vs visual pour opening after tilt (overlay SVG px).
 * Screenshot: pipe sat below + left of rim — shift start right and up to meet the mouth.
 */
const PIPE_MOUTH_NUDGE_X_PX = 26;
const PIPE_MOUTH_NUDGE_Y_PX = -52;

/**
 * Smooth cubic Bézier from jar mouth to band top — one continuous pour, no sharp 90° elbow
 * (desktop and mobile; droplets / stroke use `cubic` sampling).
 */
function buildSmoothPour(
  mouthX: number,
  mouthY: number,
  bandTopX: number,
  inkTopY: number,
): StreamGeom {
  const lipIntoJar = 14;
  const endY = inkTopY + PIPE_INK_OVERLAP_PX;
  const rawDx = bandTopX - mouthX;

  if (Math.abs(rawDx) < 3) {
    const x = (mouthX + bandTopX) / 2;
    const y0 = mouthY;
    const d = `M ${x} ${y0} L ${x} ${endY}`;
    return {
      d,
      mouthX: x,
      mouthY: y0,
      elbowX: x,
      elbowY: y0,
      inkTopY,
      bandTopX: x,
      bandTopY: endY,
    };
  }

  const bandIsRight = rawDx >= 0;
  const sx = bandIsRight ? mouthX - lipIntoJar : mouthX + lipIntoJar;
  const sy = mouthY;
  const ex = bandTopX;
  const ey = endY;
  const dx = ex - sx;
  const dy = ey - sy;
  /** Wider mouth→band span (typical desktop): ease earlier into the drop so it never reads as a long flat + corner. */
  const wide = Math.abs(dx) > 200;
  const c1x = sx + dx * (wide ? 0.42 : 0.38);
  const c1y = sy + dy * (wide ? 0.2 : 0.12);
  const c2x = sx + dx * (wide ? 0.64 : 0.68);
  const c2y = sy + dy * (wide ? 0.84 : 0.88);
  const d = `M ${sx} ${sy} C ${c1x} ${c1y} ${c2x} ${c2y} ${ex} ${ey}`;
  const cubic: StreamGeomCubic = { c1x, c1y, c2x, c2y, ex, ey };
  return {
    d,
    mouthX: sx,
    mouthY: sy,
    elbowX: c2x,
    elbowY: c2y,
    inkTopY,
    bandTopX: ex,
    bandTopY: ey,
    cubic,
  };
}

function cubicPointAt(
  t: number,
  p0x: number,
  p0y: number,
  c1x: number,
  c1y: number,
  c2x: number,
  c2y: number,
  p1x: number,
  p1y: number,
): readonly [number, number] {
  const u = 1 - t;
  const u2 = u * u;
  const u3 = u2 * u;
  const t2 = t * t;
  const t3 = t2 * t;
  const x = u3 * p0x + 3 * u2 * t * c1x + 3 * u * t2 * c2x + t3 * p1x;
  const y = u3 * p0y + 3 * u2 * t * c1y + 3 * u * t2 * c2y + t3 * p1y;
  return [x, y] as const;
}

function pointOnDownspout(t: number, geom: StreamGeom): readonly [number, number] {
  if (geom.cubic) {
    const { mouthX: sx, mouthY: sy, cubic: c } = geom;
    return cubicPointAt(t, sx, sy, c.c1x, c.c1y, c.c2x, c.c2y, c.ex, c.ey);
  }
  const { mouthX: sx, mouthY: sy, elbowX: ex, elbowY: ey, bandTopX: bx, bandTopY: by } =
    geom;
  const len1 = Math.hypot(ex - sx, ey - sy);
  const len2 = Math.hypot(bx - ex, by - ey);
  const total = len1 + len2 || 1;
  let u = t * total;
  if (len1 < 0.5) {
    const s = len2 ? u / len2 : 0;
    return [ex + (bx - ex) * s, ey + (by - ey) * s] as const;
  }
  if (u <= len1) {
    const s = len1 ? u / len1 : 0;
    return [sx + (ex - sx) * s, sy + (ey - sy) * s] as const;
  }
  u -= len1;
  const s = len2 ? u / len2 : 0;
  return [ex + (bx - ex) * s, ey + (by - ey) * s] as const;
}

function normalOnDownspout(t: number, geom: StreamGeom): readonly [number, number] {
  const t0 = Math.max(0, Math.min(t, 1));
  const t1 = Math.min(t0 + 0.04, 1);
  const [x0, y0] = pointOnDownspout(t0, geom);
  const [x1, y1] = pointOnDownspout(t1 === t0 ? Math.max(0, t0 - 0.04) : t1, geom);
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  if (len < 0.001) return [1, 0] as const;
  return [-dy / len, dx / len] as const;
}

/** Top-center of band text ink in the same viewport as `originRect` (pipe overlay SVG). */
function bandInkTopCenterInViewport(
  glyph: SVGSVGElement,
  originRect: DOMRect,
): { cx: number; inkTopY: number } | null {
  const text = glyph.querySelector("text");
  if (!text || !(text instanceof SVGTextElement)) return null;
  try {
    const b = text.getBBox();
    const pt = glyph.createSVGPoint();
    pt.x = b.x + b.width / 2;
    pt.y = b.y;
    const ctm = text.getScreenCTM();
    if (!ctm) return null;
    const sp = pt.matrixTransform(ctm);
    return {
      cx: sp.x - originRect.left,
      inkTopY: sp.y - originRect.top,
    };
  } catch {
    return null;
  }
}

/** No blur on sides — left stays vivid (filled), right stays sharp (outline-only) */
const carouselSlotVariants: Variants = {
  center: {
    scale: 1.26,
    opacity: 1,
    filter: "none",
    transition: { duration: SLIDE_DURATION_S, ease: SLIDE_EASE },
  },
  leftFilled: {
    scale: 0.95,
    opacity: 1,
    filter: "none",
    transition: { duration: SLIDE_DURATION_S, ease: SLIDE_EASE },
  },
  /** Next band visible before it becomes center — closer to final size for smoother anticipation */
  rightPreview: {
    scale: 1.12,
    opacity: 1,
    filter: "none",
    transition: { duration: SLIDE_DURATION_S, ease: SLIDE_EASE },
  },
  /** While the strip translates, DOM “center” ≠ visual center — equal weight avoids tiny incoming glyph */
  slideUniform: {
    scale: 1.18,
    opacity: 1,
    filter: "none",
    transition: { duration: SLIDE_DURATION_S, ease: SLIDE_EASE },
  },
};

/** Narrow viewports: one band at a time — slides left when advancing */
const mobileBandExitVariants: Variants = {
  settled: { x: 0, opacity: 1 },
  exiting: { x: -48, opacity: 0.12 },
};

interface BandScoreGlyphProps {
  readonly score: number;
  readonly slot: "left" | "center" | "right";
  readonly fillCycleKey: number;
  readonly uid: string;
  readonly slotIndex: number;
  readonly pourActive: boolean;
  /** While the carousel translates, keep the just-filled center score fully masked (same as left after slide) */
  readonly cycleStep: CycleStep;
  readonly glyphRef?: RefObject<SVGSVGElement | null>;
}

function BandScoreGlyph({
  score,
  slot,
  fillCycleKey,
  uid,
  slotIndex,
  pourActive,
  cycleStep,
  glyphRef,
}: BandScoreGlyphProps) {
  const label = formatBand(score);
  const clipId = `${uid}-clip-${slotIndex}`;
  const maskId = `${uid}-mask-${slotIndex}`;
  const flowMaskId = `${uid}-flow-unfilled-${slotIndex}`;
  const flowStrokeGradId = `${uid}-flow-stroke-${slotIndex}`;
  const gradActive = `${uid}-liq-active-${slotIndex}`;
  const gradMuted = `${uid}-liq-muted-${slotIndex}`;

  const isCenter = slot === "center";
  const isLeft = slot === "left";
  const isRight = slot === "right";
  const fillTarget = isLeft ? 1 : isRight ? 0 : 1;
  /** Left = completed pour (full color); center animates during pour; right = empty */
  const useActiveLiquid = isCenter || isLeft;

  const fontSize = isCenter ? 84 : isLeft ? 76 : 72;
  const vbH = 140;

  const textAttrs = {
    x: 120,
    y: 104,
    fontSize,
    fontWeight: 700,
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
    textAnchor: "middle" as const,
    dominantBaseline: "alphabetic" as const,
  };

  return (
    <svg
      ref={glyphRef}
      className="overflow-visible"
      width={240}
      height={vbH}
      viewBox={`0 0 240 ${vbH}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradActive} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.92} />
          <stop offset="50%" stopColor="var(--ring)" stopOpacity={0.95} />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity={1} />
        </linearGradient>
        <linearGradient id={gradMuted} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="var(--muted-foreground)" stopOpacity={0.35} />
          <stop offset="100%" stopColor="var(--muted-foreground)" stopOpacity={0.55} />
        </linearGradient>
        <clipPath id={clipId}>
          <text {...textAttrs}>{label}</text>
        </clipPath>
        <mask id={maskId}>
          <rect width="240" height={vbH} fill="black" />
          {isCenter ? (
            pourActive ? (
              <motion.rect
                key={`${fillCycleKey}-pour`}
                x={0}
                width={240}
                fill="white"
                initial={{ height: 0, y: vbH }}
                animate={{ height: vbH, y: 0 }}
                transition={{
                  duration: POUR_DURATION_S,
                  ease: POUR_EASE,
                }}
              />
            ) : cycleStep === "slide" ? (
              <rect x={0} y={0} width={240} height={vbH} fill="white" />
            ) : (
              <rect x={0} y={vbH} width={240} height={0} fill="white" />
            )
          ) : isLeft ? (
            <rect x={0} y={0} width={240} height={vbH} fill="white" />
          ) : (
            <rect
              x={0}
              y={vbH - fillTarget * vbH}
              width={240}
              height={fillTarget * vbH}
              fill="white"
            />
          )}
        </mask>
        {isCenter ? (
          <>
            <mask id={flowMaskId}>
              <rect width="240" height={vbH} fill="black" />
              {pourActive ? (
                <motion.rect
                  key={`${fillCycleKey}-flow-unfilled`}
                  x={0}
                  y={0}
                  width={240}
                  fill="white"
                  initial={{ height: vbH }}
                  animate={{ height: 0 }}
                  transition={{
                    duration: POUR_DURATION_S,
                    ease: POUR_EASE,
                  }}
                />
              ) : (
                <rect x={0} y={0} width={240} height={vbH} fill="black" />
              )}
            </mask>
            <linearGradient id={flowStrokeGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
              <stop offset="50%" stopColor="var(--accent)" stopOpacity={0.9} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.35} />
            </linearGradient>
          </>
        ) : null}
      </defs>

      <text
        {...textAttrs}
        fill="none"
        className={
          isRight
            ? "fill-none stroke-foreground/45 dark:stroke-white/50"
            : "fill-none stroke-foreground/55 dark:stroke-white/45"
        }
        strokeWidth={isCenter ? 2.5 : isLeft ? 2.25 : 2}
      >
        {label}
      </text>

      {isCenter && pourActive ? (
        <g clipPath={`url(#${clipId})`} mask={`url(#${flowMaskId})`}>
          <motion.text
            {...textAttrs}
            fill="none"
            stroke={`url(#${flowStrokeGradId})`}
            strokeWidth={2.2}
            strokeDasharray="6 14"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: -120 }}
            transition={{
              duration: 2.1,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {label}
          </motion.text>
        </g>
      ) : null}

      <g
        clipPath={`url(#${clipId})`}
        style={{ opacity: "var(--hero-water-fill-opacity, 0.9)" }}
      >
        <rect
          width="240"
          height={vbH}
          y={0}
          fill={useActiveLiquid ? `url(#${gradActive})` : `url(#${gradMuted})`}
          mask={`url(#${maskId})`}
          opacity={useActiveLiquid ? 1 : 0}
        />
      </g>
    </svg>
  );
}

function JarWithLiquid({
  jarUid,
  cycleStep,
  fillCycleKey,
  spoutRef,
}: {
  jarUid: string;
  cycleStep: CycleStep;
  fillCycleKey: number;
  spoutRef: RefObject<SVGCircleElement | null>;
}) {
  const clipInner = `${jarUid}-jar-inner-clip`;
  const liquidGrad = `${jarUid}-jar-liq`;
  const pouring = cycleStep === "pour";
  const sliding = cycleStep === "slide";

  return (
    <svg
      className="h-[100px] w-[120px] shrink-0"
      viewBox="0 0 120 100"
      fill="none"
      aria-hidden
    >
      <defs>
        <clipPath id={clipInner}>
          <path d={JAR_INTERIOR_D} fill="white" />
        </clipPath>
        <linearGradient id={liquidGrad} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.92} />
          <stop offset="45%" stopColor="var(--ring)" stopOpacity={0.94} />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.96} />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${clipInner})`}>
        <motion.path
          key={fillCycleKey}
          fill={`url(#${liquidGrad})`}
          style={{ opacity: "var(--hero-water-fill-opacity, 0.78)" }}
          initial={{ d: jarLiquidFull }}
          animate={{
            d: pouring ? jarLiquidDrained : jarLiquidFull,
          }}
          transition={{
            duration: pouring ? POUR_DURATION_S : sliding ? SLIDE_DURATION_S : 0,
            ease: pouring ? POUR_EASE : SLIDE_EASE,
          }}
        />
        {/* PNG logo: no plate behind it — centered on the glass; GAMLISH as before */}
        <g transform="translate(60 50)">
          <image
            href={BRAND.logoUrl}
            x={-24}
            y={-12}
            width={48}
            height={24}
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
        <text
          x={60}
          y={78}
          textAnchor="middle"
          fontSize={7}
          fontWeight={600}
          letterSpacing="0.12em"
          fill="var(--foreground)"
          fillOpacity={0.5}
          className="dark:fill-white/55"
        >
          GAMLISH
        </text>
      </g>

      <path
        d="M38 12h44v6a8 8 0 0 1-8 8H46a8 8 0 0 1-8-8v-6Z"
        className="stroke-primary"
        strokeOpacity={0.78}
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d={JAR_INTERIOR_D}
        className="stroke-primary"
        strokeOpacity={0.85}
        strokeWidth="2"
        fill="none"
      />

      <circle
        ref={spoutRef}
        cx={119}
        cy={17}
        r={4.5}
        fill="transparent"
        aria-hidden
      />
    </svg>
  );
}

/** Slots 0–1–2 = visible window; slot 3 = next-upcoming (off-screen right until slide). */
function slotRole(i: number): PositionState["slot"] {
  if (i === 0) return "left";
  if (i === 1) return "center";
  return "right";
}

export function HeroAnimation() {
  const uid = useId();
  /** Same stops as jar liquid — defs live on the stream SVG so `url(#id)` resolves reliably */
  const streamJarMatchGradId = `${uid}-stream-jar-match`;
  const streamShimmerId = `${uid}-stream-shimmer`;
  const jarUid = `${uid}-jar`;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselX, setCarouselX] = useState(0);
  const [fillCycleKey, setFillCycleKey] = useState(0);
  const [cycleStep, setCycleStep] = useState<CycleStep>("connect");
  const slideGuard = useRef(false);
  const pendingSlideComplete = useRef(false);
  /** Stream SVG coords must use this box — same parent as `inset-0` overlay (not the outer section). */
  const streamTrackRef = useRef<HTMLDivElement>(null);
  /** Paths are drawn in this SVG’s viewport — mouth/band math must use this rect, not the track alone. */
  const streamSvgRef = useRef<SVGSVGElement>(null);
  const centerScoreSvgRef = useRef<SVGSVGElement>(null);
  const spoutRef = useRef<SVGCircleElement>(null);
  const [streamGeom, setStreamGeom] = useState<StreamGeom | null>(null);
  const [isMobileLayout, setIsMobileLayout] = useState(false);

  const n = SCORES.length;

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(max-width: ${MOBILE_HERO_MAX_WIDTH_PX}px)`);
    const apply = () => setIsMobileLayout(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /**
   * Four logical scores: prev | active | next | next-next.
   * Viewport shows three columns; the fourth sits clipped to the right so when we slide −1 step,
   * the upcoming band is already mounted — no empty center / missing right.
   */
  const stripIndices = useMemo(
    () => [0, 1, 2, 3].map((k) => (currentIndex - 1 + k + n) % n),
    [currentIndex, n],
  );

  const [slotWidthPx, setSlotWidthPx] = useState(0);

  /** Visible window: three columns + gaps + bleed (clip container). */
  const carouselWidthCss = `calc(${CAROUSEL_INLINE_BLEED_REM * 2}rem + 3 * ${SLOT_COLUMN_W_REM}rem + 2 * ${SLOT_GAP_REM}rem)`;
  /** Full strip width: four columns so the “next next” item exists before the slide finishes. */
  const stripInnerWidthCss = `calc(${CAROUSEL_INLINE_BLEED_REM * 2}rem + 4 * ${SLOT_COLUMN_W_REM}rem + 3 * ${SLOT_GAP_REM}rem)`;
  /**
   * Jar shifted so that, once tilted, the mouth aims at the center column.
   * Final pipe endpoints come from getBoundingClientRect (mouth + glyph top).
   */
  const jarLeftCss = `calc(${CAROUSEL_INLINE_BLEED_REM}rem + ${SLOT_COLUMN_W_REM}rem + ${SLOT_GAP_REM}rem - ${JAR_WIDTH_REM}rem)`;

  useEffect(() => {
    const measure = () => {
      const rem =
        parseFloat(
          typeof window !== "undefined"
            ? getComputedStyle(document.documentElement).fontSize
            : "16",
        ) || 16;
      setSlotWidthPx(SLOT_COLUMN_W_REM * rem + SLOT_GAP_REM * rem);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const updateStreamPath = useCallback(() => {
    const root = streamTrackRef.current;
    const svg = streamSvgRef.current;
    const glyph = centerScoreSvgRef.current;
    const spout = spoutRef.current;
    if (!root || !svg || !glyph || !spout) return;
    const svgR = svg.getBoundingClientRect();
    const g = glyph.getBoundingClientRect();
    const s = spout.getBoundingClientRect();
    let mouthX = s.left + s.width / 2 - svgR.left + PIPE_MOUTH_NUDGE_X_PX;
    let mouthY = s.top + s.height / 2 - svgR.top + PIPE_MOUTH_NUDGE_Y_PX;

    const ink = bandInkTopCenterInViewport(glyph, svgR);
    const textEl = glyph.querySelector("text");
    const tr = textEl?.getBoundingClientRect();
    const bandTopX =
      ink?.cx ??
      (tr ? tr.left + tr.width / 2 - svgR.left : g.left + g.width / 2 - svgR.left);
    const inkTopY = ink?.inkTopY ?? (tr ? tr.top - svgR.top : g.top - svgR.top);
    if (inkTopY <= mouthY + 1) return;
    setStreamGeom(buildSmoothPour(mouthX, mouthY, bandTopX, inkTopY));
  }, [isMobileLayout]);

  useLayoutEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => updateStreamPath());
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [updateStreamPath, currentIndex, fillCycleKey, cycleStep, isMobileLayout]);

  useEffect(() => {
    window.addEventListener("resize", updateStreamPath);
    const el = streamTrackRef.current;
    const ro =
      typeof ResizeObserver !== "undefined" && el
        ? new ResizeObserver(() => updateStreamPath())
        : null;
    ro?.observe(el as Element);
    return () => {
      window.removeEventListener("resize", updateStreamPath);
      ro?.disconnect();
    };
  }, [updateStreamPath]);

  useEffect(() => {
    if (cycleStep === "slide") return;
    const t0 = performance.now();
    let id = 0;
    const loop = () => {
      updateStreamPath();
      if (performance.now() - t0 < Math.max(TILT_DURATION_S * 1000 + 500, 1800)) {
        id = requestAnimationFrame(loop);
      }
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [cycleStep, fillCycleKey, updateStreamPath]);

  const finishSlideTransition = useCallback(() => {
    if (!pendingSlideComplete.current) return;
    pendingSlideComplete.current = false;
    setCurrentIndex((i) => (i + 1) % n);
    setCarouselX(0);
    setFillCycleKey((k) => k + 1);
    setCycleStep("connect");
    slideGuard.current = false;
  }, [n]);

  const runSlide = useCallback(() => {
    if (slideGuard.current) return;
    slideGuard.current = true;
    if (slotWidthPx <= 0) {
      setCurrentIndex((i) => (i + 1) % n);
      setCarouselX(0);
      setFillCycleKey((k) => k + 1);
      setCycleStep("connect");
      slideGuard.current = false;
      return;
    }
    pendingSlideComplete.current = true;
    if (isMobileLayout) {
      return;
    }
    setCarouselX(-slotWidthPx);
  }, [n, slotWidthPx, isMobileLayout]);

  const onDesktopCarouselSlideComplete = useCallback(() => {
    finishSlideTransition();
  }, [finishSlideTransition]);

  const onMobileBandExitComplete = useCallback(() => {
    if (!isMobileLayout || !pendingSlideComplete.current) return;
    finishSlideTransition();
  }, [isMobileLayout, finishSlideTransition]);

  useEffect(() => {
    if (cycleStep !== "connect") return;
    const t = window.setTimeout(() => setCycleStep("pipeFill"), PIPE_CONNECT_S * 1000);
    return () => clearTimeout(t);
  }, [cycleStep, fillCycleKey]);

  useEffect(() => {
    if (cycleStep !== "pipeFill") return;
    const t = window.setTimeout(() => setCycleStep("pour"), PIPE_WATER_S * 1000);
    return () => clearTimeout(t);
  }, [cycleStep, fillCycleKey]);

  useEffect(() => {
    if (cycleStep !== "pour") return;
    const t = window.setTimeout(() => {
      setCycleStep("slide");
      runSlide();
    }, POUR_DURATION_S * 1000);
    return () => clearTimeout(t);
  }, [cycleStep, fillCycleKey, runSlide]);

  const tilted =
    cycleStep === "connect" || cycleStep === "pipeFill" || cycleStep === "pour";
  const streamVisible = cycleStep !== "slide" && streamGeom !== null;
  const showPipeWater = cycleStep === "pipeFill" || cycleStep === "pour";

  return (
    <div
      className="mx-auto w-full min-w-0 max-w-[min(100%,76rem)] scale-[0.9] sm:scale-[0.88] md:scale-100"
      style={{ minHeight: "min(220px, 50vw)" }}
    >
      <section
        className="relative flex min-h-0 flex-col bg-transparent px-2 pb-0 pt-8 text-foreground sm:px-4 sm:pt-10 md:pt-12"
        aria-label="Band score liquid animation"
      >
        <div
          ref={streamTrackRef}
          className="relative z-10 mx-auto w-full overflow-visible pt-2 sm:pt-3"
          style={{
            width: isMobileLayout ? "100%" : carouselWidthCss,
            maxWidth: "100%",
          }}
        >
          <div
            className="pointer-events-none absolute z-[50]"
            style={
              isMobileLayout
                ? {
                    left: "0.25rem",
                    bottom: "100%",
                    marginTop: "0.35rem",
                    marginBottom: "-0.55rem",
                  }
                : {
                    left: jarLeftCss,
                    bottom: "100%",
                    marginTop: "0.35rem",
                    marginBottom: "-0.55rem",
                  }
            }
          >
            <motion.div
              key={fillCycleKey}
              className="origin-[78%_92%]"
              initial={{ rotate: 0 }}
              animate={{ rotate: tilted ? JAR_TILT_DEG : 0 }}
              transition={{
                rotate: {
                  duration: tilted ? TILT_DURATION_S : JAR_RETURN_DURATION_S,
                  ease: tilted ? TILT_EASE_IN : JAR_RETURN_EASE,
                },
              }}
            >
              <JarWithLiquid
                jarUid={jarUid}
                cycleStep={cycleStep}
                fillCycleKey={fillCycleKey}
                spoutRef={spoutRef}
              />
            </motion.div>
          </div>

          <svg
            ref={streamSvgRef}
            className="pointer-events-none absolute z-[44] w-full overflow-visible sm:min-h-[260px] md:min-h-[300px]"
            style={{
              top: "-0.85rem",
              left: 0,
              right: 0,
              bottom: "-2.75rem",
              height: "calc(100% + 1.1rem + 2.75rem)",
              minHeight: "min(320px, 56vw)",
            }}
            aria-hidden
          >
            <defs>
              <linearGradient id={streamJarMatchGradId} x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.92} />
                <stop offset="45%" stopColor="var(--ring)" stopOpacity={0.94} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.96} />
              </linearGradient>
              <linearGradient id={streamShimmerId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(255 255 255)" stopOpacity={0} />
                <stop offset="50%" stopColor="rgb(255 255 255)" stopOpacity={0.55} />
                <stop offset="100%" stopColor="rgb(255 255 255)" stopOpacity={0} />
              </linearGradient>
              {streamGeom ? (
                <>
                  <linearGradient
                    id={`${uid}-stream-depth`}
                    gradientUnits="userSpaceOnUse"
                    x1={streamGeom.cubic ? streamGeom.mouthX : streamGeom.elbowX}
                    y1={streamGeom.cubic ? streamGeom.mouthY : streamGeom.elbowY}
                    x2={streamGeom.bandTopX}
                    y2={streamGeom.bandTopY}
                  >
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.98} />
                    <stop offset="40%" stopColor="var(--ring)" stopOpacity={0.96} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={1} />
                  </linearGradient>
                  <filter
                    id={`${uid}-stream-soft-glow`}
                    x="-65%"
                    y="-65%"
                    width="230%"
                    height="230%"
                  >
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                    </feMerge>
                  </filter>
                </>
              ) : null}
            </defs>
            {streamVisible && streamGeom ? (
              <>
                <motion.circle
                  key={`joint-mouth-${fillCycleKey}`}
                  cx={streamGeom.mouthX}
                  cy={streamGeom.mouthY}
                  r={6}
                  fill="var(--muted-foreground)"
                  fillOpacity={0.45}
                  className="dark:fill-white/35"
                  initial={{ scale: 0.35, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: PIPE_CONNECT_S * 0.85,
                    ease: PIPE_CONNECT_EASE,
                  }}
                />
                <motion.circle
                  key={`joint-band-ring-${fillCycleKey}`}
                  cx={streamGeom.bandTopX}
                  cy={streamGeom.inkTopY + 3}
                  r={10}
                  fill="none"
                  stroke="var(--muted-foreground)"
                  strokeOpacity={0.6}
                  strokeWidth={2.5}
                  className="dark:stroke-white/50"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: PIPE_CONNECT_S * 0.85,
                    ease: PIPE_CONNECT_EASE,
                  }}
                />
                <motion.circle
                  key={`joint-band-${fillCycleKey}`}
                  cx={streamGeom.bandTopX}
                  cy={streamGeom.inkTopY + 3}
                  r={6}
                  fill="var(--primary)"
                  fillOpacity={0.42}
                  className="dark:fill-primary"
                  initial={{ scale: 0.35, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: PIPE_CONNECT_S * 0.85,
                    ease: PIPE_CONNECT_EASE,
                  }}
                />
                {!streamGeom.cubic &&
                Math.hypot(streamGeom.elbowX - streamGeom.mouthX, streamGeom.elbowY - streamGeom.mouthY) >
                  3 ? (
                  <motion.circle
                    key={`joint-elbow-${fillCycleKey}`}
                    cx={streamGeom.elbowX}
                    cy={streamGeom.elbowY}
                    r={5}
                    fill="var(--muted-foreground)"
                    fillOpacity={0.38}
                    className="dark:fill-white/30"
                    initial={{ scale: 0.35, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: PIPE_CONNECT_S * 0.85,
                      ease: PIPE_CONNECT_EASE,
                    }}
                  />
                ) : null}
                <motion.path
                  key={`pipe-shell-${fillCycleKey}`}
                  d={streamGeom.d}
                  fill="none"
                  stroke="var(--muted-foreground)"
                  strokeOpacity={0.5}
                  className="dark:stroke-white/40"
                  strokeWidth={JET_STROKE_W + 5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    pathLength: {
                      duration: PIPE_CONNECT_S,
                      ease: PIPE_CONNECT_EASE,
                    },
                  }}
                />
                <motion.path
                  key={`pipe-rim-${fillCycleKey}`}
                  d={streamGeom.d}
                  fill="none"
                  stroke="var(--foreground)"
                  strokeOpacity={0.12}
                  className="dark:stroke-white/20"
                  strokeWidth={JET_STROKE_W + 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    pathLength: {
                      duration: PIPE_CONNECT_S,
                      ease: PIPE_CONNECT_EASE,
                    },
                  }}
                />
              </>
            ) : null}
            {streamVisible && showPipeWater && streamGeom ? (
              <>
                <motion.path
                  key={`water-glow-blur-${fillCycleKey}`}
                  d={streamGeom.d}
                  fill="none"
                  filter={`url(#${uid}-stream-soft-glow)`}
                  stroke="var(--primary)"
                  strokeOpacity={0.55}
                  strokeWidth={JET_OUTER_GLOW_W}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    pathLength: {
                      duration: PIPE_WATER_S,
                      ease: POUR_EASE,
                    },
                  }}
                />
                <motion.path
                  key={`water-halo-${fillCycleKey}`}
                  d={streamGeom.d}
                  fill="none"
                  stroke="var(--primary)"
                  strokeOpacity={0.38}
                  strokeWidth={JET_SOFT_HALO_W}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    pathLength: {
                      duration: PIPE_WATER_S,
                      ease: POUR_EASE,
                    },
                  }}
                />
                <motion.path
                  key={`water-body-${fillCycleKey}`}
                  d={streamGeom.d}
                  fill="none"
                  stroke={`url(#${uid}-stream-depth)`}
                  strokeWidth={JET_STROKE_W + 3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    pathLength: {
                      duration: PIPE_WATER_S,
                      ease: POUR_EASE,
                    },
                  }}
                />
                <motion.path
                  key={`water-core-${fillCycleKey}`}
                  d={streamGeom.d}
                  fill="none"
                  stroke={`url(#${streamJarMatchGradId})`}
                  strokeWidth={JET_STROKE_W}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    pathLength: {
                      duration: PIPE_WATER_S,
                      ease: POUR_EASE,
                    },
                  }}
                />
                <motion.path
                  key={`water-spec-${fillCycleKey}`}
                  d={streamGeom.d}
                  fill="none"
                  stroke="rgb(255 255 255)"
                  strokeOpacity={0.33}
                  strokeWidth={3.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    pathLength: {
                      duration: PIPE_WATER_S,
                      ease: POUR_EASE,
                    },
                  }}
                  className="mix-blend-screen dark:mix-blend-soft-light"
                />
              </>
            ) : null}
            {streamVisible && showPipeWater && streamGeom ? (
              <motion.path
                key={`water-shimmer-${fillCycleKey}`}
                d={streamGeom.d}
                stroke={`url(#${streamShimmerId})`}
                strokeWidth={JET_SHIMMER_W}
                fill="none"
                strokeLinecap="round"
                strokeDasharray="5 11"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -48 }}
                transition={{
                  duration: cycleStep === "pour" ? 0.72 : 0.95,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="opacity-55 mix-blend-screen dark:mix-blend-soft-light"
              />
            ) : null}
            {streamVisible && showPipeWater && streamGeom
              ? [0.14, 0.33, 0.5, 0.67, 0.84].map((t, i) => {
                  const [px, py] = pointOnDownspout(t, streamGeom);
                  const [nx, ny] = normalOnDownspout(t, streamGeom);
                  const side = i % 2 === 0 ? 1 : -1;
                  const spread = 3.2 + (i % 3) * 0.85;
                  return (
                    <motion.circle
                      key={`droplet-${fillCycleKey}-${i}`}
                      cx={px + side * nx * spread * 0.4}
                      cy={py + side * ny * spread * 0.4}
                      r={1.15 + (i % 4) * 0.35}
                      fill="var(--primary)"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity:
                          cycleStep === "pour"
                            ? [0.22, 0.82, 0.28]
                            : [0.12, 0.42, 0.18],
                      }}
                      transition={{
                        duration: cycleStep === "pour" ? 0.48 + i * 0.06 : 0.7,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                        delay: i * 0.04,
                      }}
                    />
                  );
                })
              : null}
          </svg>

          <div className="relative z-[20] flex w-full min-w-0 items-end justify-center pb-0 pt-2 sm:pt-4 md:pt-5">
            {isMobileLayout ? (
              <div className="flex w-full min-w-0 justify-end overflow-x-clip overflow-y-visible pl-[4.5rem] pr-2 sm:pr-3">
                <motion.div
                  className="flex w-auto max-w-[min(calc(100%-4rem),14rem)] shrink-0 justify-end"
                  variants={mobileBandExitVariants}
                  initial={false}
                  animate={cycleStep === "slide" ? "exiting" : "settled"}
                  transition={{ duration: SLIDE_DURATION_S, ease: SLIDE_EASE }}
                  onAnimationComplete={onMobileBandExitComplete}
                >
                  <motion.div
                    className="flex shrink-0 items-end justify-center overflow-visible"
                    style={{
                      width: `${SLOT_COLUMN_W_REM}rem`,
                      minHeight: "7rem",
                      transformOrigin: "bottom center",
                    }}
                    variants={carouselSlotVariants}
                    initial={false}
                    animate={cycleStep === "slide" ? "slideUniform" : "center"}
                  >
                    <BandScoreGlyph
                      score={SCORES[currentIndex] ?? SCORES[0]}
                      slot="center"
                      fillCycleKey={fillCycleKey}
                      uid={uid}
                      slotIndex={1}
                      pourActive={cycleStep === "pour"}
                      cycleStep={cycleStep}
                      glyphRef={centerScoreSvgRef}
                    />
                  </motion.div>
                </motion.div>
              </div>
            ) : (
              <div
                className="min-w-0 overflow-x-clip overflow-y-visible"
                style={{ width: carouselWidthCss, maxWidth: "100%" }}
              >
                <motion.div
                  className="flex shrink-0 items-end justify-center"
                  style={{
                    gap: `${SLOT_GAP_REM}rem`,
                    paddingLeft: `${CAROUSEL_INLINE_BLEED_REM}rem`,
                    paddingRight: `${CAROUSEL_INLINE_BLEED_REM}rem`,
                    minWidth: stripInnerWidthCss,
                  }}
                  animate={{ x: carouselX }}
                  transition={
                    carouselX === 0
                      ? { duration: 0 }
                      : { duration: SLIDE_DURATION_S, ease: SLIDE_EASE }
                  }
                  onAnimationComplete={onDesktopCarouselSlideComplete}
                >
                  {stripIndices.map((scoreIdx, i) => {
                    const role = slotRole(i);
                    return (
                      <motion.div
                        key={i}
                        className="flex shrink-0 items-end justify-center overflow-visible"
                        style={{
                          width: `${SLOT_COLUMN_W_REM}rem`,
                          minHeight: "7rem",
                          transformOrigin: "bottom center",
                        }}
                        variants={carouselSlotVariants}
                        initial={false}
                        animate={
                          cycleStep === "slide"
                            ? "slideUniform"
                            : role === "center"
                              ? "center"
                              : role === "left"
                                ? "leftFilled"
                                : "rightPreview"
                        }
                      >
                        <BandScoreGlyph
                          score={SCORES[scoreIdx] ?? SCORES[0]}
                          slot={role}
                          fillCycleKey={fillCycleKey}
                          uid={uid}
                          slotIndex={i}
                          pourActive={role === "center" && cycleStep === "pour"}
                          cycleStep={cycleStep}
                          {...(i === 1 ? { glyphRef: centerScoreSvgRef } : {})}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
