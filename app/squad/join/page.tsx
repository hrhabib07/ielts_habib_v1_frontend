"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinSquad } from "@/src/lib/api/squad";
import { useSquadUiCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { squadJoinErrorMessage } from "@/src/lib/squad-join-errors";
import { cn } from "@/lib/utils";

export default function SquadJoinPage() {
  const SQUAD_UI = useSquadUiCopy();
  const { locale } = useUiLocale();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div
      className={cn(
        "mx-auto max-w-md px-4 py-10",
        locale === "bn" && "font-bengali",
      )}
    >
      <Link
        href="/squad"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {SQUAD_UI.back}
      </Link>
      <h1 className="text-2xl font-black">{SQUAD_UI.joinTitle}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{SQUAD_UI.joinHint}</p>
      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setLoading(true);
          try {
            await joinSquad(code.trim().toUpperCase());
            router.push("/squad");
            router.refresh();
          } catch (err) {
            setError(squadJoinErrorMessage(err, SQUAD_UI));
          } finally {
            setLoading(false);
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="invite-code">{SQUAD_UI.inviteCode}</Label>
          <Input
            id="invite-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={12}
            required
            className="h-11 rounded-xl font-mono text-lg tracking-widest"
            placeholder="GAM4X2"
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="h-11 w-full rounded-2xl font-bold" disabled={loading}>
          {SQUAD_UI.joinSubmit}
        </Button>
      </form>
    </div>
  );
}
