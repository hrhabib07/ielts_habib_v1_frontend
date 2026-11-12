import apiClient from "@/src/lib/api-client";
import { BROWSER_API_PROXY_BASE } from "@/src/lib/api-base-url";
import { getAccessToken } from "@/src/lib/auth";

export type AnswerOutcome = "correct" | "wrong" | "revealed";

export type AnswerEvent = {
  gameKey: string;
  roundId: string;
  itemId: string;
  outcome: AnswerOutcome;
  attempt: number;
  ms: number;
  review: boolean;
  picked?: string | null;
  at: number;
};

const PATH = "/learning/answers";
const BATCH = 50;
const FLUSH_AT = 10;
const FLUSH_AFTER_MS = 8_000;
const MAX_QUEUE = 300;

const sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
let queue: AnswerEvent[] = [];
let timer: number | null = null;
let sending = false;
let listening = false;

function schedule(): void {
  if (timer !== null) return;
  timer = window.setTimeout(() => {
    timer = null;
    void flushAnswers();
  }, FLUSH_AFTER_MS);
}

/** Sends queued answers. Failed batches go back to the queue and retry with the next flush. */
export async function flushAnswers(): Promise<void> {
  if (sending || queue.length === 0) return;
  sending = true;
  const batch = queue.slice(0, BATCH);
  queue = queue.slice(BATCH);
  try {
    await apiClient.post(PATH, { sessionId, events: batch });
  } catch {
    queue = [...batch, ...queue].slice(-MAX_QUEUE);
  } finally {
    sending = false;
  }
  if (queue.length >= FLUSH_AT) void flushAnswers();
  else if (queue.length) schedule();
}

/** Last chance when the tab is hidden or closed: keepalive survives the page going away. */
function flushOnLeave(): void {
  const token = getAccessToken();
  if (!token || queue.length === 0) return;
  const batch = queue.slice(0, BATCH);
  queue = queue.slice(BATCH);
  void fetch(`${BROWSER_API_PROXY_BASE}${PATH}`, {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ sessionId, events: batch }),
  }).catch(() => {
    queue = [...batch, ...queue].slice(-MAX_QUEUE);
  });
}

function listen(): void {
  if (listening) return;
  listening = true;
  window.addEventListener("pagehide", flushOnLeave);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushOnLeave();
  });
}

export function trackAnswer(event: AnswerEvent): void {
  if (typeof window === "undefined" || !getAccessToken()) return;
  listen();
  queue = [...queue, event].slice(-MAX_QUEUE);
  if (queue.length >= FLUSH_AT) void flushAnswers();
  else schedule();
}
