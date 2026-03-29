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
const SCORES = [5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0] as const;

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
const SLIDE_DURATION_S = 2;
const SLOT_GAP_REM = 1;
const SLOT_COLUMN_W_REM = 18;
/** Side inset inside the clip so scaled center/right glyphs are not cut off */
const CAROUSEL_INLINE_BLEED_REM = 0.75;

const POUR_EASE: [number, number, number, number] = [0.55, 0.02, 0.35, 1];
const PIPE_CONNECT_EASE: [number, number, number, number] = [0.33, 1, 0.68, 1];
const SLIDE_EASE: [number, number, number, number] = [0.42, 0, 0.58, 1];
const TILT_EASE_IN: [number, number, number, number] = [0.55, 0, 1, 1];
const JAR_RETURN_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const JAR_TILT_DEG = 88;
const TILT_DURATION_S = 0.55;
const JAR_RETURN_DURATION_S = 0.42;

const JET_STROKE_W = 12;
const JET_SHIMMER_W = 3;
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

interface StreamGeom {
  readonly d: string;
  readonly mouthX: number;
  readonly mouthY: number;
  readonly bandTopX: number;
  readonly bandTopY: number;
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
  rightPreview: {
    scale: 0.95,
    opacity: 1,
    filter: "none",
    transition: { duration: SLIDE_DURATION_S, ease: SLIDE_EASE },
  },
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
        cx={117}
        cy={20}
        r={4}
        fill="transparent"
        aria-hidden
      />
    </svg>
  );
}

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
  const centerScoreSvgRef = useRef<SVGSVGElement>(null);
  const spoutRef = useRef<SVGCircleElement>(null);
  const [streamGeom, setStreamGeom] = useState<StreamGeom | null>(null);

  const n = SCORES.length;

  /** Three slots only: filled left · active center · next right */
  const stripIndices = useMemo(
    () => [0, 1, 2].map((k) => (currentIndex - 1 + k + n) % n),
    [currentIndex, n],
  );

  const [slotWidthPx, setSlotWidthPx] = useState(0);

  /** Columns + gaps + horizontal bleed for transform overflow */
  const carouselWidthCss = `calc(${CAROUSEL_INLINE_BLEED_REM * 2}rem + 3 * ${SLOT_COLUMN_W_REM}rem + 2 * ${SLOT_GAP_REM}rem)`;
  /** Jar mouth aligns with center column (after inline bleed padding) */
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
    const glyph = centerScoreSvgRef.current;
    const spout = spoutRef.current;
    if (!root || !glyph || !spout) return;
    const r = root.getBoundingClientRect();
    const g = glyph.getBoundingClientRect();
    const s = spout.getBoundingClientRect();
    const mouthX = s.left + s.width / 2 - r.left;
    const mouthY = s.top + s.height / 2 - r.top - 1;
    const bandTopX = g.left + g.width / 2 - r.left;
    const bandTopY = g.top - r.top + 0.5;
    if (bandTopY <= mouthY + 0.5) return;
    setStreamGeom({
      d: `M ${mouthX} ${mouthY} L ${bandTopX} ${bandTopY}`,
      mouthX,
      mouthY,
      bandTopX,
      bandTopY,
    });
  }, []);

  useLayoutEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => updateStreamPath());
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [updateStreamPath, currentIndex, fillCycleKey, cycleStep]);

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
    setCarouselX(-slotWidthPx);
  }, [n, slotWidthPx]);

  const onSlideComplete = useCallback(() => {
    if (!pendingSlideComplete.current) return;
    pendingSlideComplete.current = false;
    setCurrentIndex((i) => (i + 1) % n);
    setCarouselX(0);
    setFillCycleKey((k) => k + 1);
    setCycleStep("connect");
    slideGuard.current = false;
  }, []);

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
      className="mx-auto w-full min-w-0 max-w-[min(100%,76rem)] scale-[0.78] sm:scale-90 md:scale-100"
      style={{ minHeight: "min(300px, 58vw)" }}
    >
      <section
        className="relative flex min-h-0 flex-col bg-transparent px-3 pb-1 pt-14 text-foreground sm:px-4 sm:pt-16 md:pt-[4.5rem]"
        aria-label="Band score liquid animation"
      >
        <div
          ref={streamTrackRef}
          className="relative z-10 mx-auto w-full"
          style={{ width: carouselWidthCss, maxWidth: "100%" }}
        >
          <div
            className="pointer-events-none absolute z-[40]"
            style={{
              left: jarLeftCss,
              bottom: "100%",
              marginBottom: "0.35rem",
            }}
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
            className="pointer-events-none absolute inset-0 z-[45] h-full min-h-[240px] w-full overflow-visible sm:min-h-[280px]"
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
                <stop offset="50%" stopColor="rgb(255 255 255)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="rgb(255 255 255)" stopOpacity={0} />
              </linearGradient>
            </defs>
            {streamVisible && streamGeom ? (
              <>
                <motion.circle
                  key={`joint-mouth-${fillCycleKey}`}
                  cx={streamGeom.mouthX}
                  cy={streamGeom.mouthY}
                  r={6.5}
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
                  key={`joint-band-${fillCycleKey}`}
                  cx={streamGeom.bandTopX}
                  cy={streamGeom.bandTopY}
                  r={6.5}
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
                <motion.path
                  key={`pipe-shell-${fillCycleKey}`}
                  d={streamGeom.d}
                  fill="none"
                  stroke="var(--muted-foreground)"
                  strokeOpacity={0.5}
                  className="dark:stroke-white/40"
                  strokeWidth={JET_STROKE_W + 8}
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
                  key={`water-glow-${fillCycleKey}`}
                  d={streamGeom.d}
                  fill="none"
                  stroke="var(--primary)"
                  strokeOpacity={0.32}
                  strokeWidth={JET_STROKE_W + 14}
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
              </>
            ) : null}
            {streamVisible && cycleStep === "pour" && streamGeom ? (
              <motion.path
                d={streamGeom.d}
                stroke={`url(#${streamShimmerId})`}
                strokeWidth={JET_SHIMMER_W}
                fill="none"
                strokeLinecap="round"
                strokeDasharray="8 14"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -44 }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="opacity-40 mix-blend-screen dark:mix-blend-soft-light"
              />
            ) : null}
          </svg>

          <div className="relative z-[20] flex w-full min-w-0 items-end justify-center pb-0 pt-4 sm:pt-5 md:pt-6">
            <div
              className="min-w-0 overflow-x-clip overflow-y-visible"
              style={{ width: carouselWidthCss, maxWidth: "100%" }}
            >
              <motion.div
                className="flex items-end justify-center"
                style={{
                  gap: `${SLOT_GAP_REM}rem`,
                  paddingLeft: `${CAROUSEL_INLINE_BLEED_REM}rem`,
                  paddingRight: `${CAROUSEL_INLINE_BLEED_REM}rem`,
                }}
                animate={{ x: carouselX }}
                transition={
                  carouselX === 0
                    ? { duration: 0 }
                    : { duration: SLIDE_DURATION_S, ease: SLIDE_EASE }
                }
                onAnimationComplete={onSlideComplete}
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
                        role === "center"
                          ? "center"
                          : role === "left"
                            ? "leftFilled"
                            : "rightPreview"
                      }
                    >
                      <BandScoreGlyph
                        score={SCORES[scoreIdx]}
                        slot={role}
                        fillCycleKey={fillCycleKey}
                        uid={uid}
                        slotIndex={i}
                        pourActive={role === "center" && cycleStep === "pour"}
                        cycleStep={cycleStep}
                        glyphRef={i === 1 ? centerScoreSvgRef : undefined}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
