import apiClient from "../api-client";

const PASSAGE_BASE = "/reading/passage";
const QUESTION_BASE = "/reading/question";
const WEAKNESS_TAGS_BASE = "/weakness-tags";
const QUESTION_SET_BASE = "/reading/questionSet";
const PASSAGE_QSET_BASE = "/reading/passageQSet";
const PASSAGE_CODE_BASE = "/passage-codes";

/* ----- Passage Codes (Passage Info) ----- */
export interface PassageCode {
  _id: string;
  book: string;
  test: string;
  passage: string;
  source: string;
  createdAt?: string;
}

export async function createPassageCode(data: {
  book: string;
  test: string;
  passage: string;
  source: string;
}): Promise<PassageCode> {
  const res = await apiClient.post<{ success: boolean; data: PassageCode }>(
    PASSAGE_CODE_BASE,
    data,
  );
  return res.data.data;
}

export async function listPassageCodes(): Promise<PassageCode[]> {
  const res = await apiClient.get<{ success: boolean; data: PassageCode[] }>(
    PASSAGE_CODE_BASE,
  );
  return res.data?.data ?? [];
}

/* ----- Passages ----- */

/** Shape returned by the API — paragraphLabel is always present (server-generated). */
export interface PassageParagraph {
  paragraphIndex: number;
  paragraphLabel: string;
  text: string;
}

/** Shape sent to the API when creating or updating a passage.
 *  paragraphLabel is intentionally omitted — the server generates it. */
export interface PassageParagraphInput {
  paragraphIndex: number;
  text: string;
}

export interface PassageImage {
  url: string;
  caption?: string;
  order: number;
}

export interface PassageGlossary {
  term: string;
  definition: string;
  order: number;
}

export type PassageSource = "CAMBRIDGE" | "IELTS_HABIB";
export type PassageDifficulty = "EASY" | "MEDIUM" | "HARD";
export type PassageModuleType = "ACADEMIC" | "GENERAL_TRAINING";

export interface Passage {
  _id: string;
  title: string;
  subTitle?: string;
  passageCode: string | { _id: string };
  content: PassageParagraph[];
  images?: PassageImage[];
  glossary?: PassageGlossary[];
  source: PassageSource;
  difficulty: PassageDifficulty;
  moduleType: PassageModuleType;
  estimatedReadingTime: number;
  videoExplanationUrl?: string;
  tags?: string[];
  isPublished?: boolean;
  isArchived?: boolean;
  createdBy?: string;
}

export interface CreatePassagePayload {
  title: string;
  subTitle?: string;
  passageCode: string;
  content: PassageParagraphInput[];
  images?: PassageImage[];
  glossary?: PassageGlossary[];
  source: PassageSource;
  difficulty: PassageDifficulty;
  moduleType: PassageModuleType;
  estimatedReadingTime: number;
  videoExplanationUrl?: string;
  tags?: string[];
}

export async function createPassage(data: CreatePassagePayload): Promise<Passage> {
  const res = await apiClient.post<{ success: boolean; data: Passage }>(
    PASSAGE_BASE,
    data,
  );
  return res.data.data;
}

export async function getMyPassages(): Promise<Passage[]> {
  const res = await apiClient.get<{ success: boolean; data: Passage[] }>(
    `${PASSAGE_BASE}/my`,
  );
  return res.data?.data ?? [];
}

export async function updatePassage(
  id: string,
  data: Partial<CreatePassagePayload>,
): Promise<Passage> {
  const res = await apiClient.patch<{ success: boolean; data: Passage }>(
    `${PASSAGE_BASE}/${id}`,
    data,
  );
  return res.data.data;
}

/* ----- Question Sets (Question Groups) ----- */
export type ReadingQuestionType =
  | "MCQ_SINGLE"
  | "MCQ_MULTIPLE"
  | "TRUE_FALSE_NOT_GIVEN"
  | "YES_NO_NOT_GIVEN"
  | "MATCHING_HEADINGS"
  | "MATCHING_INFORMATION"
  | "MATCHING_FEATURES"
  | "MATCHING_SENTENCE_ENDINGS"
  | "SENTENCE_COMPLETION"
  | "SUMMARY_COMPLETION"
  | "NOTE_COMPLETION"
  | "TABLE_COMPLETION"
  | "FLOW_CHART_COMPLETION"
  | "DIAGRAM_LABEL_COMPLETION"
  | "SHORT_ANSWER";

export interface QuestionSetMeta {
  options?: string[];
  selectCount?: 1 | 2;
  labels?: string[];
  headings?: string[];
  paragraphCount?: number;
  features?: string[];
  endings?: string[];
  wordLimit?: number;
  allowReuse?: boolean;
}

export interface QuestionSet {
  _id: string;
  passageId: string | { _id: string };
  passageNumber: 1 | 2 | 3;
  order: number;
  instruction: string;
  startQuestionNumber: number;
  endQuestionNumber: number;
  questionType: ReadingQuestionType;
  meta?: QuestionSetMeta;
  isPublished?: boolean;
}

export interface CreateQuestionSetPayload {
  passageId: string;
  passageNumber: 1 | 2 | 3;
  order: number;
  instruction: string;
  startQuestionNumber: number;
  endQuestionNumber: number;
  questionType: ReadingQuestionType;
  meta: QuestionSetMeta;
}

