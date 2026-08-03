"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AUTO_ADVANCE_CORRECT_CHANGE_EVENT,
  AUTO_ADVANCE_CORRECT_STORAGE_KEY,
  readAutoAdvanceCorrect,
  writeAutoAdvanceCorrect,
} from "@/src/lib/player-auto-advance";

/** Live preference · default true until hydrated from localStorage. */
export function useAutoAdvanceCorrect(): boolean {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(readAutoAdvanceCorrect());

    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<boolean>).detail;
      if (typeof detail === "boolean") {
        setEnabled(detail);
        return;
      }
      setEnabled(readAutoAdvanceCorrect());
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== AUTO_ADVANCE_CORRECT_STORAGE_KEY) return;
      setEnabled(readAutoAdvanceCorrect());
    };

    window.addEventListener(AUTO_ADVANCE_CORRECT_CHANGE_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(AUTO_ADVANCE_CORRECT_CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return enabled;
}

export function useAutoAdvanceCorrectSetting(): {
  enabled: boolean;
  setEnabled: (next: boolean) => void;
} {
  const enabled = useAutoAdvanceCorrect();
  const setEnabled = useCallback((next: boolean) => {
    writeAutoAdvanceCorrect(next);
  }, []);
  return { enabled, setEnabled };
}
