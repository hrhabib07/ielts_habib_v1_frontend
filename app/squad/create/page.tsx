"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSquad } from "@/src/lib/api/squad";
import { useSquadUiCopy } from "@/src/hooks/useLocalizedCopy";

export default function SquadCreatePage() {
  const SQUAD_UI = useSquadUiCopy();
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto max-w-md px-4 py-10 font-bengali">
      <Link href="/squad" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        {SQUAD_UI.back}
      </Link>
      <h1 className="text-2xl font-black">{SQUAD_UI.createTitle}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{SQUAD_UI.createHint}</p>
      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setLoading(true);
          try {
            const squad = await createSquad(name);
            router.push("/squad");
            router.refresh();
            void squad;
          } catch (err) {
            setError(err instanceof Error ? err.message : "তৈরি করা যায়নি");
          } finally {
            setLoading(false);
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="squad-name">{SQUAD_UI.squadName}</Label>
          <Input
            id="squad-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            required
            className="h-11 rounded-xl"
            placeholder="যেমন: Dhaka Warriors"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="h-11 w-full rounded-2xl font-bold" disabled={loading}>
          {SQUAD_UI.createSubmit}
        </Button>
      </form>
    </div>
  );
}
