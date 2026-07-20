"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AtSign, Check, Loader2, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  checkUsername,
  getUsernameState,
  setUsername as setUsernameApi,
  type UsernameState,
} from "@/src/lib/api/gamlish";
import { useUsernameFlowCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";
import { sanitizeAuthReturnPath } from "@/src/lib/auth-redirects";
import { buildUsernameSuggestions } from "@/src/lib/username-suggestions";
import { PRIMARY_STUDENT_HREF } from "@/src/lib/platform-config";

type Availability =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "taken"; reason: string };

function apiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const res = (err as { response?: { data?: { message?: string }; status?: number } })
      .response;
    if (res?.status === 401) {
      return fallback;
    }
    if (res?.data?.message) return res.data.message;
  }
  return fallback;
}

function formatWindowEnd(iso: string | null, locale: "en" | "bn"): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      numberingSystem: "latn",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

export function ChooseUsernameForm() {
  const copy = useUsernameFlowCopy();
  const { locale } = useUiLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, refresh } = useStudentSession();
  const [state, setState] = useState<UsernameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState("");
  const [availability, setAvailability] = useState<Availability>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [suggestionStatus, setSuggestionStatus] = useState<
    Record<string, "idle" | "available" | "taken" | "checking">
  >({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextHref =
    sanitizeAuthReturnPath(searchParams.get("next")) ?? PRIMARY_STUDENT_HREF;

  const suggestions = useMemo(
    () =>
      buildUsernameSuggestions({
        displayName: profile?.displayName,
        email: profile?.email,
        publicId: profile?.publicId,
      }),
    [profile?.displayName, profile?.email, profile?.publicId],
  );

  useEffect(() => {
    getUsernameState()
      .then((s) => setState(s))
      .catch((err) => {
        const status =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { status?: number } }).response?.status
            : undefined;
        if (status === 401) {
          router.replace(`/login?redirect=${encodeURIComponent("/username?next=/player")}`);
          return;
        }
        setError(apiErrorMessage(err, copy.loadError));
      })
      .finally(() => setLoading(false));
  }, [copy.loadError, router]);

  useEffect(() => {
    if (!suggestions.length || state?.username) return;
    let cancelled = false;
    const run = async () => {
      const next: Record<string, "idle" | "available" | "taken" | "checking"> = {};
      for (const s of suggestions) {
        next[s] = "checking";
      }
      setSuggestionStatus(next);
      await Promise.all(
        suggestions.map(async (s) => {
          try {
            const res = await checkUsername(s);
            if (cancelled) return;
            setSuggestionStatus((prev) => ({
              ...prev,
              [s]: res.available ? "available" : "taken",
            }));
          } catch {
            if (cancelled) return;
            setSuggestionStatus((prev) => ({ ...prev, [s]: "idle" }));
          }
        }),
      );
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [suggestions, state?.username]);

  const runCheck = useCallback(
    (candidate: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const normalized = candidate.trim().toLowerCase();
      if (normalized.length < 3) {
        setAvailability({ status: "idle" });
        return;
      }
      setAvailability({ status: "checking" });
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await checkUsername(normalized);
          setAvailability(
            res.available
              ? { status: "available" }
              : { status: "taken", reason: res.reason ?? copy.takenFallback },
          );
        } catch {
          setAvailability({ status: "idle" });
        }
      }, 400);
    },
    [copy.takenFallback],
  );

  const onChange = (raw: string) => {
    const next = raw.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase().slice(0, 30);
    setValue(next);
    setSaved(false);
    setError(null);
    runCheck(next);
  };

  const pickSuggestion = (handle: string) => {
    setValue(handle);
    setSaved(false);
    setError(null);
    runCheck(handle);
  };

  const handleSubmit = async () => {
    const normalized = value.trim().toLowerCase();
    if (normalized.length < 3) return;
    setSubmitting(true);
    setError(null);
    try {
      const next = await setUsernameApi(normalized);
      setState(next);
      setSaved(true);
      setValue("");
      setAvailability({ status: "idle" });
      await refresh().catch(() => undefined);
      const dest = next.username
        ? sanitizeAuthReturnPath(searchParams.get("next")) ?? `/u/${next.username}`
        : nextHref;
      window.setTimeout(() => {
        router.replace(dest);
      }, 700);
    } catch (err) {
      setError(apiErrorMessage(err, copy.saveError));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground">
        <Loader2 className="h-7 w-7 animate-spin" />
      </div>
    );
  }

  const hasUsername = Boolean(state?.username);
  const canChange = state?.canChange ?? false;
  const isLocked = state?.isLocked ?? false;
  const windowEnd = formatWindowEnd(state?.changeWindowEndsAt ?? null, locale);
  const availableSuggestions = suggestions.filter(
    (s) => suggestionStatus[s] === "available",
  );

  return (
    <div
      className={cn("mx-auto w-full max-w-md", locale === "bn" && "font-bengali")}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <div className="rounded-3xl border-2 border-amber-500/35 bg-card/95 p-6 shadow-xl ring-4 ring-amber-400/10 sm:p-8">
        <div className="flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-800 dark:text-amber-300">
            <AtSign className="h-7 w-7" />
          </span>
        </div>

        <h1 className="mt-5 text-center text-2xl font-black tracking-tight text-foreground">
          {hasUsername ? copy.yourTitle : copy.claimTitle}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
          {hasUsername ? copy.yourSub : copy.claimSub}
        </p>

        {!hasUsername && canChange ? (
          <p className="mt-3 rounded-xl bg-amber-400/15 px-3 py-2 text-center text-sm font-semibold text-amber-950 dark:text-amber-100">
            {copy.pickVisibleHint}
          </p>
        ) : null}

        {hasUsername ? (
          <div className="mt-6 rounded-2xl border border-border/60 bg-muted/40 p-4 text-center">
            <p className="text-lg font-bold text-foreground">@{state?.username}</p>
            <p className="mt-1 break-all text-xs text-muted-foreground">
              gamlish.com/u/{state?.username}
            </p>
            {isLocked ? (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                <Lock className="h-3.5 w-3.5" /> {copy.permanentBadge}
              </p>
            ) : windowEnd ? (
              <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                {copy.changeUntil(windowEnd)}
              </p>
            ) : null}
            <Button
              asChild
              className="mt-4 w-full rounded-full"
              variant="default"
            >
              <Link href={nextHref}>{copy.continuePlaying}</Link>
            </Button>
          </div>
        ) : null}

        {canChange ? (
          <div className="mt-6 space-y-4">
            {!hasUsername && availableSuggestions.length > 0 ? (
              <div>
                <p className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {copy.suggestionsLabel}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {availableSuggestions.map((handle) => (
                    <button
                      key={handle}
                      type="button"
                      onClick={() => pickSuggestion(handle)}
                      className={cn(
                        "rounded-full border px-3 py-2 text-sm font-bold transition-colors",
                        value === handle
                          ? "border-amber-500 bg-amber-400 text-amber-950"
                          : "border-amber-500/40 bg-amber-400/10 text-amber-950 hover:bg-amber-400/20 dark:text-amber-100",
                      )}
                    >
                      @{handle}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                @
              </span>
              <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="yourname"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="h-12 pl-7 pr-10 text-base lowercase"
                aria-label={copy.usernameAria}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {availability.status === "checking" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : availability.status === "available" ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : availability.status === "taken" ? (
                  <X className="h-4 w-4 text-rose-500" />
                ) : null}
              </span>
            </div>

            {availability.status === "taken" ? (
              <p className="text-xs text-rose-500">{availability.reason}</p>
            ) : availability.status === "available" ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                {copy.available(value)}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">{copy.rules}</p>
            )}

            {error ? <p className="text-xs text-rose-500">{error}</p> : null}

            <Button
              type="button"
              className="h-12 w-full rounded-full text-base font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 hover:from-amber-300 hover:to-amber-400"
              disabled={
                submitting ||
                value.trim().length < 3 ||
                availability.status === "taken" ||
                availability.status === "checking"
              }
              onClick={handleSubmit}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : hasUsername ? (
                copy.saveNew
              ) : (
                copy.claimCta
              )}
            </Button>
          </div>
        ) : !hasUsername ? (
          <div className="mt-6 space-y-3 rounded-2xl border border-dashed border-amber-500/40 bg-amber-400/10 p-4 text-center text-sm">
            <p className="font-semibold text-foreground">{copy.waitPurchase}</p>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/pricing#pay-now">{copy.goToPricing}</Link>
            </Button>
          </div>
        ) : null}

        {saved ? (
          <p className="mt-4 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {copy.saved}
          </p>
        ) : null}
      </div>
    </div>
  );
}
