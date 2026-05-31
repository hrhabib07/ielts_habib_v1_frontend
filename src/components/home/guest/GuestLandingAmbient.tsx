"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Slow ambient orbs and light sweep behind the guest landing. */
export function GuestLandingAmbient() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <>
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.28] [mask-image:radial-gradient(ellipse_80%_55%_at_50%_0%,#000_45%,transparent_100%)] dark:opacity-[0.16]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[min(70vh,640px)] w-[min(100%,920px)] -translate-x-1/2 rounded-full bg-accent/10 blur-[100px] dark:bg-accent/15"
          aria-hidden
        />
      </>
    );
  }

  return (
    <div className="absolute inset-0">
      <div
        className="guest-landing-grid pointer-events-none absolute inset-0 opacity-[0.32] dark:opacity-[0.18]"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute left-0 top-[8%] h-[min(420px,55vw)] w-[min(420px,55vw)] -translate-x-1/4 rounded-full bg-primary/12 blur-[120px] dark:bg-primary/20"
        aria-hidden
        animate={{ x: [0, 28, 0], y: [0, 18, 0], opacity: [0.45, 0.65, 0.45] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute right-0 top-[22%] h-[min(360px,50vw)] w-[min(360px,50vw)] translate-x-1/4 rounded-full bg-accent/14 blur-[110px] dark:bg-accent/22"
        aria-hidden
        animate={{ x: [0, -22, 0], y: [0, 24, 0], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-[12%] left-1/2 h-[280px] w-[min(90%,640px)] -translate-x-1/2 rounded-full bg-accent/8 blur-[90px] dark:bg-accent/14"
        aria-hidden
        animate={{ opacity: [0.25, 0.42, 0.25], scale: [1, 1.04, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <div className="guest-landing-light-sweep pointer-events-none absolute inset-0" aria-hidden />
    </div>
  );
}
