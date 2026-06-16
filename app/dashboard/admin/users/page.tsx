"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getAdminUserFullProfile,
  searchAdminUsers,
  type AdminUserFullProfile,
} from "@/src/lib/api/adminUsers";
import type { AdminUserSearchResult } from "@/src/lib/api/types";
import { countryCodeToLabel } from "@/src/lib/countryCodes";
import { ArrowLeft, Eye, Lock, Search, Shield, Unlock, User } from "lucide-react";

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<AdminUserSearchResult[]>([]);
  const [selected, setSelected] = useState<AdminUserFullProfile | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    setSelected(null);
    try {
      const data = await searchAdminUsers(query.trim());
      setResults(data);
      if (data.length === 0) {
        setError("No students matched that email or username.");
      }
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }, [query]);

  const openFullProfile = async (userId: string) => {
    setLoadingDetail(true);
    setError(null);
    try {
      const profile = await getAdminUserFullProfile(userId);
      setSelected(profile);
    } catch {
      setError("Could not load full profile.");
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            User search
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Admins bypass privacy settings and can view every detail of any student profile.
          </p>
        </div>
        <Link href="/dashboard/admin">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Admin dashboard
          </Button>
        </Link>
      </div>

      <Card className="border-primary/20 bg-primary/5 p-4">
        <div className="flex gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Admin bypass:</strong> Private accounts still
            show full progress, test scores, and analytics here — regardless of{" "}
            <code className="rounded bg-muted px-1">isPrivate</code>.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="search">Email or username</Label>
            <Input
              id="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="student@email.com or username"
              autoComplete="off"
            />
          </div>
          <Button type="submit" disabled={searching || !query.trim()} className="gap-2">
            <Search className="h-4 w-4" />
            {searching ? "Searching…" : "Search"}
          </Button>
        </form>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </Card>

      {results.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Results</h2>
          <div className="space-y-2">
            {results.map((user) => (
              <Card
                key={user._id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {user.displayName ?? user.username ?? user.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.email}
                    {user.username ? ` · @${user.username}` : " · no username"}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {user.isPrivate ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                        <Lock className="h-3 w-3" /> Private
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700">
                        <Unlock className="h-3 w-3" /> Public
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {user.username && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/u/${user.username}`} target="_blank">
                        Public view
                      </Link>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="gap-2"
                    disabled={loadingDetail}
                    onClick={() => openFullProfile(user._id)}
                  >
                    <Eye className="h-4 w-4" />
                    Full profile
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {selected && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <User className="h-5 w-5" />
            Full profile — admin view
          </h2>
          <Card className="space-y-6 p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Detail label="Email" value={selected.user.email} />
              <Detail label="Username" value={selected.user.username ?? "—"} />
              <Detail label="Display name" value={selected.user.displayName ?? "—"} />
              <Detail
                label="Privacy"
                value={selected.user.isPrivate ? "Private (admin bypass active)" : "Public"}
              />
              <Detail
                label="Current country"
                value={selected.user.currentCountryLabel ?? selected.user.currentCountry ?? "—"}
              />
              <Detail
                label="Dream country"
                value={selected.user.dreamCountryLabel ?? selected.user.dreamCountry ?? "—"}
              />
              <Detail
                label="Desired band"
                value={
                  selected.user.desiredBandScore != null
                    ? String(selected.user.desiredBandScore)
                    : "—"
                }
              />
              <Detail
                label="Reading target"
                value={
                  selected.user.readingTargetBand != null
                    ? String(selected.user.readingTargetBand)
                    : "—"
                }
              />
            </div>

            {selected.readingDashboard && (
              <div>
                <h3 className="font-semibold text-foreground">Reading dashboard</h3>
                <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-muted/40 p-4 text-xs">
                  {JSON.stringify(selected.readingDashboard, null, 2)}
                </pre>
              </div>
            )}

            {selected.analytics && (
              <div>
                <h3 className="font-semibold text-foreground">Analytics</h3>
                <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-muted/40 p-4 text-xs">
                  {JSON.stringify(selected.analytics, null, 2)}
                </pre>
              </div>
            )}

            {selected.student && (
              <div>
                <h3 className="font-semibold text-foreground">Student record</h3>
                <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-muted/40 p-4 text-xs">
                  {JSON.stringify(selected.student, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/admin/students/${selected.user._id}`}>
                  Reading monitoring detail
                </Link>
              </Button>
              {selected.user.username && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/u/${selected.user.username}`} target="_blank">
                    View public page
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
