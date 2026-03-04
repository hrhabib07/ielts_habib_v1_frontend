"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { LevelDetailForStudent } from "@/src/lib/api/readingStrictProgression";

interface ReadingLevelDetailContextValue {
  detail: LevelDetailForStudent | null;
  setDetail: (d: LevelDetailForStudent | null) => void;
}

const ReadingLevelDetailContext =
  createContext<ReadingLevelDetailContextValue | null>(null);

export function ReadingLevelDetailProvider({ children }: { children: ReactNode }) {
  const [detail, setDetail] = useState<LevelDetailForStudent | null>(null);
  const setDetailStable = useCallback((d: LevelDetailForStudent | null) => {
    setDetail(d);
  }, []);
  return (
    <ReadingLevelDetailContext.Provider
      value={{ detail, setDetail: setDetailStable }}
    >
      {children}
    </ReadingLevelDetailContext.Provider>
  );
}

export function useReadingLevelDetail(): ReadingLevelDetailContextValue {
  const ctx = useContext(ReadingLevelDetailContext);
  if (!ctx) {
    return {
      detail: null,
      setDetail: () => {},
    };
  }
  return ctx;
}
