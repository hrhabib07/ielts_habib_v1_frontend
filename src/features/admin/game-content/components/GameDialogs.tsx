"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { History, Loader2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { StepAudio } from "@/src/features/chat-lesson/hooks/useLessonSpeech";
import { useLearner } from "@/src/features/learner/LearnerContext";
import { personalizeDeep } from "@/src/features/learner/lib/personalize";
import { PlaygroundPlayer } from "@/src/features/playground/components/PlaygroundPlayer";
import type { Playground } from "@/src/features/playground/types";
import { listGameVersions, type GameVersion, type VoiceStatus } from "@/src/lib/api/gameContent";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" role="dialog" aria-modal="true">
      <Card className="max-h-[85dvh] w-full max-w-lg overflow-y-auto p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
}

export function VoiceSummary({ status }: { status: VoiceStatus }) {
  const ready = Object.keys(status.ready).length;
  return (
    <div className="space-y-1 rounded-md border border-border bg-muted/30 p-3 text-sm">
      <p>
        <span className="font-semibold">{ready}</span> of {status.total} voice lines are ready
        {status.pending ? `, ${status.pending} being made now` : ""}
        {status.failed ? `, ${status.failed} failed` : ""}.
      </p>
      {status.missing ? (
        <p>
          <span className="font-semibold">{status.missing}</span> new lines will get a voice (about{" "}
          {status.missingCharacters.toLocaleString()} characters, made once and saved).
        </p>
      ) : (
        <p className="text-muted-foreground">No new voice is needed.</p>
      )}
      {!status.configured ? (
        <p className="text-destructive">
          The server has no Azure Speech key yet, so new lines stay silent until AZURE_SPEECH_KEY and
          AZURE_SPEECH_REGION are added.
        </p>
      ) : null}
    </div>
  );
}

export function PublishDialog({
  version,
  status,
  busy,
  onPublish,
  onClose,
}: {
  version: number;
  status: VoiceStatus;
  busy: boolean;
  onPublish: (note: string) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  return (
    <Modal title={`Publish version ${version}`} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Learners get this version the next time they open the game (within about a minute). The current version
          stays in the history, so you can restore it.
        </p>
        <VoiceSummary status={status} />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">What changed (optional)</p>
          <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Fixed Bangla in Round 2" />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" onClick={() => onPublish(note)} disabled={busy} className="gap-2">
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            Publish now
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function VoiceDialog({
  status,
  busy,
  onConfirm,
  onClose,
}: {
  status: VoiceStatus;
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title="Make missing voice" onClose={onClose}>
      <div className="space-y-4">
        <VoiceSummary status={status} />
        <p className="text-sm text-muted-foreground">
          Voice is made in the background, about 18 lines a minute. You can leave this page.
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} disabled={busy || status.missing + status.failed === 0} className="gap-2">
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            Make voice
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function VersionsDialog({
  gameKey,
  current,
  onRestore,
  onClose,
}: {
  gameKey: string;
  current: number;
  onRestore: (version: number) => void;
  onClose: () => void;
}) {
  const [versions, setVersions] = useState<GameVersion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listGameVersions(gameKey)
      .then(setVersions)
      .catch(() => setError("Could not load the history."));
  }, [gameKey]);

  return (
    <Modal title="Version history" onClose={onClose}>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!versions && !error ? <Loader2 className="size-5 animate-spin text-muted-foreground" /> : null}
      <ul className="space-y-2">
        {versions?.map((v) => (
          <li key={v.version} className="flex items-start justify-between gap-3 rounded-md border border-border p-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <History className="size-3.5" /> Version {v.version}
                {v.version === current ? <span className="text-xs font-normal text-emerald-700"> · live now</span> : null}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(v.publishedAt).toLocaleString()} · {v.publishedBy?.name ?? "From code"}
              </p>
              {v.note ? <p className="mt-1 text-sm">{v.note}</p> : null}
            </div>
            {v.version !== current ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={() => {
                  if (window.confirm(`Load version ${v.version} into the draft? Your unsaved changes will be lost.`)) {
                    onRestore(v.version);
                  }
                }}
              >
                <RotateCcw className="size-3.5" /> Restore
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </Modal>
  );
}

/** The real game player with the working copy, so admins test exactly what learners will get. */
export function GamePreview({ playground, audio, onClose }: { playground: Playground; audio: StepAudio; onClose: () => void }) {
  const learner = useLearner();
  const personalized = useMemo(() => personalizeDeep(playground, learner), [playground, learner]);
  return (
    <div className="fixed inset-0 z-[60]">
      <PlaygroundPlayer playground={personalized} audio={audio} />
      <button
        type="button"
        onClick={onClose}
        className="fixed right-3 bottom-24 z-[70] flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-lg"
      >
        <X className="size-4" /> Close preview
      </button>
    </div>
  );
}
