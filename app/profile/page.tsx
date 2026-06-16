"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/src/lib/api/profile";
import { type ActiveSubscription } from "@/src/lib/api/subscription";
import type { StudentProfile } from "@/src/lib/api/types";
import { CountryCodeSelect } from "@/src/components/profile/CountryCodeSelect";
import { ProfileChangePassword } from "@/src/components/profile/ProfileChangePassword";
import { ProfileSummarySection } from "@/src/components/profile/ProfileSummarySection";
import { ProfilePrivacySettings } from "@/src/components/profile/ProfilePrivacySettings";
import { ProfileFollowingSection } from "@/src/components/profile/ProfileFollowingSection";
import { ProfilePageSkeleton } from "@/src/components/profile/ProfilePageSkeleton";
import {
  countryCodeToLabel,
  SAME_COUNTRY_WARNING,
} from "@/src/lib/countryCodes";
import {
  BookOpen,
  CreditCard,
  Globe2,
  Link2,
  Lock,
  MessageCircle,
  Pencil,
  Phone,
  Sparkles,
  User,
  X,
} from "lucide-react";
import {
  SUPPORT_WHATSAPP_DISPLAY,
  SUPPORT_WHATSAPP_HREF,
} from "@/src/lib/contact";
import { FoundingMemberBadge } from "@/src/components/founding-member/FoundingMemberBadge";
import { formatSubscriptionDuration } from "@/src/lib/formatSubscriptionDuration";
import { isFoundingMemberEligible } from "@/src/lib/foundingMember";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";

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
  const [countryWarning, setCountryWarning] = useState<string | null>(null);
  const [profileRecord, setProfileRecord] = useState<StudentProfile | null>(null);
  const [subscription, setSubscription] = useState<ActiveSubscription | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [currentCountry, setCurrentCountry] = useState("BD");
  const [dreamCountry, setDreamCountry] = useState("UK");
  const [phone, setPhone] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [editingPersonalDetails, setEditingPersonalDetails] = useState(false);
  const {
    profile: sessionProfile,
    subscription: sessionSubscription,
    loading: sessionLoading,
    refresh: refreshSession,
  } = useStudentSession();

  const resetPersonalFormFromRecord = (record: StudentProfile) => {
    setDisplayName(record.displayName ?? "");
    setUsername(record.username ?? "");
    setCurrentCountry(record.currentCountry ?? "BD");
    setDreamCountry(record.dreamCountry ?? "UK");
    setPhone(record.profile?.phone ?? "");
    setIsPrivate(record.isPrivate ?? false);
  };

  useEffect(() => {
    if (sessionLoading) return;

    if (sessionProfile) {
      setProfileRecord(sessionProfile);
      setSubscription(sessionSubscription);
      resetPersonalFormFromRecord(sessionProfile);
      setError(null);
    } else {
      setError("Could not load your profile.");
    }

    setLoading(false);
  }, [sessionProfile, sessionSubscription, sessionLoading]);

  useEffect(() => {
    if (editingPersonalDetails && currentCountry === dreamCountry) {
      setCountryWarning(SAME_COUNTRY_WARNING);
    } else {
      setCountryWarning(null);
    }
  }, [currentCountry, dreamCountry, editingPersonalDetails]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }
    if (currentCountry === dreamCountry) {
      setCountryWarning(SAME_COUNTRY_WARNING);
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateProfile({
        displayName: displayName.trim(),
        currentCountry,
        dreamCountry,
        profile: phone.trim() ? { phone: phone.trim() } : undefined,
      });
      if (updated) {
        setProfileRecord(updated);
        resetPersonalFormFromRecord(updated);
        void refreshSession();
      }
      setSuccess("Profile updated successfully.");
      setEditingPersonalDetails(false);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : null;
      setError(msg ?? "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPersonalEdit = () => {
    if (profileRecord) resetPersonalFormFromRecord(profileRecord);
    setEditingPersonalDetails(false);
    setError(null);
    setSuccess(null);
    setCountryWarning(null);
  };

  const readingTarget =
    profileRecord?.desiredBandScore ?? profileRecord?.targetBands?.reading;
  const publicProfileUrl = username ? `/u/${username}` : null;

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

  const showFoundingBadge = isFoundingMemberEligible(subscription);

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -right-24 top-32 h-80 w-80 rounded-full bg-violet-500/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-500/6 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl space-y-8 px-4 py-8 md:space-y-10 md:px-6 md:py-10">
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
                    {(displayName || "S").trim().charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                    Student workspace
                  </p>
                  <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    {displayName.trim() || "Student"}
                  </h1>
                  {showFoundingBadge && (
                    <div className="mt-2">
                      <FoundingMemberBadge size="md" />
                    </div>
                  )}
                  {username && (
                    <p className="mt-1 text-sm text-muted-foreground">@{username}</p>
                  )}
                  {phone?.trim() ? (
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      {phone.trim()}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-foreground">
                      <Globe2 className="h-3 w-3 text-muted-foreground" />
                      {countryCodeToLabel(currentCountry) ?? currentCountry}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-foreground">
                      <User className="h-3 w-3 text-primary" />
                      Goal: {countryCodeToLabel(dreamCountry) ?? dreamCountry}
                    </span>
                    {readingTarget != null && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        Target · Band {readingTarget}
                      </span>
                    )}
                    {isPrivate && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/20 bg-muted/50 px-3 py-1 text-xs font-medium">
                        <Lock className="h-3 w-3" />
                        Private
                      </span>
                    )}
                  </div>
                  {publicProfileUrl && (
                    <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Link2 className="h-3.5 w-3.5" />
                      Public link:{" "}
                      <Link href={publicProfileUrl} className="font-medium text-primary hover:underline">
                        /u/{username}
                      </Link>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-stretch xl:flex-row">
                <Button asChild size="lg" className="gap-2 shadow-md shadow-primary/15">
                  <Link href="/profile/reading">
                    <BookOpen className="h-4 w-4" />
                    Open Reading
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
                  For billing, access, or product questions, message us on WhatsApp.
                </p>
              </div>
            </div>
            <Button
              asChild
              size="lg"
              className="w-full shrink-0 bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
            >
              <a href={SUPPORT_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                WhatsApp {SUPPORT_WHATSAPP_DISPLAY}
              </a>
            </Button>
          </div>
        </Card>

        <section aria-labelledby="reading-overview-heading" className="scroll-mt-8">
          <div className="mb-6">
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
                  Active plan and renewal window.
                </p>
              </div>
            </div>

            {subscription && subscription.status === "ACTIVE" ? (
              <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-foreground">
                    {subscription.planId?.name?.replace(/\(\s*1\s*month\s*\)/gi, "(6 Months)") ??
                      "Gamlish Reading Mastery (6 Months)"}
                  </p>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {subscriptionStatusLabel(subscription.status)}
                  </span>
                </div>
                {showFoundingBadge && (
                  <FoundingMemberBadge size="sm" />
                )}
                <p className="text-sm text-muted-foreground">
                  {formatSubscriptionDuration(
                    subscription.durationDaysApplied ??
                      subscription.planId?.durationInDays ??
                      180,
                  )}{" "}
                  access · Valid until{" "}
                  <span className="font-medium text-foreground">
                    {formatSubscriptionDate(subscription.endDate)}
                  </span>
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-muted/10 p-6 text-center">
                <p className="text-sm text-muted-foreground">No active subscription.</p>
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
                Profile settings
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Display name, countries, and phone. Username is permanent and cannot be changed.
                Profile visibility is managed below.
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
            <p className="mb-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {success}
            </p>
          ) : null}

          {!editingPersonalDetails ? (
            <div className="grid gap-6 md:grid-cols-2">
              {(
                [
                  { label: "Username", value: username.trim() || "—" },
                  { label: "Display name", value: displayName.trim() || "—" },
                  { label: "Phone", value: phone.trim() || "—" },
                  {
                    label: "Current country",
                    value: countryCodeToLabel(currentCountry) ?? currentCountry,
                  },
                  {
                    label: "Dream country",
                    value: countryCodeToLabel(dreamCountry) ?? dreamCountry,
                  },
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
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={username} readOnly disabled className="bg-muted/40" />
                  <p className="text-xs text-muted-foreground">Permanent — cannot be changed.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
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
                  <Label htmlFor="currentCountry">Current country</Label>
                  <CountryCodeSelect
                    id="currentCountry"
                    value={currentCountry}
                    onValueChange={setCurrentCountry}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dreamCountry">Dream country</Label>
                  <CountryCodeSelect
                    id="dreamCountry"
                    value={dreamCountry}
                    onValueChange={setDreamCountry}
                  />
                </div>
              </div>
              {countryWarning && (
                <p className="text-sm text-destructive">{countryWarning}</p>
              )}
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

        <ProfileFollowingSection />

        <ProfilePrivacySettings
          isPrivate={isPrivate}
          onPrivacyChange={(next) => {
            setIsPrivate(next);
            setProfileRecord((prev) => (prev ? { ...prev, isPrivate: next } : prev));
          }}
        />
      </div>
    </div>
  );
}
