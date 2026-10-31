"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { LessonFeedbackItemKind } from "@/src/lib/api/lessonFeedback";

/** Anything visible in the chat that a learner can flag. */
export type FlagTarget = {
  refId: string;
  kind: LessonFeedbackItemKind;
  part: string;
  text: string;
};

type Sheet = "profile" | "feedback" | null;

/** Screen point the profile grows out of (the tapped avatar's centre). */
export type ProfileOrigin = { x: number; y: number };

type LessonFlags = {
  sheet: Sheet;
  profileOrigin: ProfileOrigin | null;
  flagMode: boolean;
  flagged: FlagTarget[];
  dragOverRef: string | null;
  openProfile: (origin?: ProfileOrigin) => void;
  openFeedback: () => void;
  closeSheet: () => void;
  startFlagging: () => void;
  stopFlagging: () => void;
  toggleFlag: (target: FlagTarget) => void;
  removeFlag: (refId: string) => void;
  clearFlags: () => void;
  isFlagged: (refId: string) => boolean;
  setDragOverRef: (refId: string | null) => void;
  registerTarget: (target: FlagTarget) => void;
  targetFor: (refId: string) => FlagTarget | undefined;
};

const LessonFlagsContext = createContext<LessonFlags | null>(null);

export function LessonFlagsProvider({ children }: { children: ReactNode }) {
  const [sheet, setSheet] = useState<Sheet>(null);
  const [profileOrigin, setProfileOrigin] = useState<ProfileOrigin | null>(null);
  const [flagMode, setFlagMode] = useState(false);
  const [flagged, setFlagged] = useState<FlagTarget[]>([]);
  const [dragOverRef, setDragOverRef] = useState<string | null>(null);
  const targets = useRef(new Map<string, FlagTarget>());

  const toggleFlag = useCallback((target: FlagTarget) => {
    setFlagged((current) =>
      current.some((t) => t.refId === target.refId)
        ? current.filter((t) => t.refId !== target.refId)
        : [...current, target],
    );
  }, []);

  const removeFlag = useCallback((refId: string) => {
    setFlagged((current) => current.filter((t) => t.refId !== refId));
  }, []);

  const value = useMemo<LessonFlags>(
    () => ({
      sheet,
      profileOrigin,
      flagMode,
      flagged,
      dragOverRef,
      openProfile: (origin) => {
        setProfileOrigin(origin ?? null);
        setSheet("profile");
      },
      openFeedback: () => {
        setFlagMode(false);
        setSheet("feedback");
      },
      closeSheet: () => setSheet(null),
      startFlagging: () => {
        setSheet(null);
        setFlagMode(true);
      },
      stopFlagging: () => {
        setFlagMode(false);
        setDragOverRef(null);
      },
      toggleFlag,
      removeFlag,
      clearFlags: () => setFlagged([]),
      isFlagged: (refId) => flagged.some((t) => t.refId === refId),
      setDragOverRef,
      registerTarget: (target) => targets.current.set(target.refId, target),
      targetFor: (refId) => targets.current.get(refId),
    }),
    [sheet, profileOrigin, flagMode, flagged, dragOverRef, toggleFlag, removeFlag],
  );

  return <LessonFlagsContext.Provider value={value}>{children}</LessonFlagsContext.Provider>;
}

/** Null outside a lesson (e.g. avatar previews on the level map). */
export function useLessonFlags(): LessonFlags | null {
  return useContext(LessonFlagsContext);
}
