"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMyProfile, updateProfile } from "@/src/lib/api/profile";
import { ProfileSummarySection } from "@/src/components/profile/ProfileSummarySection";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [currentCountry, setCurrentCountry] = useState("");
  const [dreamCity, setDreamCity] = useState("");
  const [dreamCountry, setDreamCountry] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    let cancelled = false;
    getMyProfile()
      .then((profile) => {
        if (cancelled || !profile) return;
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
        if (!cancelled) setError("Failed to load profile.");
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
      await updateProfile({
        name: name.trim() || undefined,
        profile: {
          currentCity: currentCity.trim() || undefined,
          currentCountry: currentCountry.trim() || undefined,
          dreamCity: dreamCity.trim() || undefined,
          dreamCountry: dreamCountry.trim() || undefined,
          phone: phone.trim() || undefined,
        },
      });
      setSuccess("Profile updated successfully.");
    } catch {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your reading journey and keep your destination goals visible.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/profile/reading">Go to reading</Link>
        </Button>
      </div>

      <ProfileSummarySection />

      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Personal details</h2>
          <p className="text-sm text-muted-foreground">
            Update the places you are in now and the destination you are aiming for.
          </p>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentCity">Current city</Label>
              <Input id="currentCity" value={currentCity} onChange={(e) => setCurrentCity(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentCountry">Current country</Label>
              <Input id="currentCountry" value={currentCountry} onChange={(e) => setCurrentCountry(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dreamCity">Dream city</Label>
              <Input id="dreamCity" value={dreamCity} onChange={(e) => setDreamCity(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dreamCountry">Dream country</Label>
              <Input id="dreamCountry" value={dreamCountry} onChange={(e) => setDreamCountry(e.target.value)} disabled={loading} />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}
          <Button type="submit" disabled={loading || saving}>
            {saving ? "Saving..." : "Save profile"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
