"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { ArrowLeft, Eye, History, Loader2, Mic, Save, Send, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PLAYGROUNDS } from "@/src/features/playground/content";
import type { Playground } from "@/src/features/playground/types";
import { gameVoiceLines, mergeGameAudio } from "@/src/features/playground/lib/voiceLines";
import type { StepAudio } from "@/src/features/chat-lesson/hooks/useLessonSpeech";
import {
  discardGameDraft,
  getAdminGame,
  getVoiceStatus,
  makeGameVoice,
  publishGame,
  restoreGameVersion,
  saveGameDraft,
  type AdminGame,
  type VoiceStatus,
} from "@/src/lib/api/gameContent";
import { ObjectFields, type Json, type JsonObject } from "./components/FieldEditor";
import { RoundSection } from "./components/RoundSection";
import { GamePreview, PublishDialog, VersionsDialog, VoiceDialog, VoiceSummary } from "./components/GameDialogs";

const VOICE_POLL_MS = 6_000;
const GAME_FIELDS_HIDDEN = ["id", "afterStepId", "rounds"];
const NO_AUDIO: StepAudio = { clips: {} };

function apiMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(error)) return error.response?.data?.message ?? fallback;
  return error instanceof Error ? error.message : fallback;
}

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "");

type Dialog = { type: "publish"; status: VoiceStatus } | { type: "voice"; status: VoiceStatus } | { type: "versions" } | null;

