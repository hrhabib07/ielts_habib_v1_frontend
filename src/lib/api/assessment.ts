import apiClient from "../api-client";

const BASE = "/assessment";

export type UnlockConditionType = "none" | "module_passed";

export interface UnlockCondition {
  type: UnlockConditionType;
  moduleId?: string;
}

export type LevelType =
  | "activation"
  | "vocabulary"
  | "skill"
  | "passage"
  | "combined";

export interface EvaluationConfig {
  maxAttempts: number;
  miniTestsPerSet?: number;
  strictMode?: boolean;
}

export interface AssessmentModule {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  order: number;
  unlockCondition: UnlockCondition;
  levelType?: LevelType;
  passingScore?: number;
  evaluationConfig?: EvaluationConfig;
  isFree: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type AssessmentType = "activation" | "checkpoint" | "evaluation";

export interface Assessment {
  _id: string;
  title: string;
  slug: string;
  type: AssessmentType;
  passingScore: number;
  totalMarks: number;
  moduleId: string;
  isActive: boolean;
  durationMinutes?: number;
  negativeMarkingRatio?: number;
  maxAttempts?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export type QuestionType = "mcq" | "true_false" | "short_answer";

export interface McqOption {
  key: string;
  text: string;
}

export interface AssessmentQuestion {
  _id: string;
  assessmentId: string;
  type: QuestionType;
  title: string;
  options?: McqOption[];
  correctAnswer: string | boolean;
  marks: number;
  order: number;
  negativeMarks?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateModulePayload {
  title: string;
  slug: string;
  description?: string;
  order: number;
  unlockCondition: UnlockCondition;
  levelType?: LevelType;
  passingScore?: number;
  evaluationConfig?: EvaluationConfig;
  isFree: boolean;
}

export interface UpdateModulePayload {
  title?: string;
  slug?: string;
  description?: string;
  order?: number;
  unlockCondition?: UnlockCondition;
  levelType?: LevelType;
  passingScore?: number;
  evaluationConfig?: EvaluationConfig;
  isFree?: boolean;
  isActive?: boolean;
}

export interface CreateAssessmentPayload {
  title: string;
  slug: string;
  type: AssessmentType;
  passingScore: number;
  totalMarks: number;
  moduleId: string;
  durationMinutes?: number;
  negativeMarkingRatio?: number;
  maxAttempts?: number | null;
}

export interface UpdateAssessmentPayload {
  title?: string;
  slug?: string;
  type?: AssessmentType;
  passingScore?: number;
  totalMarks?: number;
  durationMinutes?: number;
  negativeMarkingRatio?: number;
  maxAttempts?: number | null;
  isActive?: boolean;
}

export interface CreateQuestionPayload {
  assessmentId: string;
  type: QuestionType;
  title: string;
  options?: McqOption[];
  correctAnswer: string | boolean;
  marks: number;
  order: number;
  negativeMarks?: number;
}

export interface UpdateQuestionPayload {
  type?: QuestionType;
  title?: string;
  options?: McqOption[];
  correctAnswer?: string | boolean;
  marks?: number;
  order?: number;
  negativeMarks?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function listModules(): Promise<AssessmentModule[]> {
  const res = await apiClient.get<ApiResponse<AssessmentModule[]>>(`${BASE}/modules`);
  return res.data.data;
}

export async function getModuleById(id: string): Promise<AssessmentModule> {
  const res = await apiClient.get<ApiResponse<AssessmentModule>>(`${BASE}/modules/${id}`);
  return res.data.data;
}

export async function updateModule(id: string, payload: UpdateModulePayload): Promise<AssessmentModule> {
  const res = await apiClient.patch<ApiResponse<AssessmentModule>>(`${BASE}/modules/${id}`, payload);
  return res.data.data;
}

export async function createModule(payload: CreateModulePayload): Promise<AssessmentModule> {
  const res = await apiClient.post<ApiResponse<AssessmentModule>>(`${BASE}/modules`, payload);
  return res.data.data;
}

export async function getAssessmentByModuleId(moduleId: string): Promise<Assessment | null> {
  const res = await apiClient.get<ApiResponse<Assessment | null>>(
    `${BASE}/modules/${moduleId}/assessment`,
  );
  return res.data.data;
}

export async function getAssessmentById(id: string): Promise<Assessment> {
  const res = await apiClient.get<ApiResponse<Assessment>>(`${BASE}/assessments/${id}`);
  return res.data.data;
}

export async function createAssessment(payload: CreateAssessmentPayload): Promise<Assessment> {
  const res = await apiClient.post<ApiResponse<Assessment>>(`${BASE}/assessments`, payload);
  return res.data.data;
}

export async function updateAssessment(
  id: string,
  payload: UpdateAssessmentPayload,
): Promise<Assessment> {
  const res = await apiClient.patch<ApiResponse<Assessment>>(`${BASE}/assessments/${id}`, payload);
  return res.data.data;
}

export async function getQuestionsByAssessmentId(assessmentId: string): Promise<AssessmentQuestion[]> {
  const res = await apiClient.get<ApiResponse<AssessmentQuestion[]>>(`${BASE}/questions`, {
    params: { assessmentId },
  });
  return res.data.data;
}

export async function createQuestion(payload: CreateQuestionPayload): Promise<AssessmentQuestion> {
  const res = await apiClient.post<ApiResponse<AssessmentQuestion>>(`${BASE}/questions`, payload);
  return res.data.data;
}

export async function updateQuestion(
  id: string,
  payload: UpdateQuestionPayload,
): Promise<AssessmentQuestion> {
  const res = await apiClient.patch<ApiResponse<AssessmentQuestion>>(`${BASE}/questions/${id}`, payload);
  return res.data.data;
}

export async function deleteQuestion(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/questions/${id}`);
}
