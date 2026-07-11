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
import { isActiveStudentSessionClient } from "@/src/lib/auth";
import { getMyProfile, getProfileSummary } from "@/src/lib/api/profile";
import { getMySubscription, type ActiveSubscription } from "@/src/lib/api/subscription";
import type { ProfileSummary, StudentProfile } from "@/src/lib/api/types";
import { isFoundingMemberEligible } from "@/src/lib/foundingMember";
import { clearDedupeRequest } from "@/src/lib/api/dedupe-request";

interface StudentSessionContextValue {
  profileSummary: ProfileSummary | null;
  profile: StudentProfile | null;
  subscription: ActiveSubscription | null;
  isFoundingMember: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  invalidate: () => void;
}

const StudentSessionContext = createContext<StudentSessionContextValue | null>(null);

const EMPTY_SESSION: StudentSessionContextValue = {
  profileSummary: null,
  profile: null,
  subscription: null,
  isFoundingMember: false,
  loading: true,
  refresh: async () => {},
  invalidate: () => {},
};

export function StudentSessionProvider({
  initialUser,
  children,
}: {
  initialUser: CurrentUser | null;
  children: ReactNode;
}) {
  // Always start false on server + first client paint to avoid hydration mismatch.
  // Detect student token only after mount.
  const [clientIsStudent, setClientIsStudent] = useState(false);
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [subscription, setSubscription] = useState<ActiveSubscription | null>(null);

  const isStudent =
    initialUser?.role === "STUDENT" || (initialUser == null && clientIsStudent);

  const [loading, setLoading] = useState(() => initialUser?.role === "STUDENT");

  useEffect(() => {
    if (initialUser?.role === "STUDENT") {
      setClientIsStudent(false);
      return;
    }
    const sync = () => {
      setClientIsStudent(isActiveStudentSessionClient());
    };
    sync();
    window.addEventListener("auth-state-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("auth-state-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, [initialUser]);

  const invalidate = useCallback(() => {
    clearDedupeRequest("students/reading/dashboard");
    clearDedupeRequest("students/me");
    clearDedupeRequest("subscriptions/me");
  }, []);

  const refresh = useCallback(async () => {
    if (!isStudent) {
      setProfileSummary(null);
      setProfile(null);
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      invalidate();
      const [summaryOutcome, profileOutcome, subscriptionOutcome] =
        await Promise.allSettled([
          getProfileSummary(),
          getMyProfile(),
          getMySubscription(),
        ]);

      setProfileSummary(
        summaryOutcome.status === "fulfilled" ? summaryOutcome.value : null,
      );
      setProfile(
        profileOutcome.status === "fulfilled" ? profileOutcome.value : null,
      );
      setSubscription(
        subscriptionOutcome.status === "fulfilled"
          ? subscriptionOutcome.value
          : null,
      );
    } finally {
      setLoading(false);
    }
  }, [isStudent, invalidate]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onAuthChange = () => {
      if (
        initialUser?.role === "STUDENT" ||
        isActiveStudentSessionClient()
      ) {
        void refresh();
      }
    };
    window.addEventListener("auth-state-changed", onAuthChange);
    return () => {
      window.removeEventListener("auth-state-changed", onAuthChange);
    };
  }, [initialUser, refresh]);

  const isFoundingMember = useMemo(
    () => isFoundingMemberEligible(subscription),
    [subscription],
  );

  const value = useMemo(
    () => ({
      profileSummary,
      profile,
      subscription,
      isFoundingMember,
      loading,
      refresh,
      invalidate,
    }),
    [
      profileSummary,
      profile,
      subscription,
      isFoundingMember,
      loading,
      refresh,
      invalidate,
    ],
  );

  return (
    <StudentSessionContext.Provider value={value}>
      {children}
    </StudentSessionContext.Provider>
  );
}

export function useStudentSession(): StudentSessionContextValue {
  return useContext(StudentSessionContext) ?? EMPTY_SESSION;
}
