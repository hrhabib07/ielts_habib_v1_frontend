import type { ChatMissionState } from "@/src/lib/api/chatMission";

const STORAGE_KEY = "gamlish-chat-mission-v1";

type Entry = { userId: string; state: ChatMissionState };

let memory: Entry | null = null;

/**
 * Last known mission state for this account, so /player and the mission pages render instantly
 * while a fresh copy loads. Keyed by user id, so another account on the device never sees it.
 */
export function readMissionState(userId: string): ChatMissionState | null {
  if (memory?.userId === userId) return memory.state;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry;
    if (entry.userId !== userId || typeof entry.state?.enabled !== "boolean") return null;
    memory = entry;
    return entry.state;
  } catch {
    return null;
  }
}

export function writeMissionState(userId: string, state: ChatMissionState): void {
  memory = { userId, state };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    // Storage full or blocked: the in-memory copy still serves this tab.
  }
}
