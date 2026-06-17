"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  checkUsernameAvailable,
  completeProfile,
  getMyProfile,
} from "@/src/lib/api/profile";
import { CountryCodeSelect } from "@/src/components/profile/CountryCodeSelect";
import {
  DEFAULT_CURRENT_COUNTRY,
  DEFAULT_DREAM_COUNTRY,
  DEFAULT_DESIRED_BAND,
  SAME_COUNTRY_WARNING,
} from "@/src/lib/countryCodes";
import {
  getMigrationReasons,
  isStudentLearningReady,
} from "@/src/lib/student-learning-gate";
import {
  User,
  Mail,
  Sparkles,
  Target,
  AtSign,
  ArrowRight,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BAND_OPTIONS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];
const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

export default function OnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMigration = searchParams.get("migrate") === "1";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countryWarning, setCountryWarning] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [migrationReasons, setMigrationReasons] = useState<string[]>([]);
  const [hasExistingUsername, setHasExistingUsername] = useState(false);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [currentCountry, setCurrentCountry] = useState(DEFAULT_CURRENT_COUNTRY);
  const [dreamCountry, setDreamCountry] = useState(DEFAULT_DREAM_COUNTRY);
  const [desiredBand, setDesiredBand] = useState<number>(DEFAULT_DESIRED_BAND);

  useEffect(() => {
    let cancelled = false;
    getMyProfile()
      .then((p) => {
        if (cancelled) return;
        if (isStudentLearningReady(p ?? null)) {
          router.replace(isMigration ? "/profile" : "/");
          return;
        }
        if (p?.username) {
          setUsername(String(p.username));
          setHasExistingUsername(true);
        }
        if (p?.displayName) setDisplayName(String(p.displayName));
        else if (typeof p?.name === "string" && p.name.trim()) {
          setDisplayName(p.name.trim());
        } else if (typeof p?.nickname === "string" && p.nickname.trim()) {
          setDisplayName(p.nickname.trim());
        }
        if (p?.email) setEmail(String(p.email));
        if (p?.currentCountry) setCurrentCountry(String(p.currentCountry));
        if (p?.dreamCountry) setDreamCountry(String(p.dreamCountry));
        const band =
          p?.desiredBandScore ?? p?.targetBands?.reading ?? DEFAULT_DESIRED_BAND;
        setDesiredBand(band);
        setMigrationReasons(getMigrationReasons(p ?? null));
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load your account.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router, isMigration]);

  useEffect(() => {
    if (currentCountry === dreamCountry) {
      setCountryWarning(SAME_COUNTRY_WARNING);
    } else {
      setCountryWarning(null);
    }
  }, [currentCountry, dreamCountry]);

  const checkUsername = useCallback(async (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      setUsernameStatus("idle");
      return;
    }
    if (!USERNAME_PATTERN.test(normalized)) {
      setUsernameStatus("invalid");
      return;
    }
    setUsernameStatus("checking");
    try {
      const result = await checkUsernameAvailable(normalized);
      setUsernameStatus(result.available ? "available" : "taken");
    } catch {
      setUsernameStatus("idle");
    }
  }, []);

  useEffect(() => {
    if (hasExistingUsername) return;
    const timer = window.setTimeout(() => {
      void checkUsername(username);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [username, hasExistingUsername, checkUsername]);

  const usernameValid =
    hasExistingUsername || USERNAME_PATTERN.test(username.trim().toLowerCase());

  const usernameReady =
    hasExistingUsername ||
    usernameStatus === "available" ||
    (usernameStatus === "idle" &&
      username.trim().length >= 3 &&
      USERNAME_PATTERN.test(username.trim().toLowerCase()));

  const formValid =
    username.trim().length >= 3 &&
    usernameValid &&
    usernameReady &&
    displayName.trim().length > 0 &&
    currentCountry !== dreamCountry &&
    BAND_OPTIONS.includes(desiredBand as (typeof BAND_OPTIONS)[number]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCountry === dreamCountry) {
      setCountryWarning(SAME_COUNTRY_WARNING);
      return;
    }

    const normalizedUsername = username.trim().toLowerCase();
    if (!normalizedUsername || !USERNAME_PATTERN.test(normalizedUsername)) {
      setError("Choose a username (3–30 characters: letters, numbers, underscores).");
      return;
    }

    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }

    if (!hasExistingUsername) {
      if (usernameStatus === "taken") {
        setError("This username is already taken. Please choose another.");
        return;
      }
      if (usernameStatus === "checking") {
        setError("Still checking username availability. try again in a moment.");
        return;
      }
      if (usernameStatus !== "available") {
        try {
          const result = await checkUsernameAvailable(normalizedUsername);
          if (!result.available) {
            setUsernameStatus("taken");
            setError("This username is already taken. Please choose another.");
            return;
          }
          setUsernameStatus("available");
        } catch {
          setError("Could not verify username. Please try again.");
          return;
        }
      }
    }

    if (!formValid) {
      setError("Please complete every field.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const updated = await completeProfile({
        username: normalizedUsername,
        displayName: displayName.trim(),
        currentCountry,
        dreamCountry,
        desiredBandScore: desiredBand,
      });

      if (!isStudentLearningReady(updated)) {
        setError(
          "Profile saved but something is still missing. Refresh the page or contact support if this continues.",
        );
        return;
      }

      const destination = isMigration ? "/profile" : "/";
      window.location.assign(destination);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : null;
      setError(msg ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100dvh-8rem)] items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-xl px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 sm:pt-12">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,var(--primary)_0%,transparent_70%)] opacity-[0.12]"
        aria-hidden
      />

      <div className="relative mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          {isMigration ? (
            <AlertTriangle className="h-6 w-6" aria-hidden />
          ) : (
            <Sparkles className="h-6 w-6" aria-hidden />
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isMigration ? "Update your profile" : "Welcome to Gamlish"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          {isMigration
            ? "We need a few details before you can continue using your dashboard."
            : "Set up your profile. then you're straight into Reading."}
        </p>
      </div>

      {isMigration && migrationReasons.length > 0 && (
        <Card className="relative mb-6 border-amber-500/30 bg-amber-500/5 p-4">
          <p className="text-sm font-semibold text-foreground">Why we&apos;re asking</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {migrationReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="relative overflow-hidden border-border/70 p-5 shadow-lg sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                }
                placeholder="your_handle"
                autoComplete="username"
                className="min-h-11 pl-10"
                required
                readOnly={hasExistingUsername}
                disabled={hasExistingUsername || submitting}
              />
            </div>
            {!hasExistingUsername && !username.trim() && (
              <p className="text-xs text-destructive">Username is required to continue.</p>
            )}
            {!hasExistingUsername && username.trim().length > 0 && username.trim().length < 3 && (
              <p className="text-xs text-destructive">Username must be at least 3 characters.</p>
            )}
            {!hasExistingUsername && (
              <p className="rounded-lg border border-amber-500/25 bg-amber-500/8 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                <strong>Permanent handle.</strong> Your username cannot be changed
                later. It becomes your public profile link: gamlish.com/u/
                {username.trim() || "username"}
              </p>
            )}
            {!hasExistingUsername && usernameStatus === "checking" && (
              <p className="text-xs text-muted-foreground">Checking availability…</p>
            )}
            {!hasExistingUsername && usernameStatus === "available" && (
              <p className="text-xs text-emerald-600">Username is available.</p>
            )}
            {!hasExistingUsername && usernameStatus === "taken" && (
              <p className="text-xs text-destructive">This username is already taken.</p>
            )}
            {!hasExistingUsername && usernameStatus === "invalid" && username.trim() && (
              <p className="text-xs text-destructive">
                3–30 characters: lowercase letters, numbers, and underscores only.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-sm font-medium">
              Display name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How others see you"
                autoComplete="nickname"
                className="min-h-11 pl-10"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              You can change this anytime from your profile settings.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                tabIndex={-1}
                className="min-h-11 cursor-default bg-muted/40 pl-10 text-muted-foreground"
                aria-readonly
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currentCountry" className="text-sm font-medium">
                Current country
              </Label>
              <CountryCodeSelect
                id="currentCountry"
                value={currentCountry}
                onValueChange={setCurrentCountry}
                placeholder="Where you live now"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dreamCountry" className="text-sm font-medium">
                Dream country
              </Label>
              <CountryCodeSelect
                id="dreamCountry"
                value={dreamCountry}
                onValueChange={setDreamCountry}
                placeholder="Where you want to study"
              />
            </div>
          </div>

          {countryWarning && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {countryWarning}
            </div>
          )}

          <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Desired IELTS band score
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  Pick the band you&apos;re aiming for. Default is 6.5.
                </p>
              </div>
            </div>
            <div
              className="grid grid-cols-4 gap-2 sm:grid-cols-6"
              role="group"
              aria-label="Band score options"
            >
              {BAND_OPTIONS.map((band) => (
                <button
                  key={band}
                  type="button"
                  onClick={() => setDesiredBand(band)}
                  className={cn(
                    "min-h-10 touch-manipulation rounded-lg border text-sm font-semibold tabular-nums transition-all active:scale-[0.98]",
                    desiredBand === band
                      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "border-border bg-background hover:border-primary/30 hover:bg-muted/50",
                  )}
                >
                  {band}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting || !formValid}
            className="min-h-12 w-full gap-2 text-[15px] font-semibold shadow-md shadow-primary/15"
            size="lg"
          >
            {submitting ? (
              "Saving…"
            ) : (
              <>
                <Target className="h-4 w-4" />
                {isMigration ? "Save and continue" : "Start my Reading journey"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
