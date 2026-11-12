import apiClient from "../api-client";
import { BROWSER_API_PROXY_BASE } from "../api-base-url";
import type { ApiResponse } from "./types";
import type { Playground } from "@/src/features/playground/types";

const BASE = "/game-content";
const ADMIN = "/admin/game-content";

export type SpokenLine = { key: string; lang: "en" | "bn"; spoken: string };

export type PublishedGame = {
  game: Playground;
  version: number;
  /** Clip key to recorded file key, only for clips that are ready. */
  clipFiles: Record<string, string>;
};

export type AdminPerson = { id: string; name: string } | null;

export type AdminGameSummary = {
  gameKey: string;
  levelKey: string;
  title: { en: string; bn: string };
  rounds: number;
  questions: number;
  publishedVersion: number;
  publishedAt: string;
  hasDraft: boolean;
  draftUpdatedAt: string | null;
};

export type AdminGame = {
  gameKey: string;
  levelKey: string;
  published: Playground;
  publishedVersion: number;
  publishedAt: string;
  publishedBy: AdminPerson;
  draft: Playground | null;
  draftUpdatedAt: string | null;
  draftUpdatedBy: AdminPerson;
};

export type GameVersion = { version: number; note: string; publishedBy: AdminPerson; publishedAt: string };

export type VoiceStatus = {
  configured: boolean;
  total: number;
  ready: Record<string, string>;
  pending: number;
  failed: number;
  missing: number;
  missingCharacters: number;
};

/** Recorded clips are immutable (keyed by a hash of voice + text), so the browser caches them forever. */
export function voiceClipSrc(fileKey: string): string {
  return `${BROWSER_API_PROXY_BASE}/voice/clips/${fileKey}`;
}

export async function getPublishedGame(gameKey: string, signal?: AbortSignal): Promise<PublishedGame> {
  const res = await apiClient.get<ApiResponse<PublishedGame>>(`${BASE}/games/${gameKey}`, { signal, timeout: 4000 });
  if (!res.data?.data?.game) throw new Error("Game not found");
  return res.data.data;
}

export async function listAdminGames(): Promise<AdminGameSummary[]> {
  const res = await apiClient.get<ApiResponse<AdminGameSummary[]>>(`${ADMIN}/games`);
  return res.data.data;
}

export async function getAdminGame(gameKey: string): Promise<AdminGame> {
  const res = await apiClient.get<ApiResponse<AdminGame>>(`${ADMIN}/games/${gameKey}`);
  if (!res.data?.data) throw new Error("Failed to load game");
  return res.data.data;
}

export async function saveGameDraft(gameKey: string, game: Playground): Promise<AdminGame> {
  const res = await apiClient.put<ApiResponse<AdminGame>>(`${ADMIN}/games/${gameKey}/draft`, { game });
  return res.data.data;
}

export async function discardGameDraft(gameKey: string): Promise<AdminGame> {
  const res = await apiClient.delete<ApiResponse<AdminGame>>(`${ADMIN}/games/${gameKey}/draft`);
  return res.data.data;
}

export async function publishGame(
  gameKey: string,
  note: string,
  lines: SpokenLine[],
): Promise<{ game: AdminGame; queued: number }> {
  const res = await apiClient.post<ApiResponse<{ game: AdminGame; queued: number }>>(
    `${ADMIN}/games/${gameKey}/publish`,
    { note, lines },
  );
  return res.data.data;
}

export async function makeGameVoice(gameKey: string, lines: SpokenLine[]): Promise<{ queued: number }> {
  const res = await apiClient.post<ApiResponse<{ queued: number }>>(`${ADMIN}/games/${gameKey}/voice`, { lines });
  return res.data.data;
}

export async function getVoiceStatus(lines: SpokenLine[]): Promise<VoiceStatus> {
  const res = await apiClient.post<ApiResponse<VoiceStatus>>(`${ADMIN}/voice/status`, { lines });
  return res.data.data;
}

export async function listGameVersions(gameKey: string): Promise<GameVersion[]> {
  const res = await apiClient.get<ApiResponse<GameVersion[]>>(`${ADMIN}/games/${gameKey}/versions`);
  return res.data.data;
}

export async function restoreGameVersion(gameKey: string, version: number): Promise<AdminGame> {
  const res = await apiClient.post<ApiResponse<AdminGame>>(`${ADMIN}/games/${gameKey}/versions/${version}/restore`);
  return res.data.data;
}
