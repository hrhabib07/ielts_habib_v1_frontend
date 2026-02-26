import apiClient from "../api-client";
import type { Passage, QuestionSet, PassageQuestionSet } from "./instructor";

const ADMIN_BASE = "/admin";
const PASSAGE_BASE = "/reading/passage";
const QUESTION_BASE = "/reading/question";
const QUESTION_SET_BASE = "/reading/questionSet";
const PASSAGE_QSET_BASE = "/reading/passageQSet";

/* Admin list all content (published and unpublished) */
export interface AdminPassage {
  _id: string;
  title: string;
  difficulty: string;
  moduleType: string;
  isPublished?: boolean;
  isArchived?: boolean;
  createdAt?: string;
}

export interface AdminQuestionSet {
  _id: string;
  passageId: string | { _id: string };
  instruction: string;
  startQuestionNumber: number;
  endQuestionNumber: number;
  questionType: string;
  isPublished?: boolean;
  createdAt?: string;
}

export interface AdminQuestion {
  _id: string;
  passageId: string | { _id: string };
  questionSetId: string | { _id: string };
  questionNumber: number;
  type: string;
  difficulty: string;
  isPublished?: boolean;
  createdAt?: string;
}

export interface AdminPassageQuestionSet {
  _id: string;
  passageId: string | { _id: string };
  passageCode: string | { _id: string };
  passageNumber: number;
  totalQuestions: number;
  recommendedTime: number;
  isPublished?: boolean;
  createdAt?: string;
}

export async function listAdminPassages(): Promise<AdminPassage[]> {
  const res = await apiClient.get<{ success: boolean; data: AdminPassage[] }>(
    `${ADMIN_BASE}/content/passages`,
  );
  return res.data?.data ?? [];
}

export async function listAdminQuestionSets(): Promise<AdminQuestionSet[]> {
  const res = await apiClient.get<{
    success: boolean;
    data: AdminQuestionSet[];
  }>(`${ADMIN_BASE}/content/question-sets`);
  return res.data?.data ?? [];
}

export async function listAdminQuestions(): Promise<AdminQuestion[]> {
  const res = await apiClient.get<{
    success: boolean;
    data: AdminQuestion[];
  }>(`${ADMIN_BASE}/content/questions`);
  return res.data?.data ?? [];
}

export async function listAdminPassageQuestionSets(): Promise<
  AdminPassageQuestionSet[]
> {
  const res = await apiClient.get<{
    success: boolean;
    data: AdminPassageQuestionSet[];
  }>(`${ADMIN_BASE}/content/passage-question-sets`);
  return res.data?.data ?? [];
}

/* Admin publish/archive actions */

export async function publishPassage(id: string): Promise<Passage> {
  const res = await apiClient.patch<{ success: boolean; data: Passage }>(
    `${PASSAGE_BASE}/${id}/publish`,
  );
  return res.data.data;
}

export async function unpublishPassage(id: string): Promise<Passage> {
  const res = await apiClient.patch<{ success: boolean; data: Passage }>(
    `${PASSAGE_BASE}/${id}/unpublish`,
  );
  return res.data.data;
}

export async function archivePassage(id: string): Promise<Passage> {
  const res = await apiClient.patch<{ success: boolean; data: Passage }>(
    `${PASSAGE_BASE}/${id}/archive`,
  );
  return res.data.data;
}

export async function restorePassage(id: string): Promise<Passage> {
  const res = await apiClient.patch<{ success: boolean; data: Passage }>(
    `${PASSAGE_BASE}/${id}/restore`,
  );
  return res.data.data;
}

export async function publishQuestion(id: string): Promise<unknown> {
  const res = await apiClient.patch<{ success: boolean; data: unknown }>(
    `${QUESTION_BASE}/${id}/publish`,
  );
  return res.data.data;
}

export async function unpublishQuestion(id: string): Promise<unknown> {
  const res = await apiClient.patch<{ success: boolean; data: unknown }>(
    `${QUESTION_BASE}/${id}/unpublish`,
  );
  return res.data.data;
}

export async function publishQuestionSet(id: string): Promise<QuestionSet> {
  const res = await apiClient.patch<{ success: boolean; data: QuestionSet }>(
    `${QUESTION_SET_BASE}/${id}/publish`,
  );
  return res.data.data;
}

export async function unpublishQuestionSet(id: string): Promise<QuestionSet> {
  const res = await apiClient.patch<{ success: boolean; data: QuestionSet }>(
    `${QUESTION_SET_BASE}/${id}/unpublish`,
  );
  return res.data.data;
}

export async function publishPassageQuestionSet(
  questionSetId: string,
): Promise<PassageQuestionSet> {
  const res = await apiClient.patch<{
    success: boolean;
    data: PassageQuestionSet;
  }>(`${PASSAGE_QSET_BASE}/publish/${questionSetId}`);
  return res.data.data;
}

export async function unpublishPassageQuestionSet(
  questionSetId: string,
): Promise<PassageQuestionSet> {
  const res = await apiClient.patch<{
    success: boolean;
    data: PassageQuestionSet;
  }>(`${PASSAGE_QSET_BASE}/unpublish/${questionSetId}`);
  return res.data.data;
}
