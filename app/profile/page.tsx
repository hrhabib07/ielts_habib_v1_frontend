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
    <div className="relative min-h-[calc(100dvh-4rem)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(42vh,22rem)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,var(--primary)_0%,transparent_55%)] opacity-[0.07] dark:opacity-[0.12]"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-5xl space-y-10 px-4 py-10 md:space-y-12 md:px-6 md:py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Your workspace
            </p>
            <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              My profile
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">
              Subscription, guarantee, and Reading progress — keep details current so we can support
              you without friction.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild variant="outline" size="lg" className="gap-2 border-border/90">
              <Link href="/profile/reading">
                <BookOpen className="h-4 w-4" />
                Open Reading
              </Link>
            </Button>
            <Button asChild size="lg" className="gap-2 shadow-md shadow-primary/10">
              <Link href="/profile/score-guarantee">
                <Shield className="h-4 w-4" />
                Score Guarantee™
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

      <Link
        href="/profile/score-guarantee"
        className="group block rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-card to-card p-6 shadow-sm transition-all hover:border-primary/35 hover:shadow-md md:p-7"
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

      <Card className="overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.06] via-card to-card shadow-sm">
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

      <Card className="overflow-hidden border-border/80 shadow-sm">
        <div className="border-b border-border/60 bg-muted/30 px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary"
              aria-hidden
            >
              {(name || "S").trim().charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-foreground">
                {name.trim() || "Student"}
              </p>
              {phone?.trim() ? (
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  {phone.trim()}
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a phone number in Personal details (Edit) so we can reach you if needed.
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Reading target band
            </p>
            <p className="mt-1 text-base font-semibold text-foreground">
              {readingTarget != null ? `Band ${readingTarget}` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Current location
            </p>
            <p className="mt-1 flex items-start gap-2 text-sm text-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span>
                {[currentCity, currentCountry].filter(Boolean).join(", ") || "—"}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Study goal
            </p>
            <p className="mt-1 flex items-start gap-2 text-sm text-foreground">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span>
                {[dreamCity, dreamCountry].filter(Boolean).join(" → ") || "—"}
              </span>
            </p>
          </div>
        </div>
      </Card>

      <Card className="border-border/80 p-6 shadow-sm md:p-8">
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

      <section aria-labelledby="reading-overview-heading">
        <h2 id="reading-overview-heading" className="sr-only">
          Reading overview
        </h2>
        <ProfileSummarySection />
      </section>

      <Card className="border-border/80 p-6 shadow-sm md:p-8">
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
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {row.label}
                </p>
                <p className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-sm text-foreground">
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
