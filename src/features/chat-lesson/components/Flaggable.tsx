"use client";

import { useEffect, type MouseEvent, type ReactNode } from "react";
import { Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLessonFlags, type FlagTarget } from "@/src/features/chat-lesson/hooks/useLessonFlags";
import { cn } from "@/lib/utils";

/**
 * Makes any chat element flaggable. In flag mode a tap toggles the flag (and blocks the element's
 * own action, e.g. selecting an option); a dragged flag dropped here flags it too.
 */
export function Flaggable({
  target,
  children,
  className,
}: {
  target: FlagTarget;
  children: ReactNode;
  className?: string;
}) {
  const flags = useLessonFlags();
  const registerTarget = flags?.registerTarget;

  useEffect(() => {
    registerTarget?.(target);
  }, [registerTarget, target]);

  if (!flags) return <div className={className}>{children}</div>;

  const flagged = flags.isFlagged(target.refId);
  const hovered = flags.dragOverRef === target.refId;
  const active = flags.flagMode;

  const onClickCapture = (event: MouseEvent) => {
    if (!active) return;
    event.preventDefault();
    event.stopPropagation();
    flags.toggleFlag(target);
  };

  return (
    <div
      data-flag-ref={target.refId}
      onClickCapture={onClickCapture}
      className={cn(
        "relative rounded-2xl transition-[box-shadow,transform] duration-150",
        active && "cursor-pointer",
        active && !flagged && "hover:shadow-[0_0_0_2px_#fdba74]",
        hovered && "scale-[1.02] shadow-[0_0_0_3px_#fb923c]",
        flagged && "shadow-[0_0_0_2.5px_#f97316]",
        className,
      )}
    >
      {children}
      {active && !flagged ? (
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-dashed border-orange-300/70"
          aria-hidden
        />
      ) : null}
      <AnimatePresence>
        {flagged ? (
          <motion.span
            key="flag"
            className="pointer-events-none absolute -right-2 -top-2 z-10 flex size-7 items-center justify-center rounded-full bg-orange-500 text-white shadow-md ring-2 ring-white"
            initial={{ scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            aria-label="Flagged"
          >
            <Flag className="size-3.5 fill-white" aria-hidden />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
