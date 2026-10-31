"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

type SessionSlice = "profile" | "summary" | "subscription";
type SliceStatus = "idle" | "loading" | "ready" | "error";

export type StudentSessionNeeds = {
  profile?: boolean;
  summary?: boolean;
  subscription?: boolean;
  /** Let the page's main request start first. The bar and offer can fill in after. */
  defer?: boolean;
};

interface StudentSessionContextValue {
  profileSummary: ProfileSummary | null;
  profile: StudentProfile | null;
  subscription: ActiveSubscription | null;
  isFoundingMember: boolean;
  loading: boolean;
  isStudent: boolean;
  profileStatus: SliceStatus;
  summaryStatus: SliceStatus;
  subscriptionStatus: SliceStatus;
  ensure: (slice: SessionSlice) => void;
  refresh: () => Promise<void>;
  invalidate: () => void;
}

const StudentSessionContext = createContext<StudentSessionContextValue | null>(null);

const EMPTY_SESSION: StudentSessionContextValue = {
  profileSummary: null,
  profile: null,
  subscription: null,
  isFoundingMember: false,
  loading: false,
  isStudent: false,
  profileStatus: "idle",
  summaryStatus: "idle",
  subscriptionStatus: "idle",
  ensure: () => {},
  refresh: async () => {},
  invalidate: () => {},
};

/** Run after the page's own requests have started. */
export function runWhenIdle(task: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(task, { timeout: 1200 });
    return () => window.cancelIdleCallback(id);
  }
  const timer = window.setTimeout(task, 400);
  return () => window.clearTimeout(timer);
}

function slicePending(status: SliceStatus, requested: boolean): boolean {
  return requested && status !== "ready" && status !== "error";
}

export function StudentSessionProvider({
  initialUser,
  children,
}: {
  initialUser: CurrentUser | null;
  children: ReactNode;
}) {
  const [clientIsStudent, setClientIsStudent] = useState(false);
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [subscription, setSubscription] = useState<ActiveSubscription | null>(null);
  const [profileStatus, setProfileStatus] = useState<SliceStatus>("idle");
  const [summaryStatus, setSummaryStatus] = useState<SliceStatus>("idle");
  const [subscriptionStatus, setSubscriptionStatus] = useState<SliceStatus>("idle");

  const isStudent =
    initialUser?.role === "STUDENT" || (initialUser == null && clientIsStudent);
  const isStudentRef = useRef(isStudent);
  isStudentRef.current = isStudent;

  const statusRef = useRef<Record<SessionSlice, SliceStatus>>({
    profile: "idle",
    summary: "idle",
    subscription: "idle",
  });
  const requestedRef = useRef<Set<SessionSlice>>(new Set());

  const setSliceStatus = useCallback((slice: SessionSlice, status: SliceStatus) => {
    statusRef.current[slice] = status;
    if (slice === "profile") setProfileStatus(status);
    else if (slice === "summary") setSummaryStatus(status);
    else setSubscriptionStatus(status);
  }, []);

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

  const loadSlice = useCallback(
    async (slice: SessionSlice) => {
      if (!isStudentRef.current) return;
      setSliceStatus(slice, "loading");
      try {
        if (slice === "profile") {
          setProfile(await getMyProfile());
        } else if (slice === "summary") {
          setProfileSummary(await getProfileSummary());
        } else {
          setSubscription(await getMySubscription());
        }
        setSliceStatus(slice, "ready");
      } catch {
        setSliceStatus(slice, "error");
      }
    },
    [setSliceStatus],
  );

  const ensure = useCallback(
    (slice: SessionSlice) => {
      requestedRef.current.add(slice);
      if (!isStudentRef.current) return;
      const status = statusRef.current[slice];
      if (status === "loading" || status === "ready") return;
      void loadSlice(slice);
    },
    [loadSlice],
  );

  const refresh = useCallback(async () => {
    if (!isStudentRef.current) {
      setProfile(null);
      setProfileSummary(null);
      setSubscription(null);
      setSliceStatus("profile", "idle");
      setSliceStatus("summary", "idle");
      setSliceStatus("subscription", "idle");
      return;
    }

    invalidate();
    const slices = [...requestedRef.current];
    for (const slice of slices) {
      statusRef.current[slice] = "idle";
    }
    await Promise.all(slices.map((slice) => loadSlice(slice)));
  }, [invalidate, loadSlice, setSliceStatus]);

  useEffect(() => {
    const onAuthChange = () => {
      if (initialUser?.role === "STUDENT" || isActiveStudentSessionClient()) {
        void refresh();
      }
    };
    window.addEventListener("auth-state-changed", onAuthChange);
    return () => {
      window.removeEventListener("auth-state-changed", onAuthChange);
    };
  }, [initialUser, refresh]);

  useEffect(() => {
    if (!isStudent) return;
    for (const slice of requestedRef.current) {
      const status = statusRef.current[slice];
      if (status === "idle") void loadSlice(slice);
    }
  }, [isStudent, loadSlice]);

  const isFoundingMember = useMemo(
    () => isFoundingMemberEligible(subscription, profile),
    [subscription, profile],
  );

  const value = useMemo(
    () => ({
      profileSummary,
      profile,
      subscription,
      isFoundingMember,
      loading: false,
      isStudent,
      profileStatus,
      summaryStatus,
      subscriptionStatus,
      ensure,
      refresh,
      invalidate,
    }),
    [
      profileSummary,
      profile,
      subscription,
      isFoundingMember,
      isStudent,
      profileStatus,
      summaryStatus,
      subscriptionStatus,
      ensure,
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

export function useStudentSession(
  needs?: StudentSessionNeeds,
): StudentSessionContextValue {
  const ctx = useContext(StudentSessionContext) ?? EMPTY_SESSION;
  const { ensure, isStudent } = ctx;
  const profile = needs?.profile === true;
  const summary = needs?.summary === true;
  const subscription = needs?.subscription === true;
  const defer = needs?.defer === true;

  useEffect(() => {
    if (!profile && !summary && !subscription) return;
    const run = () => {
      if (profile) ensure("profile");
      if (summary) ensure("summary");
      if (subscription) ensure("subscription");
    };
    if (!defer) {
      run();
      return;
    }
    return runWhenIdle(run);
  }, [ensure, isStudent, profile, summary, subscription, defer]);

  const loading =
    needs && ctx.isStudent
      ? slicePending(ctx.profileStatus, profile) ||
        slicePending(ctx.summaryStatus, summary) ||
        slicePending(ctx.subscriptionStatus, subscription)
      : false;

  return { ...ctx, loading };
}
