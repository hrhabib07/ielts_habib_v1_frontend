"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPublicSquad, type SquadDetail } from "@/src/lib/api/squad";
import { SquadDetailView } from "@/src/components/squad/SquadDetailView";

export default function PublicSquadPage() {
  const params = useParams();
  const slug = String(params.slug ?? "");
  const [squad, setSquad] = useState<SquadDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getPublicSquad(slug)
      .then(setSquad)
      .catch(() => setError("Squad খুঁজে পাওয়া যায়নি"));
  }, [slug]);

  return (
    <div className="mx-auto max-w-lg px-4 py-8 font-bengali sm:max-w-2xl sm:py-10">
      <Link href="/squad/leaderboard" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Leaderboard
      </Link>
      {error ? <p className="text-destructive">{error}</p> : null}
      {squad ? <SquadDetailView squad={squad} /> : null}
    </div>
  );
}
