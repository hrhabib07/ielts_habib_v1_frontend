"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

/** Fades between the level map and steps. Opacity only: a transform would break the player's fixed layout. */
export default function ChatLessonTemplate({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
