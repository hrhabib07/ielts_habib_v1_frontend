import apiClient from "../api-client";

const BASE = "/learning-contents";

export type LearningContentType = "INTRO" | "NOTE" | "VIDEO" | "ANALYTICS";

export interface LearningContent {
  _id: string;
  title: string;
  type: LearningContentType;
  body?: string;
  videoUrl?: string;
  metadata?: Record<string, unknown>;
  createdBy?: string;
  updatedBy?: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLearningContentPayload {
  title: string;
  type: LearningContentType;
  body?: string;
  videoUrl?: string;
  metadata?: Record<string, unknown>;
  isPublished?: boolean;
}

export interface UpdateLearningContentPayload {
  title?: string;
  type?: LearningContentType;
  body?: string;
  videoUrl?: string;
  metadata?: Record<string, unknown>;
  isPublished?: boolean;
}

export const LEARNING_CONTENT_TYPES: { value: LearningContentType; label: string }[] = [
  { value: "INTRO", label: "Intro" },
  { value: "NOTE", label: "Note" },
  { value: "VIDEO", label: "Video" },
  { value: "ANALYTICS", label: "Analytics" },
];

/** List content (ADMIN: all, INSTRUCTOR: own). Optional ?type=INTRO|NOTE|VIDEO|ANALYTICS */
export async function listLearningContents(params?: {
  type?: LearningContentType;
}): Promise<LearningContent[]> {
  const url = params?.type ? `${BASE}?type=${params.type}` : BASE;
  const res = await apiClient.get<{ success: boolean; data: LearningContent[] }>(url);
  return res.data?.data ?? [];
}

/** Get one by id */
export async function getLearningContentById(id: string): Promise<LearningContent> {
  const res = await apiClient.get<{ success: boolean; data: LearningContent }>(
    `${BASE}/${id}`,
  );
  return res.data.data;
}

/** Create content */
export async function createLearningContent(
  payload: CreateLearningContentPayload,
): Promise<LearningContent> {
  const res = await apiClient.post<{ success: boolean; data: LearningContent }>(
    BASE,
    payload,
  );
  return res.data.data;
}

/** Update content */
export async function updateLearningContent(
  id: string,
  payload: UpdateLearningContentPayload,
): Promise<LearningContent> {
  const res = await apiClient.patch<{ success: boolean; data: LearningContent }>(
    `${BASE}/${id}`,
    payload,
  );
  return res.data.data;
}

/** Delete content */
export async function deleteLearningContent(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}
