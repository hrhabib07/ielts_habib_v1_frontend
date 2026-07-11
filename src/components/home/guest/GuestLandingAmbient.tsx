"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Rich midnight atmosphere behind the guest landing — premium, not flat. */
export function GuestLandingAmbient() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,color-mix(in_srgb,var(--steel)_18%,transparent),transparent_70%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.2] [mask-image:radial-gradient(ellipse_80%_55%_at_50%_0%,#000_45%,transparent_100%)] dark:opacity-[0.12]"
          aria-hidden
        />
      </>
    );
  }

  return (
    <div className="absolute inset-0">
      <div
        className="guest-landing-grid pointer-events-none absolute inset-0 opacity-[0.22] dark:opacity-[0.14]"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[-8%] h-[min(72vh,720px)] w-[min(110%,980px)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--steel)_28%,transparent),transparent_68%)] blur-2xl"
        aria-hidden
        animate={{ opacity: [0.45, 0.7, 0.45], scale: [1, 1.03, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute left-0 top-[12%] h-[min(420px,55vw)] w-[min(420px,55vw)] -translate-x-1/4 rounded-full bg-primary/10 blur-[120px] dark:bg-primary/18"
        aria-hidden
        animate={{ x: [0, 28, 0], y: [0, 18, 0], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute right-0 top-[28%] h-[min(360px,50vw)] w-[min(360px,50vw)] translate-x-1/4 rounded-full bg-accent/12 blur-[110px] dark:bg-accent/18"
        aria-hidden
        animate={{ x: [0, -22, 0], y: [0, 24, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <div className="guest-landing-light-sweep pointer-events-none absolute inset-0" aria-hidden />
    </div>
  );
}
