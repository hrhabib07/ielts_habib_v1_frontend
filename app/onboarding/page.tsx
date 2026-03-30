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
import { JourneyCountryCombobox } from "@/src/components/profile/JourneyCountryCombobox";
import { normalizeJourneyCountryLabel } from "@/src/lib/journeyCountries";
import { isStudentLearningReady } from "@/src/lib/student-learning-gate";
import {
  User,
  MapPin,
  Phone,
  AlertTriangle,
  BookOpen,
  Lock,
  Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BAND_OPTIONS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

type LangMode = "en" | "bn" | "both";

const bnFont = "[font-family:var(--font-hind-siliguri),sans-serif]";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<LangMode>("both");

  const [name, setName] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [currentCountry, setCurrentCountry] = useState("");
  const [dreamCity, setDreamCity] = useState("");
  const [dreamCountry, setDreamCountry] = useState("");
  const [phone, setPhone] = useState("");

  const [targetBand, setTargetBand] = useState<number | null>(null);
  const [ackPermanent, setAckPermanent] = useState(false);
  const [ackRealistic, setAckRealistic] = useState(false);

  const selectTargetBand = (band: number) => {
    setTargetBand(band);
    setAckPermanent(false);
    setAckRealistic(false);
  };

  useEffect(() => {
    let cancelled = false;
    getMyProfile()
      .then((p) => {
        if (cancelled) return;
        if (p?.name) setName(p.name ?? "");
        if (p?.profile?.currentCity || p?.profile?.city) {
          setCurrentCity(p.profile.currentCity ?? p.profile.city ?? "");
        }
        if (p?.profile?.currentCountry || p?.profile?.country) {
          setCurrentCountry(
            normalizeJourneyCountryLabel(
              p.profile.currentCountry ?? p.profile.country,
            ) ?? "",
          );
        }
        if (p?.profile?.dreamCity) setDreamCity(p.profile.dreamCity ?? "");
        if (p?.profile?.dreamCountry) {
          setDreamCountry(
            normalizeJourneyCountryLabel(p.profile.dreamCountry) ?? "",
          );
        }
        if (p?.profile?.phone) setPhone(p.profile.phone ?? "");
        if (isStudentLearningReady(p ?? null)) {
          router.replace("/");
          return;
        }
        if (
          p &&
          p.name?.trim() &&
          p.profile?.phone?.trim() &&
          p.profile.phone.trim().length >= 5 &&
          normalizeJourneyCountryLabel(
            p.profile.currentCountry ?? p.profile.country,
          ) &&
          normalizeJourneyCountryLabel(p.profile.dreamCountry) &&
          p.profile.currentCity?.trim() &&
          p.profile.dreamCity?.trim() &&
          p.targetBands?.reading == null
        ) {
          setStep(2);
        } else {
          setStep(1);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load profile");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const step1Valid =
    name.trim().length > 0 &&
    currentCity.trim().length > 0 &&
    Boolean(normalizeJourneyCountryLabel(currentCountry)) &&
    dreamCity.trim().length > 0 &&
    Boolean(normalizeJourneyCountryLabel(dreamCountry)) &&
    phone.trim().length >= 5;

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!step1Valid) {
      setError(
        "Fill in every field: full name, both cities, both countries (choose from the list), and phone.",
      );
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const canonicalCurrent = normalizeJourneyCountryLabel(currentCountry);
      const canonicalDream = normalizeJourneyCountryLabel(dreamCountry);
      if (!canonicalCurrent || !canonicalDream) {
        setError(
          "Type your country and tap a suggestion so it is saved correctly.",
        );
        setSubmitting(false);
        return;
      }
      await updateProfile({
        name: name.trim(),
        profile: {
          currentCity: currentCity.trim(),
          currentCountry: canonicalCurrent,
          dreamCity: dreamCity.trim(),
          dreamCountry: canonicalDream,
          phone: phone.trim(),
        },
      });
      setStep(2);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetBand == null) {
      setError("Select your desired Reading band score.");
      return;
    }
    if (!ackPermanent || !ackRealistic) {
      setError("Please confirm both statements below before continuing.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await setTargetBandOnce({ reading: targetBand });
      router.replace("/");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : null;
      setError(msg ?? "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100dvh-8rem)] min-h-[calc(100vh-8rem)] items-center justify-center px-4">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const showEn = lang === "en" || lang === "both";
  const showBn = lang === "bn" || lang === "both";

  return (
    <div
      className="mx-auto w-full max-w-[900px] px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8 sm:px-5 sm:py-10 md:py-12"
    >
      <div className="mb-5 flex w-full flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 text-center sm:max-w-[min(100%,28rem)] sm:text-left">
          <h1 className="text-balance text-xl font-bold leading-tight text-foreground sm:text-2xl sm:leading-snug">
            {step === 1 ? (
              <>
                <span className="block">Complete your profile</span>
                <span className={cn("mt-2 block text-sm font-normal leading-snug text-muted-foreground sm:mt-1 sm:text-base", bnFont)}>
                  আপনার প্রোফাইল সম্পূর্ণ করুন
                </span>
              </>
            ) : (
              <>
                <span className="block">Reading target band</span>
                <span className={cn("mt-2 block text-sm font-normal leading-snug text-muted-foreground sm:mt-1 sm:text-base", bnFont)}>
                  রিডিং টার্গেট ব্যান্ড
                </span>
              </>
            )}
          </h1>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:min-w-0">
          <p className="text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:hidden">
            Language / ভাষা
          </p>
          <div className="grid w-full grid-cols-3 gap-1 rounded-lg border border-border bg-muted/30 p-1 sm:flex sm:w-auto sm:items-center sm:gap-1">
            <Languages className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" aria-hidden />
            {(["en", "bn", "both"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setLang(m)}
                className={cn(
                  "min-h-10 touch-manipulation rounded-md px-2 py-2 text-center text-[11px] font-medium leading-tight transition-colors sm:min-h-0 sm:px-3 sm:py-1.5 sm:text-xs",
                  lang === m
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground active:bg-muted/80 sm:hover:text-foreground",
                )}
              >
                {m === "en" ? (
                  "English"
                ) : m === "bn" ? (
                  "বাংলা"
                ) : (
                  <>
                    <span className="flex flex-col items-center gap-0.5 text-[10px] leading-tight sm:hidden">
                      <span>Both</span>
                      <span className={cn(bnFont)}>উভয়</span>
                    </span>
                    <span className="hidden sm:inline">
                      Both / <span className={bnFont}>উভয়</span>
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {step === 1 && (
        <Card className="overflow-hidden p-4 shadow-sm sm:p-6 md:p-8">
          <p className="mb-5 text-xs leading-relaxed text-muted-foreground sm:mb-6 sm:text-sm sm:leading-normal">
            <span className="block">
              All fields are required before you can set your target band or use Reading. Study
              destination and current country must be chosen from the suggestions list.
            </span>
            <span className={cn("mt-2 block", bnFont)}>
              টার্গেট ব্যান্ড বা রিডিং শুরু করার আগে সব ঘর পূরণ করতে হবে। দেশ দুটো টাইপ করে তালিকা থেকে নির্বাচন করুন।
            </span>
          </p>
          <form onSubmit={handleStep1} className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex flex-col gap-0.5 sm:block sm:gap-0">
                <span className="leading-snug">
                  Full name <span className="text-destructive">*</span>
                </span>
                <span className={cn("text-xs font-normal text-muted-foreground sm:ml-2 sm:inline sm:text-sm", bnFont)}>(পূর্ণ নাম)</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="min-h-11 pl-10 text-base sm:min-h-10 sm:text-sm"
                  required
                />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentCity" className="flex flex-col gap-0.5 sm:block sm:gap-0">
                  <span className="leading-snug">
                    Current city <span className="text-destructive">*</span>
                  </span>
                  <span className={cn("text-xs font-normal text-muted-foreground sm:ml-2 sm:inline sm:text-sm", bnFont)}>(বর্তমান শহর)</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="currentCity"
                    type="text"
                    autoComplete="address-level2"
                    value={currentCity}
                    onChange={(e) => setCurrentCity(e.target.value)}
                    placeholder="Your current city"
                    className="min-h-11 pl-10 text-base sm:min-h-10 sm:text-sm"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentCountry" className="flex flex-col gap-0.5 sm:block sm:gap-0">
                  <span className="leading-snug">
                    Current country <span className="text-destructive">*</span>
                  </span>
                  <span className={cn("text-xs font-normal text-muted-foreground sm:ml-2 sm:inline sm:text-sm", bnFont)}>(বর্তমান দেশ)</span>
                </Label>
                <p className="text-[11px] leading-snug text-muted-foreground sm:text-xs">
                  Type to filter, then pick a row. Blur without a match clears the field.
                </p>
                <JourneyCountryCombobox
                  id="currentCountry"
                  value={currentCountry}
                  onValueChange={setCurrentCountry}
                  placeholder="Type country, choose from list"
                />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="dreamCity" className="flex flex-col gap-0.5 sm:block sm:gap-0">
                  <span className="leading-snug">
                    Dream / study city <span className="text-destructive">*</span>
                  </span>
                  <span className={cn("text-xs font-normal text-muted-foreground sm:ml-2 sm:inline sm:text-sm", bnFont)}>(লক্ষ্য শহর)</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="dreamCity"
                    type="text"
                    value={dreamCity}
                    onChange={(e) => setDreamCity(e.target.value)}
                    placeholder="City you aim to study in"
                    className="min-h-11 pl-10 text-base sm:min-h-10 sm:text-sm"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dreamCountry" className="flex flex-col gap-0.5 sm:block sm:gap-0">
                  <span className="leading-snug">
                    Study destination country <span className="text-destructive">*</span>
                  </span>
                  <span className={cn("text-xs font-normal text-muted-foreground sm:ml-2 sm:inline sm:text-sm", bnFont)}>(পড়াশোনার গন্তব্য দেশ)</span>
                </Label>
                <p className="text-[11px] leading-snug text-muted-foreground sm:text-xs">
                  Same supported list as the journey map — type, then select from suggestions below.
                </p>
                <JourneyCountryCombobox
                  id="dreamCountry"
                  value={dreamCountry}
                  onValueChange={setDreamCountry}
                  placeholder="Type country, choose from list"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex flex-col gap-0.5 sm:block sm:gap-0">
                <span className="leading-snug">
                  Phone <span className="text-destructive">*</span>
                </span>
                <span className={cn("text-xs font-normal text-muted-foreground sm:ml-2 sm:inline sm:text-sm", bnFont)}>(ফোন — আবশ্যক)</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Include country code if applicable"
                  className="min-h-11 pl-10 text-base sm:min-h-10 sm:text-sm"
                  required
                  minLength={5}
                  inputMode="tel"
                />
              </div>
            </div>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive sm:text-sm break-words">
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={submitting || !step1Valid}
              className="min-h-12 w-full touch-manipulation sm:min-h-11"
              size="lg"
            >
              {submitting ? "Saving..." : "Continue / এগিয়ে যান"}
            </Button>
          </form>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4 sm:space-y-6">
          <Card className="border-amber-500/35 bg-amber-500/[0.06] p-3 sm:p-4 md:p-5">
            <div className="flex gap-2.5 sm:gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
              <div className="min-w-0 space-y-2 text-xs leading-relaxed text-foreground sm:text-sm">
                {showEn ? (
                  <p className="font-medium">
                    This step is serious: your Reading target drives lesson difficulty, question level,
                    and pace for your whole course. Wrong band → unnecessary struggle.
                  </p>
                ) : null}
                {showBn ? (
                  <p className={cn("text-foreground/95", bnFont)}>
                    এই ধাপটি গুরুত্বপূর্ণ: আপনার রিডিং টার্গেট থেকেই লেসনের কঠিনতা, প্রশ্নের লেভেল ও গতি ঠিক হবে।
                    ভুল ব্যান্ড বেছে নিলে পথ কঠিন হয়ে যাবে।
                  </p>
                ) : null}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            {showEn ? (
              <Card className="border-primary/20 p-4 sm:p-5 md:p-6">
                <div className="flex gap-2.5 sm:gap-3">
                  <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" aria-hidden />
                  <div className="min-w-0 space-y-2 text-xs leading-relaxed text-muted-foreground sm:space-y-3 sm:text-sm">
                    <p className="font-semibold text-foreground">English</p>
                    <details className="touch-manipulation rounded-md border border-border/80 bg-background/60">
                      <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-medium text-foreground [&::-webkit-details-marker]:hidden sm:py-2">
                        Read full notice
                      </summary>
                      <div className="max-h-[min(55vh,22rem)] space-y-3 overflow-y-auto overscroll-y-contain border-t border-border/60 p-3 text-[11px] leading-relaxed sm:max-h-none sm:text-xs">
                        <p>
                          Please read this carefully. This choice is permanent for your account and
                          cannot be changed later. Your target score determines your lesson difficulty
                          and study pace. If you pick a score much higher than your current ability,
                          the content will be extremely difficult. Choose a realistic score that
                          matches your university or work goals.
                        </p>
                        <p className="font-medium text-foreground">Recommendation (The Safety Net)</p>
                        <p>
                          If you are unsure, Band 6.5 is the most practical choice. Most universities
                          and immigration programs require a 6.5 or less, meaning this score can
                          secure your position in almost every country for both Bachelor&apos;s and
                          Master&apos;s programs. If you want to be extra safe and have the confidence
                          to face tougher challenges, you can select Band 7. Avoid picking 8 or 9
                          unless you are already at an advanced level, as it will make your journey
                          unnecessarily harsh.
                        </p>
                      </div>
                    </details>
                  </div>
                </div>
              </Card>
            ) : null}
            {showBn ? (
              <Card className="border-primary/20 p-4 sm:p-5 md:p-6">
                <div className="flex gap-2.5 sm:gap-3">
                  <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" aria-hidden />
                  <div className={cn("min-w-0 space-y-2 text-xs leading-relaxed text-muted-foreground sm:space-y-3 sm:text-sm", bnFont)}>
                    <p className="font-semibold text-foreground">বাংলা</p>
                    <details className="touch-manipulation rounded-md border border-border/80 bg-background/60">
                      <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-medium text-foreground [&::-webkit-details-marker]:hidden sm:py-2">
                        সম্পূর্ণ নোটিশ পড়ুন
                      </summary>
                      <div className="max-h-[min(55vh,22rem)] space-y-3 overflow-y-auto overscroll-y-contain border-t border-border/60 p-3 text-[11px] leading-relaxed sm:max-h-none sm:text-xs">
                        <p>
                          আপনার টার্গেট স্কোরটি খুব ভেবেচিন্তে নির্বাচন করুন। এটি আপনার অ্যাকাউন্টের জন্য
                          স্থায়ী এবং পরবর্তীতে আর পরিবর্তন করা যাবে না। আপনার পছন্দের স্কোরের ওপর ভিত্তি
                          করেই লেসনের কঠিন্য এবং পড়ার গতি নির্ধারিত হবে। আপনি যদি বর্তমান দক্ষতার চেয়ে
                          অনেক বেশি স্কোর বেছে নেন, তবে লেসনগুলো আপনার জন্য অনেক বেশি কঠিন হয়ে যাবে।
                          আপনার লক্ষ্য অনুযায়ী একটি বাস্তবসম্মত স্কোর বেছে নিন।
                        </p>
                        <p className="font-medium text-foreground">পরামর্শ (সেফটি নেট)</p>
                        <p>
                          আপনি যদি নিশ্চিত না হন, তবে ব্যান্ড ৬.৫ বেছে নেওয়া সবচেয়ে বুদ্ধিমানের কাজ।
                          বেশিরভাগ বিশ্ববিদ্যালয় এবং ইমিগ্রেশন প্রোগ্রামের রিকোয়ারমেন্ট ৬.৫ বা তার কম
                          থাকে; তাই এই স্কোরটি ব্যাচেলর বা মাস্টার্স—উভয় ক্ষেত্রেই প্রায় প্রতিটি দেশে
                          আপনার অবস্থান নিশ্চিত করতে পারে। আপনি যদি আরও বেশি নিরাপদ থাকতে চান এবং আপনার
                          আত্মবিশ্বাস থাকে, তবে ব্যান্ড ৭ নির্বাচন করতে পারেন। তবে এখনই ৮ বা ৯ এর মতো কঠিন
                          লক্ষ্য না নেওয়াই ভালো, কারণ এতে আপনার পড়াশোনা অপ্রয়োজনীয়ভাবে কঠিন হয়ে যেতে পারে।
                        </p>
                      </div>
                    </details>
                  </div>
                </div>
              </Card>
            ) : null}
          </div>

          <Card className="border-border/80 p-4 sm:p-5 md:p-6">
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/[0.04] p-3 sm:mb-5 sm:gap-3 sm:p-4">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 space-y-2 text-xs leading-relaxed text-foreground sm:text-sm">
                {showEn ? (
                  <p>
                    <span className="font-semibold">Lock:</span> After you confirm, your Reading band
                    is fixed. The product uses it for levelling and content — there is no way to edit
                    it later in your profile.
                  </p>
                ) : null}
                {showBn ? (
                  <p className={cn("text-foreground/95", bnFont)}>
                    <span className="font-semibold">লক:</span> নিশ্চিত করার পর আপনার রিডিং ব্যান্ড
                    স্থায়ী থাকবে; পরে প্রোফাইল থেকে এটি বদলানো যাবে না।
                  </p>
                ) : null}
              </div>
            </div>

            <form onSubmit={handleStep2} className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <Label className="text-base sm:text-sm">Reading target band</Label>
                <p className={cn("text-xs text-muted-foreground sm:text-sm", showBn && bnFont)}>
                  {showEn
                    ? "Select one. If you change the number, you must tick both confirmations again."
                    : null}
                  {showBn ? (
                    <span className={cn("block", showEn ? "mt-1" : "")}>
                      একটি ব্যান্ড বাছুন। সংখ্যা বদলালে দুটি নিশ্চিতকরণ আবার দিতে হবে।
                    </span>
                  ) : null}
                </p>
                <div
                  className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:flex sm:flex-wrap sm:gap-2"
                  role="group"
                  aria-label="Reading band options"
                >
                  {BAND_OPTIONS.map((band) => (
                    <button
                      key={band}
                      type="button"
                      onClick={() => selectTargetBand(band)}
                      className={cn(
                        "min-h-11 touch-manipulation rounded-lg border px-2 py-2.5 text-center text-sm font-medium tabular-nums transition-colors active:scale-[0.98] sm:min-h-0 sm:px-4 sm:py-2",
                        targetBand === band
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-muted active:bg-muted",
                      )}
                    >
                      {band}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-border/90 bg-muted/20 p-3 sm:space-y-4 sm:p-4 md:p-5">
                <p className="text-sm font-medium text-foreground">
                  {showEn ? "Confirmations" : null}
                  {showBn ? (
                    <span className={cn("block", showEn ? "mt-1" : "", bnFont)}>নিশ্চিতকরণ</span>
                  ) : null}
                </p>
                <label className="flex cursor-pointer gap-3 rounded-lg border border-transparent py-1.5 pl-1 pr-2 text-xs leading-snug hover:bg-background/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring sm:p-2 sm:text-sm">
                  <input
                    type="checkbox"
                    checked={ackPermanent}
                    onChange={(e) => setAckPermanent(e.target.checked)}
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-input text-primary focus:ring-primary sm:mt-1 sm:h-4 sm:w-4"
                  />
                  <span>
                    {showEn ? (
                      <span className="block text-foreground">
                        I understand that my Reading target band is permanent and will govern how my
                        entire journey is structured.
                      </span>
                    ) : null}
                    {showBn ? (
                      <span className={cn("mt-1 block text-foreground/95", bnFont)}>
                        আমি বুঝতে পারছি যে আমার রিডিং টার্গেট ব্যান্ডটি স্থায়ী এবং এর ওপর ভিত্তি করেই
                        আমার পুরো কোর্সটি সাজানো হবে।
                      </span>
                    ) : null}
                  </span>
                </label>
                <label className="flex cursor-pointer gap-3 rounded-lg border border-transparent py-1.5 pl-1 pr-2 text-xs leading-snug hover:bg-background/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring sm:p-2 sm:text-sm">
                  <input
                    type="checkbox"
                    checked={ackRealistic}
                    onChange={(e) => setAckRealistic(e.target.checked)}
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-input text-primary focus:ring-primary sm:mt-1 sm:h-4 sm:w-4"
                  />
                  <span>
                    {showEn ? (
                      <span className="block text-foreground">
                        I have chosen a target that fits my real goal. I understand that an
                        unrealistically high target may make the experience much more challenging than
                        necessary.
                      </span>
                    ) : null}
                    {showBn ? (
                      <span className={cn("mt-1 block text-foreground/95", bnFont)}>
                        আমি এমন একটি লক্ষ্য বেছে নিয়েছি যা আমার বর্তমান দক্ষতা ও লক্ষ্যের সাথে
                        সামঞ্জস্যপূর্ণ। আমি বুঝতে পারছি যে অতিরিক্ত উচ্চ লক্ষ্য নির্ধারণ করলে পড়াশোনা অনেক
                        বেশি কঠিন হয়ে যেতে পারে।
                      </span>
                    ) : null}
                  </span>
                </label>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive sm:text-sm break-words">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                disabled={
                  submitting ||
                  targetBand == null ||
                  !ackPermanent ||
                  !ackRealistic
                }
                className="min-h-12 w-full touch-manipulation sm:min-h-11"
                size="lg"
              >
                {submitting
                  ? "Saving..."
                  : showBn && !showEn
                    ? "টার্গেট নিশ্চিত করুন ও চালিয়ে যান"
                    : "Confirm Reading target and continue"}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
