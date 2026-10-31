"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getMissionOneStops,
  sendMissionOneCallback,
  type CallbackSendResult,
  type MissionOneLearner,
  type MissionOneStops,
} from "@/src/lib/api/weeklyDecision";

const DEFAULT_MESSAGE =
  "{name}, you stopped on Mission 1 at {stage}. The question was: {question}. Come back to Gamlish and finish it.";

function contactLine(learner: MissionOneLearner): string {
  if (learner.primary === "phone" && learner.phone) return learner.phone;
  if (learner.primary === "email" && learner.email) return learner.email;
  return "No phone or email";
}

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "Asia/Dhaka",
      numberingSystem: "latn",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export function MissionOneStopsPanel() {
  const [data, setData] = useState<MissionOneStops | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [channel, setChannel] = useState<"sms" | "email">("sms");
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [confirmSend, setConfirmSend] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<CallbackSendResult | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getMissionOneStops());
    } catch {
      setError("Could not load where people stop in Mission 1.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const learners = useMemo(
    () => data?.groups.flatMap((group) => group.learners) ?? [],
    [data],
  );

  function toggle(userId: string) {
    setSelected((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );
  }

  function toggleGroup(ids: string[], on: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return [...next];
    });
  }

  async function onSend() {
    if (!confirmSend || selected.length === 0) return;
    const reachable = selected.filter((id) => {
      const learner = learners.find((item) => item.userId === id);
      if (!learner) return false;
      return channel === "sms" ? Boolean(learner.phone) : Boolean(learner.email);
    });
    if (reachable.length === 0) {
      setSendError(channel === "sms" ? "None of the selected people have a phone." : "None of the selected people have an email.");
      return;
    }
    const ok = window.confirm(
      channel === "sms"
        ? `Send SMS to ${reachable.length} people? This costs money.`
        : `Send email to ${reachable.length} people?`,
    );
    if (!ok) return;
    setSending(true);
    setSendError(null);
    setResult(null);
    try {
      const sent = await sendMissionOneCallback({
        userIds: reachable.slice(0, 15),
        channel,
        message: message.trim(),
      });
      setResult(sent);
      setSelected([]);
      setConfirmSend(false);
      await load();
    } catch {
      setSendError("Could not send. Check the message length and try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Where they stop in Mission 1</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each group is one stage and one question. Phone is the primary contact. Email is used when there is no phone. {`{name}`}, {`{stage}`}, and {`{question}`} change for each person.
        </p>
      </div>

      {error ? <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</Card> : null}
      {loading && !data ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : null}

      {data && data.groups.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">
          Nobody is stopped inside Mission 1 right now.
        </Card>
      ) : null}

      {data?.groups.map((group) => {
        const ids = group.learners.filter((learner) => learner.primary !== "none").map((learner) => learner.userId);
        const allOn = ids.length > 0 && ids.every((id) => selected.includes(id));
        return (
          <Card key={`${group.stageOrder}-${group.questionLabel}`} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Stage {group.stageOrder} · {group.stageTitle}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">{group.questionLabel}</p>
                <p className="mt-1 text-xs text-muted-foreground">{group.learners.length} stopped here</p>
              </div>
              {ids.length > 0 ? (
                <Button type="button" size="sm" variant="outline" onClick={() => toggleGroup(ids, !allOn)}>
                  {allOn ? "Clear group" : "Select group"}
                </Button>
              ) : null}
            </div>
            <ul className="mt-3 divide-y divide-border">
              {group.learners.map((learner) => (
                <li key={learner.userId} className="flex items-start gap-3 py-2">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={selected.includes(learner.userId)}
                    disabled={learner.primary === "none"}
                    onChange={() => toggle(learner.userId)}
                    aria-label={`Select ${learner.name}`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{learner.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {contactLine(learner)}
                      {" · "}
                      {learner.idleDays} day{learner.idleDays === 1 ? "" : "s"} idle
                      {learner.lastCallbackAt ? ` · last message ${formatWhen(learner.lastCallbackAt)}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}

      {data && data.groups.length > 0 ? (
        <Card className="space-y-3 p-4">
          <p className="text-sm font-semibold text-foreground">Call them back</p>
          <div className="flex gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="callback-channel" checked={channel === "sms"} onChange={() => setChannel("sms")} />
              SMS to phone
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="callback-channel" checked={channel === "email"} onChange={() => setChannel("email")} />
              Email
            </label>
          </div>
          <label className="block text-xs font-medium text-muted-foreground" htmlFor="callback-message">
            Message ({message.trim().length}/320)
          </label>
          <textarea
            id="callback-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            maxLength={320}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          <label className="flex items-start gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              className="mt-1"
              checked={confirmSend}
              onChange={(event) => setConfirmSend(event.target.checked)}
            />
            <span>
              {channel === "sms"
                ? "I know each SMS costs money. Send only to the people I selected who have a phone."
                : "Send this email only to the people I selected who have an email."}
            </span>
          </label>
          <p className="text-xs text-muted-foreground">
            {selected.length} selected. At most 15 go out in one send.
          </p>
          {sendError ? <p className="text-xs text-destructive">{sendError}</p> : null}
          {result ? (
            <p className="text-sm text-foreground">
              Sent {result.sent.length}. Skipped {result.skipped.length}. Failed {result.failed.length}.
              {result.failed[0] ? ` ${result.failed[0].reason}` : ""}
            </p>
          ) : null}
          <Button
            type="button"
            size="sm"
            disabled={sending || !confirmSend || selected.length === 0 || message.trim().length < 12}
            onClick={() => void onSend()}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send callback"}
          </Button>
        </Card>
      ) : null}
    </section>
  );
}
