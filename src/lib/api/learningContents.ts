import apiClient from "../api-client";

const BASE = "/learning-contents";

export type LearningContentType =
  | "INTRO"
  | "NOTE"
  | "STRATEGY"
  | "VIDEO"
  | "ANALYTICS";

export interface LearningContent {
  _id: string;
  /** Instructor-only tag e.g. INTRO-1, NOTE-2. Not shown to students. */
  contentCode?: string;
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

/** Shape returned by content preview API (no createdBy/updatedBy). */
export interface LearningContentPreview extends Pick<
  LearningContent,
  "_id" | "contentCode" | "title" | "type" | "body" | "videoUrl" | "isPublished" | "createdAt" | "updatedAt"
> {}

export interface CreateLearningContentPayload {
  /** Level and content number e.g. L1C1 (unique, required). */
  contentCode: string;
  title: string;
  type: LearningContentType;
  body?: string;
  videoUrl?: string;
  metadata?: Record<string, unknown>;
  isPublished?: boolean;
}

export interface UpdateLearningContentPayload {
  /** Level and content number e.g. L1C1 (unique). */
  contentCode?: string;
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
  { value: "STRATEGY", label: "Strategy" },
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

/** Get content preview (ADMIN/INSTRUCTOR; allows draft). Uses admin API. */
export async function getContentPreview(
  id: string,
): Promise<LearningContentPreview> {
  const res = await apiClient.get<{
    success: boolean;
    message?: string;
    data: LearningContentPreview;
  }>(`/admin/contents/${id}/preview`);
  return res.data.data;
}
