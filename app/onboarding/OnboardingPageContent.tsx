"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  checkUsernameAvailable,
  completeEnglishProfile,
  completeProfile,
  getMyProfile,
} from "@/src/lib/api/profile";
import { CountryCodeSelect } from "@/src/components/profile/CountryCodeSelect";
import { ENABLE_READING } from "@/src/lib/platform-config";
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
  Gamepad2,
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
  const [nickname, setNickname] = useState("");
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
        const name =
          p?.displayName?.trim() ||
          (typeof p?.nickname === "string" ? p.nickname.trim() : "") ||
          (typeof p?.name === "string" ? p.name.trim() : "");
        if (name) {
          setNickname(name);
          setDisplayName(name);
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
    if (!ENABLE_READING) return;
    if (currentCountry === dreamCountry) {
      setCountryWarning(SAME_COUNTRY_WARNING);
    } else {
      setCountryWarning(null);
    }
  }, [currentCountry, dreamCountry]);

  const checkUsername = async (value: string) => {
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
  };

  useEffect(() => {
    if (!ENABLE_READING || hasExistingUsername) return;
    const timer = window.setTimeout(() => {
      void checkUsername(username);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [username, hasExistingUsername]);

  const englishFormValid = nickname.trim().length >= 1;

  const readingFormValid =
    username.trim().length >= 3 &&
    (hasExistingUsername || USERNAME_PATTERN.test(username.trim().toLowerCase())) &&
    (hasExistingUsername ||
      usernameStatus === "available" ||
      (usernameStatus === "idle" &&
        USERNAME_PATTERN.test(username.trim().toLowerCase()))) &&
    displayName.trim().length > 0 &&
    currentCountry !== dreamCountry &&
    BAND_OPTIONS.includes(desiredBand as (typeof BAND_OPTIONS)[number]);

  const formValid = ENABLE_READING ? readingFormValid : englishFormValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!ENABLE_READING) {
      if (!nickname.trim()) {
        setError("Please enter a nickname.");
        return;
      }
      setSubmitting(true);
      try {
        const updated = await completeEnglishProfile(nickname.trim());
        if (!isStudentLearningReady(updated)) {
          setError("Could not save your nickname. Please try again.");
          return;
        }
        window.location.assign("/");
      } catch (err: unknown) {
        const msg =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data
                ?.message
            : null;
        setError(msg ?? "Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

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
        setError("Still checking username availability. Try again in a moment.");
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

      window.location.assign(isMigration ? "/profile" : "/");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
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
          ) : ENABLE_READING ? (
            <Sparkles className="h-6 w-6" aria-hidden />
          ) : (
            <Gamepad2 className="h-6 w-6" aria-hidden />
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isMigration ? "Update your profile" : "Welcome to Gamlish"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          {isMigration
            ? "We need a few details before you can continue."
            : ENABLE_READING
              ? "Set up your profile, then you're straight into Reading."
              : "Pick a nickname and jump into Mission 01. No username needed."}
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
          {!ENABLE_READING ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-sm font-medium">
                  Nickname
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="What should we call you?"
                    autoComplete="nickname"
                    className="min-h-11 pl-10"
                    required
                    maxLength={80}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Shown on your home screen and in the game. You can change it later in profile
                  settings.
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
            </>
          ) : (
            <>
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
            </>
          )}

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
                {isMigration
                  ? "Save and continue"
                  : ENABLE_READING
                    ? "Start my Reading journey"
                    : "Start playing"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