export function AdminGameEditor({ gameKey }: { gameKey: string }) {
  const [data, setData] = useState<AdminGame | null>(null);
  const [working, setWorking] = useState<JsonObject | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [preview, setPreview] = useState<StepAudio | null>(null);
  const [liveVoice, setLiveVoice] = useState<VoiceStatus | null>(null);

  const shipped = PLAYGROUNDS[gameKey]?.audio ?? NO_AUDIO;

  const adopt = useCallback((game: AdminGame) => {
    setData(game);
    setWorking((game.draft ?? game.published) as unknown as JsonObject);
    setDirty(false);
  }, []);

  const refreshLiveVoice = useCallback(
    async (published: Playground) => {
      try {
        setLiveVoice(await getVoiceStatus(gameVoiceLines(published, shipped)));
      } catch {
        setLiveVoice(null);
      }
    },
    [shipped],
  );

  useEffect(() => {
    getAdminGame(gameKey)
      .then((game) => {
        adopt(game);
        void refreshLiveVoice(game.published);
      })
      .catch((e: unknown) => setError(apiMessage(e, "Could not load the game.")));
  }, [gameKey, adopt, refreshLiveVoice]);

  useEffect(() => {
    if (!data || !liveVoice?.pending) return;
    const timer = window.setTimeout(() => void refreshLiveVoice(data.published), VOICE_POLL_MS);
    return () => window.clearTimeout(timer);
  }, [data, liveVoice, refreshLiveVoice]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const edit = (next: JsonObject) => {
    setWorking(next);
    setDirty(true);
    setNotice(null);
  };

  const run = async <T,>(label: string, task: () => Promise<T>): Promise<T | null> => {
    setBusy(label);
    setError(null);
    try {
      return await task();
    } catch (e) {
      setError(apiMessage(e, "Something went wrong. Please try again."));
      return null;
    } finally {
      setBusy(null);
    }
  };

  const save = async (): Promise<AdminGame | null> => {
    if (!working) return null;
    const saved = await run("save", () => saveGameDraft(gameKey, working as unknown as Playground));
    if (saved) {
      adopt(saved);
      setNotice("Draft saved. Learners still see the published version until you publish.");
    }
    return saved;
  };

  const openPublish = async () => {
    const current = dirty ? await save() : data;
    if (!current?.draft) {
      setError("There are no unpublished changes.");
      return;
    }
    const draft = current.draft;
    const status = await run("publish-check", () => getVoiceStatus(gameVoiceLines(draft, shipped)));
    if (status) setDialog({ type: "publish", status });
  };

  const publish = async (note: string) => {
    if (!data?.draft) return;
    const draft = data.draft;
    const result = await run("publish", () => publishGame(gameKey, note, gameVoiceLines(draft, shipped)));
    if (!result) return;
    adopt(result.game);
    setDialog(null);
    setNotice(
      `Published version ${result.game.publishedVersion}.${result.queued ? ` ${result.queued} voice lines are being made.` : ""}`,
    );
    void refreshLiveVoice(result.game.published);
  };

  const openVoice = async () => {
    if (!data) return;
    const published = data.published;
    const status = await run("voice-check", () => getVoiceStatus(gameVoiceLines(published, shipped)));
    if (status) setDialog({ type: "voice", status });
  };

  const makeVoice = async () => {
    if (!data) return;
    const published = data.published;
    const result = await run("voice", () => makeGameVoice(gameKey, gameVoiceLines(published, shipped)));
    if (!result) return;
    setDialog(null);
    setNotice(`${result.queued} voice lines are being made in the background.`);
    void refreshLiveVoice(published);
  };

  const discard = async () => {
    if (!window.confirm("Throw away the draft and go back to the published version?")) return;
    const game = await run("discard", () => discardGameDraft(gameKey));
    if (game) {
      adopt(game);
      setNotice("Draft discarded.");
    }
  };

  const restore = async (version: number) => {
    const game = await run("restore", () => restoreGameVersion(gameKey, version));
    if (game) {
      adopt(game);
      setDialog(null);
      setNotice(`Version ${version} is in the draft. Check it, then publish.`);
    }
  };

  const openPreview = async () => {
    if (!working) return;
    const game = working as unknown as Playground;
    const status = await run("preview", () => getVoiceStatus(gameVoiceLines(game, shipped)));
    setPreview(mergeGameAudio(shipped, status?.ready ?? {}));
  };

  const rounds = useMemo(() => (working?.rounds as JsonObject[] | undefined) ?? [], [working]);

  if (error && !data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</Card>
      </div>
    );
  }
  if (!data || !working) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasDraft = data.draft !== null;
  const title = (working.title as { en?: string; bn?: string } | undefined) ?? {};

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pb-32 pt-6 sm:px-6">
      <div className="space-y-3">
        <Link href="/dashboard/admin/english/games" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> All games
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title.en}</h1>
            <p className="text-sm text-muted-foreground">{title.bn}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Live: version {data.publishedVersion} · {when(data.publishedAt)}
              {data.publishedBy ? ` · ${data.publishedBy.name}` : " · from code"}
            </p>
            <p className="text-xs">
              {dirty ? (
                <span className="font-semibold text-amber-700 dark:text-amber-400">Unsaved changes</span>
              ) : hasDraft ? (
                <span className="font-semibold text-sky-700 dark:text-sky-400">
                  Draft saved {when(data.draftUpdatedAt)}
                  {data.draftUpdatedBy ? ` by ${data.draftUpdatedBy.name}` : ""}, not published yet
                </span>
              ) : (
                <span className="text-muted-foreground">No draft: you are editing a copy of the live version</span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => void openPreview()} disabled={busy !== null}>
              <Eye className="size-4" /> Preview
            </Button>
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setDialog({ type: "versions" })}>
              <History className="size-4" /> History
            </Button>
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => void openVoice()} disabled={busy !== null}>
              <Mic className="size-4" /> Make missing voice
            </Button>
          </div>
        </div>
      </div>

      {liveVoice ? <VoiceSummary status={liveVoice} /> : null}

      {error ? <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</Card> : null}
      {notice ? (
        <Card className="border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-800 dark:text-emerald-300">{notice}</Card>
      ) : null}

      <Card className="space-y-3 p-4">
        <p className="font-semibold text-foreground">Game texts</p>
        <ObjectFields value={working} kind={null} skip={GAME_FIELDS_HIDDEN} onChange={edit} />
      </Card>

      <div className="space-y-3">
        {rounds.map((round, i) => (
          <RoundSection
            key={`${String(round.id)}-${i}`}
            round={round}
            number={i + 1}
            onChange={(next) => edit({ ...working, rounds: rounds.map((r, j) => (j === i ? next : r)) as Json[] })}
          />
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-end gap-2 px-4 py-3 sm:px-6">
          {hasDraft ? (
            <Button type="button" variant="ghost" size="sm" className="mr-auto gap-1.5" onClick={() => void discard()} disabled={busy !== null}>
              <Undo2 className="size-4" /> Discard draft
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={() => void save()} disabled={!dirty || busy !== null} className="gap-2">
            {busy === "save" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save draft
          </Button>
          <Button type="button" onClick={() => void openPublish()} disabled={(!dirty && !hasDraft) || busy !== null} className="gap-2">
            {busy === "publish-check" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Publish
          </Button>
        </div>
      </div>

      {dialog?.type === "publish" ? (
        <PublishDialog
          version={data.publishedVersion + 1}
          status={dialog.status}
          busy={busy === "publish"}
          onPublish={(note) => void publish(note)}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog?.type === "voice" ? (
        <VoiceDialog status={dialog.status} busy={busy === "voice"} onConfirm={() => void makeVoice()} onClose={() => setDialog(null)} />
      ) : null}
      {dialog?.type === "versions" ? (
        <VersionsDialog gameKey={gameKey} current={data.publishedVersion} onRestore={(v) => void restore(v)} onClose={() => setDialog(null)} />
      ) : null}
      {preview ? (
        <GamePreview playground={working as unknown as Playground} audio={preview} onClose={() => setPreview(null)} />
      ) : null}
    </div>
  );
}
