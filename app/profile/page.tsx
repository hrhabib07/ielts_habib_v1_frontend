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
import { ProfileSummarySection } from "@/src/components/profile/ProfileSummarySection";
import { ProfilePageSkeleton } from "@/src/components/profile/ProfilePageSkeleton";
import {
  BookOpen,
  CreditCard,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  User,
} from "lucide-react";

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
          profile.profile?.currentCountry ?? profile.profile?.country ?? "",
        );
        setDreamCity(profile.profile?.dreamCity ?? "");
        setDreamCountry(profile.profile?.dreamCountry ?? "");
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
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateProfile({
        name: name.trim() || undefined,
        profile: {
          currentCity: currentCity.trim() || undefined,
          currentCountry: currentCountry.trim() || undefined,
          dreamCity: dreamCity.trim() || undefined,
          dreamCountry: dreamCountry.trim() || undefined,
          phone: phone.trim() || undefined,
        },
      });
      if (updated) setProfileRecord(updated);
      setSuccess("Profile updated successfully.");
    } catch {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
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
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your account, subscription, and reading progress in one place.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/profile/reading">
              <BookOpen className="h-4 w-4" />
              Go to Reading
            </Link>
          </Button>
          <Button asChild variant="default" className="gap-2 shadow-sm">
            <Link href="/profile/score-guarantee">
              <Shield className="h-4 w-4" />
              Score Guarantee™
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
                full. Open the full policy and checklist.
              </p>
            </div>
          </div>
          <span className="text-sm font-semibold text-primary group-hover:underline sm:shrink-0">
            View guarantee →
          </span>
        </div>
      </Link>

      <Card className="overflow-hidden border-border/80">
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
                  Add a phone number below so we can reach you if needed.
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

      <Card className="border-border/80 p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-foreground">Subscription</h2>
            <p className="text-sm text-muted-foreground">
              Your plan and access period. Manage billing from pricing.
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

      <Card className="border-border/80 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Edit personal details
          </h2>
          <p className="text-sm text-muted-foreground">
            Update your name, phone, and location. These fields are saved to your
            account.
          </p>
        </div>
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
              <Input
                id="currentCountry"
                value={currentCountry}
                onChange={(e) => setCurrentCountry(e.target.value)}
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
              <Label htmlFor="dreamCountry">Dream country</Label>
              <Input
                id="dreamCountry"
                value={dreamCountry}
                onChange={(e) => setDreamCountry(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
