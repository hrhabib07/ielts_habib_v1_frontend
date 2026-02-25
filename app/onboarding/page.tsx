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
import type { StudentProfile } from "@/src/lib/api/types";
import { User, MapPin, Phone, AlertTriangle, Video } from "lucide-react";

const BAND_OPTIONS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2
  const [targetBand, setTargetBand] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyProfile()
      .then((p) => {
        if (cancelled) return;
        setProfile(p ?? null);
        if (p?.name) setName(p.name ?? "");
        if (p?.profile?.city) setCity(p.profile.city ?? "");
        if (p?.profile?.country) setCountry(p.profile.country ?? "");
        if (p?.profile?.phone) setPhone(p.profile.phone ?? "");
        // If target band already set, skip onboarding
        if (p?.targetBands?.reading != null) {
          router.replace("/profile/reading");
          return;
        }
        setStep(1);
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

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await updateProfile({
        name: name.trim() || undefined,
        profile: {
          city: city.trim() || undefined,
          country: country.trim() || undefined,
          phone: phone.trim() || undefined,
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
      setError("Please select your target band.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await setTargetBandOnce({ reading: targetBand });
      router.replace("/profile/reading");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg ?? "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          {step === 1 ? "Complete your profile" : "Set your target band"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {step === 1
            ? "Add your details. You can update these later from your profile."
            : "Step 2 of 2 — read the instructions carefully."}
        </p>
      </div>

      {step === 1 && (
        <Card className="p-8">
          <form onSubmit={handleStep1} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="pl-10"
                />
              </div>
            </div>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" disabled={submitting} className="w-full" size="lg">
              {submitting ? "Saving..." : "Continue"}
            </Button>
          </form>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {/* Video placeholder — you will add your instruction video here */}
          <Card className="overflow-hidden border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-8 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <Video className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="mt-4 font-medium text-foreground">
              Watch the instruction video
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              A short video will explain how to choose your target band. (Add your video link or embed here.)
            </p>
          </Card>

          {/* Text disclaimer */}
          <Card className="border-amber-500/50 bg-amber-500/5 p-6">
            <div className="flex gap-3">
              <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-500" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-foreground">
                  Your target band drives the whole system
                </p>
                <p className="text-muted-foreground">
                  Your chosen band score is used to unlock levels, recommend content, and track your progress. It is{" "}
                  <strong>set once and cannot be updated later</strong>. If it were changeable, previously unlocked content could lock again and your progress would become invalid. Please pick your target band carefully based on your real goal (e.g. university requirement or immigration).
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <form onSubmit={handleStep2} className="space-y-6">
              <div className="space-y-2">
                <Label>Target band (Reading)</Label>
                <p className="text-sm text-muted-foreground">
                  Select the band score you are aiming for. This cannot be changed after you continue.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {BAND_OPTIONS.map((band) => (
                    <button
                      key={band}
                      type="button"
                      onClick={() => setTargetBand(band)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                        targetBand === band
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-muted"
                      }`}
                    >
                      {band}
                    </button>
                  ))}
                </div>
              </div>
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                disabled={submitting || targetBand == null}
                className="w-full"
                size="lg"
              >
                {submitting ? "Saving..." : "Set target band and continue"}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
