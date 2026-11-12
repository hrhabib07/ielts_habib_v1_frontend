"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Gamepad2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { listAdminGames, type AdminGameSummary } from "@/src/lib/api/gameContent";

export function AdminGamesList() {
  const [games, setGames] = useState<AdminGameSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAdminGames()
      .then(setGames)
      .catch(() => setError("Could not load the games."));
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Level games</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit every question, choice, answer, hint and instruction. Changes stay in a draft until you publish.
        </p>
      </div>

      {error ? <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</Card> : null}
      {!games && !error ? <Loader2 className="size-6 animate-spin text-muted-foreground" /> : null}
      {games && games.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">
          No games in the database yet. Run <code className="font-mono">npm run seed:game-content</code> in the backend.
        </Card>
      ) : null}

      <div className="space-y-3">
        {games?.map((game) => (
          <Link key={game.gameKey} href={`/dashboard/admin/english/games/${game.gameKey}`}>
            <Card className="p-4 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Gamepad2 className="size-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{game.title.en}</p>
                  <p className="text-xs text-muted-foreground">
                    {game.levelKey} · {game.rounds} rounds · {game.questions} questions · live version {game.publishedVersion}
                  </p>
                </div>
                {game.hasDraft ? (
                  <span className="shrink-0 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:text-sky-300">
                    Draft
                  </span>
                ) : null}
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
