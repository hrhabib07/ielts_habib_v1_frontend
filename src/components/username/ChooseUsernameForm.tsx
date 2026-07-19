"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

type Availability =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "taken"; reason: string };

function apiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const res = (err as { response?: { data?: { message?: string } } }).response;
    if (res?.data?.message) return res.data.message;
  }
  return fallback;
}

function formatWindowEnd(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

export function ChooseUsernameForm() {
  const [state, setState] = useState<UsernameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState("");
  const [availability, setAvailability] = useState<Availability>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getUsernameState()
      .then((s) => setState(s))
      .catch((err) => setError(apiErrorMessage(err, "Could not load your username status.")))
      .finally(() => setLoading(false));
  }, []);

  const runCheck = useCallback((candidate: string) => {
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
            : { status: "taken", reason: res.reason ?? "This username is taken." },
        );
      } catch {
        setAvailability({ status: "idle" });
      }
    }, 400);
  }, []);

  const onChange = (raw: string) => {
    const next = raw.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase().slice(0, 30);
    setValue(next);
    setSaved(false);
    setError(null);
    runCheck(next);
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
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save this username. Try another one."));
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
  const windowEnd = formatWindowEnd(state?.changeWindowEndsAt ?? null);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-border/60 bg-card/90 p-6 shadow-sm sm:p-8">
        <div className="flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <AtSign className="h-7 w-7" />
          </span>
        </div>

        <h1 className="mt-5 text-center text-2xl font-bold tracking-tight text-foreground">
          {hasUsername ? "Your username" : "Claim your username"}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
          {hasUsername
            ? "This becomes your permanent public profile link on Gamlish."
            : "Pick a permanent, unique username. You can change it once within 48 hours — after that it is locked forever."}
        </p>

        {hasUsername ? (
          <div className="mt-6 rounded-2xl border border-border/60 bg-muted/40 p-4 text-center">
            <p className="text-lg font-bold text-foreground">@{state?.username}</p>
            <p className="mt-1 break-all text-xs text-muted-foreground">
              gamlish.com/u/{state?.username}
            </p>
            {isLocked ? (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                <Lock className="h-3.5 w-3.5" /> Permanent — cannot be changed
              </p>
            ) : windowEnd ? (
              <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                You can change it once until {windowEnd}.
              </p>
            ) : null}
          </div>
        ) : null}

        {canChange ? (
          <div className="mt-6 space-y-3">
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
                className="pl-7 pr-10 lowercase"
                aria-label="Username"
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
                @{value} is available.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                3–30 characters · lowercase letters, numbers and underscores.
              </p>
            )}

            {error ? <p className="text-xs text-rose-500">{error}</p> : null}

            <Button
              type="button"
              className="w-full rounded-full"
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
                "Save new username"
              ) : (
                "Claim username"
              )}
            </Button>
          </div>
        ) : !hasUsername ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border/60 bg-muted/30 p-4 text-center text-sm text-muted-foreground">
            You can choose your permanent username once your purchase is approved.
          </div>
        ) : null}

        {saved ? (
          <p className="mt-4 text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Saved! Your public profile is live.
          </p>
        ) : null}
      </div>
    </div>
  );
}
