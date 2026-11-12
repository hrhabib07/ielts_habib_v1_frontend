"use client";

import { useState } from "react";
import { LANG_FACE } from "@/src/features/chat-lesson/lib/uiCopy";
import { useLearnerContext } from "@/src/features/learner/LearnerContext";
import { LEARNER_UI } from "@/src/features/learner/lib/copy";
import { learnerInitial, type Learner } from "@/src/features/learner/lib/personalize";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { box: "size-9", ring: "inset-[2px]", text: "text-sm" },
  md: { box: "size-12", ring: "inset-[2.5px]", text: "text-lg" },
  lg: { box: "size-24", ring: "inset-[3.5px]", text: "text-4xl" },
} as const;

/** Learner photo (or first letter) inside a warm gradient ring, the learner's twin of the Gamlish avatar. */
export function LearnerAvatarImage({ learner, size = "sm" }: { learner: Learner; size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const photo = learner.photoSrc && learner.photoSrc !== failedSrc ? learner.photoSrc : null;
  return (
    <span className={cn("relative flex shrink-0 rounded-full shadow-[0_6px_16px_-6px_rgba(251,146,60,0.7)]", s.box)}>
      <span
        className="absolute inset-0 rounded-full bg-[conic-gradient(from_200deg,#fdba74,#f97316,#ec4899,#fbbf24,#fdba74)]"
        aria-hidden
      />
      <span className={cn("absolute rounded-full bg-white p-[1.5px]", s.ring)}>
        <span className="relative flex size-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-400 to-pink-500">
          {photo ? (
            // Photos come from the learner's own upload (same-origin API proxy), so a plain img is enough.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="size-full object-cover" onError={() => setFailedSrc(photo)} />
          ) : (
            <span className={cn(LANG_FACE.en, "font-black text-white", s.text)}>{learnerInitial(learner)}</span>
          )}
        </span>
      </span>
    </span>
  );
}

/** The learner's avatar anywhere in the app: tapping it opens their profile card (when they have an account). */
export function LearnerAvatarButton({ size = "sm", className }: { size?: keyof typeof SIZES; className?: string }) {
  const { learner, actions, openProfile } = useLearnerContext();
  if (!actions) {
    return (
      <span className={cn("mt-0.5 shrink-0", className)}>
        <LearnerAvatarImage learner={learner} size={size} />
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={openProfile}
      aria-label={LEARNER_UI.profileOpen.en}
      title={LEARNER_UI.profileOpen.en}
      className={cn(
        "mt-0.5 shrink-0 cursor-pointer rounded-full transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200",
        className,
      )}
    >
      <LearnerAvatarImage learner={learner} size={size} />
    </button>
  );
}
