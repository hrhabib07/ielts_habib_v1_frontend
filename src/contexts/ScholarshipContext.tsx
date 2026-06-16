"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CurrentUser } from "@/src/lib/auth-server";
import { getDecodedTokenClient } from "@/src/lib/auth";
import {
  getMyScholarshipStatus,
  type ScholarshipStatus,
} from "@/src/lib/api/scholarship";

interface ScholarshipContextValue {
  status: ScholarshipStatus | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const ScholarshipContext = createContext<ScholarshipContextValue | null>(null);

export function ScholarshipProvider({
  initialUser,
  children,
}: {
  initialUser: CurrentUser | null;
  children: ReactNode;
}) {
  const [status, setStatus] = useState<ScholarshipStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [clientIsStudent, setClientIsStudent] = useState(false);

  const isStudent =
    initialUser?.role === "STUDENT" || (initialUser == null && clientIsStudent);

  useEffect(() => {
    if (initialUser?.role === "STUDENT") {
      setClientIsStudent(false);
      return;
    }
    const sync = () => {
      const decoded = getDecodedTokenClient();
      setClientIsStudent(decoded?.role === "STUDENT");
    };
    sync();
    window.addEventListener("auth-state-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("auth-state-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, [initialUser]);

  const refresh = useCallback(async () => {
    if (!isStudent) {
      setStatus(null);
      return;
    }
    setLoading(true);
    try {
      const data = await getMyScholarshipStatus();
      setStatus(data);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [isStudent]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onAuthChange = () => {
      if (!isStudent) return;
      void refresh();
    };
    window.addEventListener("auth-state-changed", onAuthChange);
    window.addEventListener("focus", onAuthChange);
    return () => {
      window.removeEventListener("auth-state-changed", onAuthChange);
      window.removeEventListener("focus", onAuthChange);
    };
  }, [isStudent, refresh]);

  const value = useMemo(
    () => ({ status, loading, refresh }),
    [status, loading, refresh],
  );

  return (
    <ScholarshipContext.Provider value={value}>{children}</ScholarshipContext.Provider>
  );
}

export function useScholarship(): ScholarshipContextValue {
  const ctx = useContext(ScholarshipContext);
  if (!ctx) {
    return {
      status: null,
      loading: false,
      refresh: async () => {},
    };
  }
  return ctx;
}
