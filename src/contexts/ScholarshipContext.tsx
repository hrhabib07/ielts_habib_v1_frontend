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

  const refresh = useCallback(async () => {
    if (!initialUser || initialUser.role !== "STUDENT") {
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
  }, [initialUser]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => {
      if (!initialUser || initialUser.role !== "STUDENT") return;
      void refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [initialUser, refresh]);

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
