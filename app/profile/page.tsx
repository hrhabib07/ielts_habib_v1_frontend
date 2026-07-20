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
import { ProfileEnglishSummarySection } from "@/src/components/profile/ProfileEnglishSummarySection";
import { ProfileSquadSection } from "@/src/components/squad/ProfileSquadSection";
import { ProfilePageSkeleton } from "@/src/components/profile/ProfilePageSkeleton";
import {
  countryCodeToLabel,
} from "@/src/lib/countryCodes";
import {
  BookOpen,
  CreditCard,
  Gamepad2,
  Globe2,
  Link2,
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
import { ENABLE_READING, PRIMARY_STUDENT_HREF } from "@/src/lib/platform-config";
import { useOnboardingCopy, useProfilePageCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { UsernameClaimBanner } from "@/src/components/profile/UsernameClaimBanner";
import { MyGamlishHub } from "@/src/components/profile/MyGamlishHub";
import { PlayerXpHud } from "@/src/components/player/PlayerXpHud";
import { JoinedDateBadge } from "@/src/components/profile/JoinedDateBadge";

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
  const { locale } = useUiLocale();
  const copy = useProfilePageCopy();
  const onboardingCopy = useOnboardingCopy();
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
  };

  useEffect(() => {
    if (sessionLoading) return;

    if (sessionProfile) {
      setProfileRecord(sessionProfile);
      setSubscription(sessionSubscription);
      resetPersonalFormFromRecord(sessionProfile);
      setError(null);
    } else {
      setError(
        locale === "bn"
          ? "প্রোফাইল লোড করা যায়নি।"
          : "Could not load your profile.",
      );
    }

    setLoading(false);
  }, [sessionProfile, sessionSubscription, sessionLoading, locale]);

  useEffect(() => {
    if (editingPersonalDetails && currentCountry === dreamCountry) {
      setCountryWarning(onboardingCopy.sameCountryWarning);
    } else {
      setCountryWarning(null);
    }
  }, [
    currentCountry,
    dreamCountry,
    editingPersonalDetails,
    onboardingCopy.sameCountryWarning,
  ]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError(onboardingCopy.errDisplayName);
      return;
    }
    if (ENABLE_READING && currentCountry === dreamCountry) {
      setCountryWarning(onboardingCopy.sameCountryWarning);
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateProfile(
        ENABLE_READING
          ? {
              displayName: displayName.trim(),
              currentCountry,
              dreamCountry,
              profile: phone.trim() ? { phone: phone.trim() } : undefined,
            }
          : {
              displayName: displayName.trim(),
              profile: phone.trim() ? { phone: phone.trim() } : undefined,
            },
      );
      if (updated) {
        setProfileRecord(updated);
        resetPersonalFormFromRecord(updated);
        void refreshSession();
      }
      setSuccess(copy.saveSuccess);
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

  const publicHandle =
    profileRecord.publicHandle ??
    profileRecord.username ??
    profileRecord.publicId ??
    null;
  const publicProfileUrl = publicHandle ? `/u/${publicHandle}` : null;

  const showFoundingBadge = isFoundingMemberEligible(
    subscription,
    profileRecord,
  );

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -right-24 top-32 h-80 w-80 rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-primary/4 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl space-y-8 px-4 py-8 md:space-y-10 md:px-6 md:py-10">
        {!ENABLE_READING ? (
          <div className="-mx-4 md:-mx-6">
            <PlayerXpHud className="rounded-none border-x-0 sm:mx-4 sm:rounded-2xl sm:border md:mx-6" />
          </div>
        ) : null}

        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lg shadow-black/[0.03] dark:shadow-black/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-primary/[0.04]" aria-hidden />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-5">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/40 to-primary/25 blur-sm" aria-hidden />
                  <div
                    className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-2xl font-bold text-primary-foreground shadow-lg"
                    aria-hidden
                  >
                    {(displayName || "S").trim().charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                    {copy.workspaceLabel}
                  </p>
                  <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    {displayName.trim() || "Student"}
                  </h1>
                  {showFoundingBadge && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <FoundingMemberBadge size="md" />
                      {profileRecord.founderNumber ? (
                        <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                          #{String(profileRecord.founderNumber).padStart(3, "0")}
                          {profileRecord.founderTier
                            ? ` · ${profileRecord.founderTier}`
                            : ""}
                        </span>
                      ) : null}
                    </div>
                  )}
                  {publicHandle ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {profileRecord.username
                        ? `@${profileRecord.username}`
                        : `ID · ${publicHandle}`}
                    </p>
                  ) : null}
                  <div className="mt-2">
                    <JoinedDateBadge
                      joinedAt={
                        typeof profileRecord.joinedAt === "string"
                          ? profileRecord.joinedAt
                          : null
                      }
                    />
                  </div>
                  {phone?.trim() ? (
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      {phone.trim()}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {!ENABLE_READING ? (
                      <>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          <Gamepad2 className="h-3 w-3" />
                          {copy.englishPlayer}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
                          {copy.mission01Free}
                        </span>
                      </>
                    ) : (
                      <>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-foreground">
                      <Globe2 className="h-3 w-3 text-muted-foreground" />
                      {countryCodeToLabel(currentCountry) ?? currentCountry}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-foreground">
                      <User className="h-3 w-3 text-primary" />
                      Goal: {countryCodeToLabel(dreamCountry) ?? dreamCountry}
                    </span>
                    {readingTarget != null && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
                        Target · Band {readingTarget}
                      </span>
                    )}
                      </>
                    )}
                  </div>
                  {publicProfileUrl ? (
                    <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Link2 className="h-3.5 w-3.5" />
                      Public profile:{" "}
                      <Link href={publicProfileUrl} className="font-medium text-primary hover:underline">
                        /u/{publicHandle}
                      </Link>
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-stretch xl:flex-row">
                {ENABLE_READING ? (
                <Button asChild size="lg" className="gap-2 shadow-md shadow-primary/15">
                  <Link href="/profile/reading">
                    <BookOpen className="h-4 w-4" />
                    Open Reading
                  </Link>
                </Button>
                ) : (
                <Button asChild size="lg" className="gap-2 shadow-md shadow-primary/15">
                  <Link href={PRIMARY_STUDENT_HREF}>
                    <Gamepad2 className="h-4 w-4" />
                    {copy.openCampMap}
                  </Link>
                </Button>
                )}
                {publicProfileUrl ? (
                  <Button asChild variant="outline" size="lg" className="gap-2">
                    <Link href={publicProfileUrl}>
                      <Link2 className="h-4 w-4" />
                      Public profile
                    </Link>
                  </Button>
                ) : null}
                <Button asChild variant="secondary" size="lg" className="gap-2">
                  <Link href="/pricing?course=english-foundations">
                    <CreditCard className="h-4 w-4" />
                    {copy.plans}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <UsernameClaimBanner />

        {!ENABLE_READING ? (
          <Card className="border border-border/60 bg-card/80 p-5 shadow-sm md:p-7">
            <MyGamlishHub />
          </Card>
        ) : null}

        <Card className="overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-card to-card shadow-sm transition-shadow hover:shadow-md">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between md:p-7">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  {copy.supportTitle}
                </p>
                <p className="mt-1 font-semibold text-foreground">{copy.supportHeadline}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {copy.supportBody}
                </p>
              </div>
            </div>
            <Button
              asChild
              size="lg"
              className="w-full shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
            >
              <a href={SUPPORT_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                WhatsApp {SUPPORT_WHATSAPP_DISPLAY}
              </a>
            </Button>
          </div>
        </Card>

        <section aria-labelledby="progress-overview-heading" className="scroll-mt-8">
          <div className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              {copy.analyticsLabel}
            </p>
            <h2
              id="progress-overview-heading"
              className="mt-1 text-xl font-bold tracking-tight text-foreground md:text-2xl"
            >
              {ENABLE_READING ? "Reading progress" : copy.progressTitle}
            </h2>
          </div>
          {ENABLE_READING ? <ProfileSummarySection /> : <ProfileEnglishSummarySection />}
          {!ENABLE_READING ? (
            <div className="mt-6">
              <ProfileSquadSection />
            </div>
          ) : null}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/70 p-6 shadow-sm md:p-7">
            <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground md:text-xl">
              {copy.accountSecurity}
            </h2>
            <ProfileChangePassword
              hasPassword={profileRecord?.hasPassword !== false}
              onPasswordSet={() => {
                void refreshSession();
              }}
            />
          </Card>

          <Card className="border-border/80 p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary ring-1 ring-primary/10">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                  {copy.subscription}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {copy.subscriptionHint}
                </p>
              </div>
            </div>

            {subscription && subscription.status === "ACTIVE" ? (
              <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-foreground">
                    {subscription.planId?.name?.replace(/\(\s*1\s*month\s*\)/gi, "(6 Months)") ??
                      (ENABLE_READING ? "Gamlish Reading Mastery (6 Months)" : "English Foundations")}
                  </p>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
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
                <p className="text-sm text-muted-foreground">{copy.noSubscription}</p>
                <Button asChild className="mt-4 gap-2">
                  <Link href="/pricing?course=english-foundations">
                    <Sparkles className="h-4 w-4" />
                    {copy.viewPlans}
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
                {copy.profileSettings}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {ENABLE_READING
                  ? "Display name, countries, and phone. Username is permanent and cannot be changed."
                  : copy.profileSettingsHint}
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
                {copy.edit}
              </Button>
            ) : null}
          </div>

          {!editingPersonalDetails && success ? (
            <p className="mb-4 text-sm font-medium text-primary">
              {success}
            </p>
          ) : null}

          {!editingPersonalDetails ? (
            <div className="grid gap-6 md:grid-cols-2">
              {(
                ENABLE_READING
                  ? [
                      { label: "Username", value: username.trim() || "" },
                      { label: "Display name", value: displayName.trim() || "" },
                      { label: copy.phone, value: phone.trim() || "" },
                      {
                        label: "Current country",
                        value: countryCodeToLabel(currentCountry) ?? currentCountry,
                      },
                      {
                        label: "Dream country",
                        value: countryCodeToLabel(dreamCountry) ?? dreamCountry,
                      },
                    ]
                  : [
                      { label: copy.nickname, value: displayName.trim() || "" },
                      { label: copy.phone, value: phone.trim() || "" },
                    ]
              ).map((row) => (
                <div key={row.label} className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {row.label}
                  </p>
                  <p className="rounded-xl border border-border/50 bg-muted/25 px-3.5 py-2.5 text-sm text-foreground">
                    {row.value || "-"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {ENABLE_READING ? (
                  <>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={username} readOnly disabled className="bg-muted/40" />
                  <p className="text-xs text-muted-foreground">Permanent. cannot be changed.</p>
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
                  <Label htmlFor="phone">{copy.phone}</Label>
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
                  </>
                ) : (
                  <>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="displayName">{copy.nickname}</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    autoComplete="nickname"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone">{copy.phone}</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                  />
                </div>
                  </>
                )}
              </div>
              {countryWarning && (
                <p className="text-sm text-destructive">{countryWarning}</p>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? copy.saving : copy.save}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  className="gap-2"
                  onClick={handleCancelPersonalEdit}
                >
                  <X className="h-4 w-4" aria-hidden />
                  {copy.cancel}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
