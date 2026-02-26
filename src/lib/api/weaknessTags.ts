import apiClient from "../api-client";

const BASE = "/weakness-tags";

export type WeaknessTagCategory =
  | "VOCABULARY"
  | "LOGIC_TRAP"
  | "QUESTION_MISREAD"
  | "INFERENCE"
  | "NOT_GIVEN_CONFUSION"
  | "TIME_PRESSURE";

export type WeaknessTagStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface WeaknessTagFull {
  _id: string;
  name: string;
  category: WeaknessTagCategory;
  description: string;
  isActive: boolean;
  /** ObjectId string of the creator */
  createdBy?: string;
  /** Moderation status – may be absent on legacy docs (treat as APPROVED) */
  status?: WeaknessTagStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWeaknessTagPayload {
  name: string;
  category: WeaknessTagCategory;
  description: string;
  isActive?: boolean;
}

export interface UpdateWeaknessTagPayload {
  name?: string;
  category?: WeaknessTagCategory;
  description?: string;
  isActive?: boolean;
}

// ── READ ─────────────────────────────────────────────────────────────────────

/** Admin: list ALL tags (all statuses, all creators). */
export async function getAllWeaknessTags(): Promise<WeaknessTagFull[]> {
  const res = await apiClient.get<{ success: boolean; data: WeaknessTagFull[] }>(BASE);
  return res.data?.data ?? [];
}

/** Public / student-facing: APPROVED + active tags only. */
export async function getActiveWeaknessTags(): Promise<WeaknessTagFull[]> {
  const res = await apiClient.get<{ success: boolean; data: WeaknessTagFull[] }>(
    `${BASE}/active`,
  );
  return res.data?.data ?? [];
}

/** Instructor / Admin: own tags (all statuses). */
export async function getMyWeaknessTags(): Promise<WeaknessTagFull[]> {
  const res = await apiClient.get<{ success: boolean; data: WeaknessTagFull[] }>(
    `${BASE}/my`,
  );
  return res.data?.data ?? [];
}

// ── WRITE ─────────────────────────────────────────────────────────────────────

/**
 * Create a weakness tag.
 * - ADMIN  → approved immediately.
 * - INSTRUCTOR → enters PENDING state for admin review.
 */
export async function createWeaknessTag(
  payload: CreateWeaknessTagPayload,
): Promise<WeaknessTagFull> {
  const res = await apiClient.post<{ success: boolean; data: WeaknessTagFull }>(
    BASE,
    payload,
  );
  return res.data.data;
}

/** Update a tag (INSTRUCTOR can only update their own). */
export async function updateWeaknessTag(
  id: string,
  payload: UpdateWeaknessTagPayload,
): Promise<WeaknessTagFull> {
  const res = await apiClient.patch<{ success: boolean; data: WeaknessTagFull }>(
    `${BASE}/${id}`,
    payload,
  );
  return res.data.data;
}

// ── ADMIN MODERATION ──────────────────────────────────────────────────────────

/** Admin: approve a PENDING tag. */
export async function approveWeaknessTag(id: string): Promise<WeaknessTagFull> {
  const res = await apiClient.patch<{ success: boolean; data: WeaknessTagFull }>(
    `${BASE}/${id}/approve`,
    {},
  );
  return res.data.data;
}

/** Admin: reject a PENDING tag. */
export async function rejectWeaknessTag(id: string): Promise<WeaknessTagFull> {
  const res = await apiClient.patch<{ success: boolean; data: WeaknessTagFull }>(
    `${BASE}/${id}/reject`,
    {},
  );
  return res.data.data;
}

// ── CONSTANTS ──────────────────────────────────────────────────────────────────

export const WEAKNESS_TAG_CATEGORIES: { value: WeaknessTagCategory; label: string }[] = [
  { value: "VOCABULARY", label: "Vocabulary" },
  { value: "LOGIC_TRAP", label: "Logic Trap" },
  { value: "QUESTION_MISREAD", label: "Question Misread" },
  { value: "INFERENCE", label: "Inference" },
  { value: "NOT_GIVEN_CONFUSION", label: "Not Given Confusion" },
  { value: "TIME_PRESSURE", label: "Time Pressure" },
];
