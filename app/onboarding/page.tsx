"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  getMyProfile,
  updateProfile,
  setTargetBandOnce,
} from "@/src/lib/api/profile";
import { JourneyCountrySelect } from "@/src/components/profile/JourneyCountrySelect";
import { normalizeJourneyCountryLabel } from "@/src/lib/journeyCountries";
import { isStudentLearningReady } from "@/src/lib/student-learning-gate";
import {
  User,
  Mail,
  Sparkles,
  Target,
  AtSign,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BAND_OPTIONS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nickname, setNickname] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentCountry, setCurrentCountry] = useState("");
  const [dreamCountry, setDreamCountry] = useState("");
  const [targetBand, setTargetBand] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyProfile()
      .then((p) => {
        if (cancelled) return;
        if (isStudentLearningReady(p ?? null)) {
          router.replace("/");
          return;
        }
        if (p?.nickname) setNickname(String(p.nickname));
        if (p?.name) setName(p.name ?? "");
        if (p?.email) setEmail(String(p.email));
        if (p?.profile?.currentCountry || p?.profile?.country) {
          setCurrentCountry(
            normalizeJourneyCountryLabel(
              p.profile.currentCountry ?? p.profile.country,
            ) ?? "",
          );
        }
        if (p?.profile?.dreamCountry) {
          setDreamCountry(
            normalizeJourneyCountryLabel(p.profile.dreamCountry) ?? "",
          );
        }
        if (p?.targetBands?.reading != null) {
          setTargetBand(p.targetBands.reading);
        }
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
  }, [router]);

  const formValid =
    nickname.trim().length > 0 &&
    name.trim().length > 0 &&
    Boolean(normalizeJourneyCountryLabel(currentCountry)) &&
    Boolean(normalizeJourneyCountryLabel(dreamCountry)) &&
    targetBand != null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) {
      setError("Please complete every field and choose your Reading target band.");
      return;
    }
    const canonicalCurrent = normalizeJourneyCountryLabel(currentCountry);
    const canonicalDream = normalizeJourneyCountryLabel(dreamCountry);
    if (!canonicalCurrent || !canonicalDream || targetBand == null) {
      setError("Select both countries from the list.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await updateProfile({
        name: name.trim(),
        nickname: nickname.trim(),
        profile: {
          currentCountry: canonicalCurrent,
          dreamCountry: canonicalDream,
        },
      });
      await setTargetBandOnce({ reading: targetBand });
      router.replace("/");
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
          <Sparkles className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome to Gamlish
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          A quick setup — then you&apos;re straight into Reading.
        </p>
      </div>

      <Card className="relative overflow-hidden border-border/70 p-5 shadow-lg sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="nickname" className="text-sm font-medium">
                Nickname
              </Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="How we greet you"
                  autoComplete="nickname"
                  className="min-h-11 pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="name" className="text-sm font-medium">
                Full name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  className="min-h-11 pl-10"
                  required
                />
              </div>
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
            <p className="text-xs text-muted-foreground">
              Verified at sign-up — used to sign in.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currentCountry" className="text-sm font-medium">
                Current country
              </Label>
              <JourneyCountrySelect
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
              <JourneyCountrySelect
                id="dreamCountry"
                value={dreamCountry}
                onValueChange={setDreamCountry}
                placeholder="Where you want to study"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  IELTS Reading target band
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  Pick the band you&apos;re aiming for. Most students choose 6.5 or 7.
                </p>
              </div>
            </div>
            <div
              className="grid grid-cols-4 gap-2 sm:grid-cols-6"
              role="group"
              aria-label="Reading band options"
            >
              {BAND_OPTIONS.map((band) => (
                <button
                  key={band}
                  type="button"
                  onClick={() => setTargetBand(band)}
                  className={cn(
                    "min-h-10 touch-manipulation rounded-lg border text-sm font-semibold tabular-nums transition-all active:scale-[0.98]",
                    targetBand === band
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
              "Setting up…"
            ) : (
              <>
                <Target className="h-4 w-4" />
                Start my Reading journey
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