export async function createQuestionSet(
  data: CreateQuestionSetPayload,
): Promise<QuestionSet> {
  const res = await apiClient.post<{ success: boolean; data: QuestionSet }>(
    QUESTION_SET_BASE,
    data,
  );
  return res.data.data;
}

export async function getMyQuestionSets(): Promise<QuestionSet[]> {
  const res = await apiClient.get<{ success: boolean; data: QuestionSet[] }>(
    `${QUESTION_SET_BASE}/my`,
  );
  return res.data?.data ?? [];
}

export async function updateQuestionSet(
  id: string,
  data: Partial<CreateQuestionSetPayload>,
): Promise<QuestionSet> {
  const res = await apiClient.patch<{ success: boolean; data: QuestionSet }>(
    `${QUESTION_SET_BASE}/${id}`,
    data,
  );
  return res.data.data;
}

export async function deleteQuestionSet(id: string): Promise<void> {
  await apiClient.delete(`${QUESTION_SET_BASE}/${id}`);
}

/* ----- Questions ----- */
export interface QuestionBody {
  layout: "TEXT" | "PASSAGE" | "TABLE" | "FLOWCHART" | "DIAGRAM";
  content: string | string[][] | { label: string; next?: number }[];
}

export interface QuestionBlank {
  id: number;
  correctAnswer: string | string[];
  wordLimit?: number;
  options?: string[];
}

export interface WeaknessTag {
  _id: string;
  name: string;
  category: string;
  description: string;
  isActive: boolean;
}

export async function getActiveWeaknessTags(): Promise<WeaknessTag[]> {
  const res = await apiClient.get<{ success: boolean; data: WeaknessTag[] }>(
    `${WEAKNESS_TAGS_BASE}/active`,
  );
  return res.data?.data ?? [];
}

export interface Question {
  _id: string;
  passageId: string | { _id: string };
  questionSetId: string | { _id: string };
  questionNumber: number;
  type: ReadingQuestionType;
  questionBody: QuestionBody;
  blanks?: QuestionBlank[];
  options?: string[];
  correctAnswer?: string | string[];
  weaknessTags?: string[] | { _id: string; name: string; category: string }[];
  explanation?: string;
  difficulty: PassageDifficulty;
  isPublished?: boolean;
}

export interface CreateQuestionPayload {
  passageId: string;
  questionSetId: string;
  questionNumber: number;
  // type is intentionally absent — the backend derives it from the question set
  questionBody: QuestionBody;
  blanks?: QuestionBlank[];
  options?: string[];
  correctAnswer?: string | string[];
  weaknessTags?: string[];
  explanation?: string;
  difficulty: PassageDifficulty;
}

export async function createQuestion(data: CreateQuestionPayload): Promise<Question> {
  const res = await apiClient.post<{ success: boolean; data: Question }>(
    QUESTION_BASE,
    data,
  );
  return res.data.data;
}

export async function getMyQuestions(): Promise<Question[]> {
  const res = await apiClient.get<{ success: boolean; data: Question[] }>(
    `${QUESTION_BASE}/my`,
  );
  return res.data?.data ?? [];
}

export async function updateQuestion(
  id: string,
  data: Partial<CreateQuestionPayload>,
): Promise<Question> {
  const res = await apiClient.patch<{ success: boolean; data: Question }>(
    `${QUESTION_BASE}/${id}`,
    data,
  );
  return res.data.data;
}

/* ----- Passage Question Sets ----- */
export interface PassageQuestionSet {
  _id: string;
  passageId: string | { _id: string };
  passageCode: string | { _id: string };
  passageNumber: 1 | 2 | 3;
  /** Human-readable name for the question set */
  title?: string;
  difficulty: PassageDifficulty;
  questionGroupIds: (string | { _id: string })[];
  expectedTotalQuestions?: number;
  totalQuestions?: number;
  recommendedTime: number;
  isPublished?: boolean;
}

export interface CreatePassageQuestionSetPayload {
  passageId: string;
  passageCode: string;
  passageNumber: 1 | 2 | 3;
  title?: string;
  difficulty: PassageDifficulty;
  questionGroupIds: string[];
  expectedTotalQuestions: number;
  recommendedTime: number;
}

export async function createPassageQuestionSet(
  data: CreatePassageQuestionSetPayload,
): Promise<PassageQuestionSet> {
  const res = await apiClient.post<{
    success: boolean;
    data: PassageQuestionSet;
  }>(PASSAGE_QSET_BASE, data);
  return res.data.data;
}

export async function getMyPassageQuestionSets(): Promise<PassageQuestionSet[]> {
  const res = await apiClient.get<{
    success: boolean;
    data: PassageQuestionSet[];
  }>(`${PASSAGE_QSET_BASE}/my`);
  return res.data?.data ?? [];
}

export async function updatePassageQuestionSet(
  questionSetId: string,
  data: Partial<CreatePassageQuestionSetPayload>,
): Promise<PassageQuestionSet> {
  const res = await apiClient.patch<{
    success: boolean;
    data: PassageQuestionSet;
  }>(`${PASSAGE_QSET_BASE}/${questionSetId}`, data);
  return res.data.data;
}
