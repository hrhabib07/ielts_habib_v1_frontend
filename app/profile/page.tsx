"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMyProfile, updateProfile } from "@/src/lib/api/profile";
import { getMySubscription, type ActiveSubscription } from "@/src/lib/api/subscription";
import type { StudentProfile } from "@/src/lib/api/types";
import { JourneyCountryCombobox } from "@/src/components/profile/JourneyCountryCombobox";
import { ProfileChangePassword } from "@/src/components/profile/ProfileChangePassword";
import { ProfileSummarySection } from "@/src/components/profile/ProfileSummarySection";
import { ProfilePageSkeleton } from "@/src/components/profile/ProfilePageSkeleton";
import { normalizeJourneyCountryLabel } from "@/src/lib/journeyCountries";
import {
  BookOpen,
  CreditCard,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Shield,
  Sparkles,
  User,
  X,
} from "lucide-react";
import {
  SUPPORT_WHATSAPP_DISPLAY,
  SUPPORT_WHATSAPP_HREF,
} from "@/src/lib/contact";

function formatSubscriptionDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function subscriptionStatusLabel(status: ActiveSubscription["status"]): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "EXPIRED":
      return "Expired";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileRecord, setProfileRecord] = useState<StudentProfile | null>(null);
  const [subscription, setSubscription] = useState<ActiveSubscription | null>(null);

  const [name, setName] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [currentCountry, setCurrentCountry] = useState("");
  const [dreamCity, setDreamCity] = useState("");
  const [dreamCountry, setDreamCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [editingPersonalDetails, setEditingPersonalDetails] = useState(false);

  const resetPersonalFormFromRecord = (record: StudentProfile) => {
    setName(record.name ?? "");
    setCurrentCity(record.profile?.currentCity ?? record.profile?.city ?? "");
    setCurrentCountry(
      normalizeJourneyCountryLabel(
        record.profile?.currentCountry ?? record.profile?.country,
      ) ?? "",
    );
    setDreamCity(record.profile?.dreamCity ?? "");
    setDreamCountry(
      normalizeJourneyCountryLabel(record.profile?.dreamCountry) ?? "",
    );
    setPhone(record.profile?.phone ?? "");
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getMyProfile(),
      getMySubscription().catch(() => null),
    ])
      .then(([profile, sub]) => {
        if (cancelled) return;
        if (!profile) {
          setError("Could not load your profile.");
          return;
        }
        setProfileRecord(profile);
        setSubscription(sub);
        setName(profile.name ?? "");
        setCurrentCity(profile.profile?.currentCity ?? profile.profile?.city ?? "");
        setCurrentCountry(
          normalizeJourneyCountryLabel(
            profile.profile?.currentCountry ?? profile.profile?.country,
          ) ?? "",
        );
        setDreamCity(profile.profile?.dreamCity ?? "");
        setDreamCountry(
          normalizeJourneyCountryLabel(profile.profile?.dreamCountry) ?? "",
        );
        setPhone(profile.profile?.phone ?? "");
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load your profile.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currentCity.trim() || !dreamCity.trim() || phone.trim().length < 5) {
      setError("Full name, both cities, both countries, and phone (min. 5 characters) are required.");
      return;
    }
    const canonicalCurrent = normalizeJourneyCountryLabel(currentCountry);
    const canonicalDream = normalizeJourneyCountryLabel(dreamCountry);
    if (!canonicalCurrent || !canonicalDream) {
      setError("Type each country and choose a value from the suggestions list.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateProfile({
        name: name.trim(),
        profile: {
          currentCity: currentCity.trim(),
          currentCountry: canonicalCurrent,
          dreamCity: dreamCity.trim(),
          dreamCountry: canonicalDream,
          phone: phone.trim(),
        },
      });
      if (updated) {
        setProfileRecord(updated);
        resetPersonalFormFromRecord(updated);
      }
      setSuccess("Profile updated successfully.");
      setEditingPersonalDetails(false);
    } catch {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPersonalEdit = () => {
    if (profileRecord) resetPersonalFormFromRecord(profileRecord);
    setEditingPersonalDetails(false);
    setError(null);
    setSuccess(null);
  };

  const readingTarget = profileRecord?.targetBands?.reading;

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  if (error && !profileRecord) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-destructive">{error}</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    );
  }

  if (!profileRecord) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -right-24 top-32 h-80 w-80 rounded-full bg-violet-500/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-500/6 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl space-y-8 px-4 py-8 md:space-y-10 md:px-6 md:py-10">
        {/* Hero identity strip */}
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lg shadow-black/[0.03] dark:shadow-black/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-emerald-500/[0.05]" aria-hidden />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-5">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/40 to-emerald-500/30 blur-sm" aria-hidden />
                  <div
                    className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-2xl font-bold text-primary-foreground shadow-lg"
                    aria-hidden
                  >
                    {(name || "S").trim().charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                    Student workspace
                  </p>
                  <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    {name.trim() || "Student"}
                  </h1>
                  {phone?.trim() ? (
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      {phone.trim()}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Add a phone number in Personal details so we can reach you.
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[currentCity, currentCountry].filter(Boolean).length > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-foreground">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {[currentCity, currentCountry].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {[dreamCity, dreamCountry].filter(Boolean).length > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-foreground">
                        <User className="h-3 w-3 text-primary" />
                        Goal: {[dreamCity, dreamCountry].filter(Boolean).join(" → ")}
                      </span>
                    )}
                    {readingTarget != null && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        Reading target · Band {readingTarget}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-stretch xl:flex-row">
                <Button asChild size="lg" className="gap-2 shadow-md shadow-primary/15">
                  <Link href="/profile/reading">
                    <BookOpen className="h-4 w-4" />
                    Open Reading
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2 bg-background/80">
                  <Link href="/profile/score-guarantee">
                    <Shield className="h-4 w-4" />
                    Guarantee
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="gap-2">
                  <Link href="/pricing">
                    <CreditCard className="h-4 w-4" />
                    Plans
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick links bento */}
        <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/profile/score-guarantee"
          className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card to-card p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md md:p-7"
        >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Shield className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                Your assurance
              </p>
              <p className="mt-1 font-semibold tracking-tight text-foreground text-lg md:text-xl">
                Your target band is backed by the Gamlish Score Guarantee™
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Hit the Readiness Zone, sit IELTS on schedule, and if you miss
                your declared target despite meeting every rule—we refund you in
                full. View eligibility and checklist.
              </p>
            </div>
          </div>
          <span className="text-sm font-semibold text-primary group-hover:underline sm:shrink-0">
            View guarantee →
          </span>
        </div>
        </Link>

        <Card className="overflow-hidden border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.07] via-card to-card shadow-sm transition-shadow hover:shadow-md">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between md:p-7">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-400">
                Support
              </p>
              <p className="mt-1 font-semibold text-foreground">WhatsApp only — we reply to messages</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                For billing, access, or product questions, message us on WhatsApp.{" "}
                <span className="font-medium text-foreground">Do not call this number</span> — we do
                not offer phone support on this line.
              </p>
            </div>
          </div>
          <Button
            asChild
            size="lg"
            className="w-full shrink-0 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:w-auto"
          >
            <a href={SUPPORT_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
              WhatsApp {SUPPORT_WHATSAPP_DISPLAY}
            </a>
          </Button>
        </div>
        </Card>
        </div>

      <section aria-labelledby="reading-overview-heading" className="scroll-mt-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Analytics
            </p>
            <h2
              id="reading-overview-heading"
              className="mt-1 text-xl font-bold tracking-tight text-foreground md:text-2xl"
            >
              Reading progress
            </h2>
          </div>
        </div>
        <ProfileSummarySection />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border/70 p-6 shadow-sm md:p-7">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground md:text-xl">
          Account security
        </h2>
        <ProfileChangePassword />
      </Card>

      <Card className="border-border/80 p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary ring-1 ring-primary/10">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
              Subscription
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Active plan and renewal window. Purchase or renew from pricing anytime.
            </p>
          </div>
        </div>

        {subscription && subscription.status === "ACTIVE" ? (
          <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-foreground">
                {subscription.planId?.name ?? "Subscription"}
              </p>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {subscriptionStatusLabel(subscription.status)}
              </span>
            </div>
            {subscription.planId?.description && (
              <p className="text-sm text-muted-foreground">
                {subscription.planId.description}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Valid until{" "}
              <span className="font-medium text-foreground">
                {formatSubscriptionDate(subscription.endDate)}
              </span>
            </p>
            {subscription.isFounderUser && (
              <p className="text-xs font-medium text-primary">
                Founder / early access pricing applied.
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/10 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              {subscription?.status === "EXPIRED"
                ? "Your subscription has ended. Renew to keep full access."
                : subscription?.status === "CANCELLED"
                  ? "This subscription was cancelled."
                  : "No active subscription. Unlock full Reading progression and tests."}
            </p>
            <Button asChild className="mt-4 gap-2">
              <Link href="/pricing">
                <Sparkles className="h-4 w-4" />
                View plans
              </Link>
            </Button>
          </div>
        )}
      </Card>
      </div>

      <Card className="border-border/70 p-6 shadow-sm md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
              Personal details
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Name, phone, and locations — used for your account and support context only. Tap Edit
              to make changes.
            </p>
          </div>
          {!editingPersonalDetails ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-2"
              onClick={() => {
                setEditingPersonalDetails(true);
                setError(null);
                setSuccess(null);
              }}
            >
              <Pencil className="h-4 w-4" aria-hidden />
              Edit
            </Button>
          ) : null}
        </div>

        {!editingPersonalDetails && success ? (
          <p className="mb-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">{success}</p>
        ) : null}

        {!editingPersonalDetails ? (
          <div className="grid gap-6 md:grid-cols-2">
            {(
              [
                { label: "Full name", value: name.trim() || "—" },
                { label: "Phone", value: phone.trim() || "—" },
                { label: "Current city", value: currentCity.trim() || "—" },
                { label: "Current country", value: currentCountry.trim() || "—" },
                { label: "Dream city", value: dreamCity.trim() || "—" },
                { label: "Study destination country", value: dreamCountry.trim() || "—" },
              ] as const
            ).map((row) => (
              <div key={row.label} className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {row.label}
                </p>
                <p className="rounded-xl border border-border/50 bg-muted/25 px-3.5 py-2.5 text-sm text-foreground">
                  {row.value}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentCity">Current city</Label>
                <Input
                  id="currentCity"
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentCountry">Current country</Label>
                <p className="text-xs text-muted-foreground">
                  Journey map pins — only supported countries.
                </p>
                <JourneyCountryCombobox
                  id="currentCountry"
                  value={currentCountry}
                  onValueChange={setCurrentCountry}
                  placeholder="Type country, choose from list"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dreamCity">Dream city</Label>
                <Input
                  id="dreamCity"
                  value={dreamCity}
                  onChange={(e) => setDreamCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dreamCountry">Study destination country</Label>
                <p className="text-xs text-muted-foreground">
                  Study destination must be from this list so your route matches the map.
                </p>
                <JourneyCountryCombobox
                  id="dreamCountry"
                  value={dreamCountry}
                  onValueChange={setDreamCountry}
                  placeholder="Type country, choose from list"
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                className="gap-2"
                onClick={handleCancelPersonalEdit}
              >
                <X className="h-4 w-4" aria-hidden />
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
      </div>
    </div>
  );
}
