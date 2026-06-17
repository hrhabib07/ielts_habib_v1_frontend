"use client";

import { useEffect, useState, useCallback } from "react";

const generateSlug = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getReadingLevels,
  createLevel,
  updateLevel,
  deleteLevel,
  getVersionsByLevelId,
  publishVersion,
  createDraftVersion,
  deleteDraftVersion,
  createStep,
  updateEvaluationConfig,
  bulkCreateLevel,
  SAMPLE_BULK_CREATE_PAYLOAD,
  type ReadingLevel,
  type CreateLevelPayload,
  type UpdateLevelPayload,
  type ReadingLevelType,
  type ReadingLevelDifficulty,
  type ReadingLevelVersion,
  type BulkCreateLevelPayload,
  type ReadingLevelStep,
  type ReadingStepType,
} from "@/src/lib/api/adminReadingVersions";
import { Loader2, ChevronRight, Plus, Pencil, Trash2, X, Eye, Upload, GitBranch, Copy, ChevronDown, ChevronUp } from "lucide-react";
import {
  listLearningContents,
  createLearningContent,
  updateLearningContent,
  type LearningContent,
} from "@/src/lib/api/learningContents";
import {
  listQuizContent,
  createQuizContent,
  updateQuizContent,
  type QuizGroup,
  type ReadingQuizContent,
} from "@/src/lib/api/quizContent";
import {
  displayLevelNumberFromOrder,
  formatInstructorLevelSummary,
  readingLevelContentCode,
} from "@/src/lib/readingLevelOrder";
import { MockLevelsLaunchInstructorBanner } from "@/src/components/reading/MockLevelsLaunchInstructorBanner";
import { InstructorLevelCodeNotice } from "@/src/components/instructor/InstructorLevelCodeNotice";

export interface LevelVersionSummary {
  publishedVersion?: number;
  publishedUpdatedAt?: string;
  hasDraft: boolean;
  draftVersionId?: string;
}

export function ReadingLevelsListClient() {
  const router = useRouter();
  const [levels, setLevels] = useState<ReadingLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editLevel, setEditLevel] = useState<ReadingLevel | null>(null);
  const [deleteLevelId, setDeleteLevelId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [versionCounts, setVersionCounts] = useState<Record<string, number>>({});
  const [versionSummaries, setVersionSummaries] = useState<
    Record<string, LevelVersionSummary>
  >({});
  const [bulkCreateOpen, setBulkCreateOpen] = useState(false);
  const [bulkPayloadJson, setBulkPayloadJson] = useState("");
  const [bulkCreateError, setBulkCreateError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [bulkSkillContentsOpen, setBulkSkillContentsOpen] = useState(false);
  const [bulkSkillPayloadJson, setBulkSkillPayloadJson] = useState("");
  const [bulkSkillCreateError, setBulkSkillCreateError] = useState<string | null>(null);
  const [bulkSkillBusy, setBulkSkillBusy] = useState(false);
  // Backward-compat alias: avoids runtime break if existing code references the old setter name.
  const setBulkSkillCreateOpen = setBulkSkillContentsOpen;

  const loadLevels = useCallback(async () => {
    const data = await getReadingLevels();
    setLevels(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getReadingLevels()
      .then((data) => {
        if (!cancelled) setLevels(data);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (levels.length === 0) return;
    const countMap: Record<string, number> = {};
    const summaryMap: Record<string, LevelVersionSummary> = {};
    Promise.all(
      levels.map(async (l) => {
        try {
          const versions: ReadingLevelVersion[] =
            await getVersionsByLevelId(l._id);
          countMap[l._id] = versions.length;
          const published = versions.find((v) => v.status === "PUBLISHED");
          const draft = versions.find((v) => v.status === "DRAFT");
          summaryMap[l._id] = {
            publishedVersion: published?.version,
            publishedUpdatedAt: published?.updatedAt,
            hasDraft: !!draft,
            draftVersionId: draft?._id,
          };
        } catch {
          countMap[l._id] = 0;
          summaryMap[l._id] = { hasDraft: false };
        }
      }),
    ).then(() => {
      setVersionCounts(countMap);
      setVersionSummaries(summaryMap);
    });
  }, [levels]);

  const handleCreate = async (payload: CreateLevelPayload) => {
    setBusy(true);
    setError(null);
    try {
      const created = await createLevel(payload);
      await loadLevels();
      setCreateOpen(false);
      router.push(`/dashboard/instructor/reading-levels/${created._id}/edit`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (
    levelId: string,
    payload: UpdateLevelPayload,
  ) => {
    setBusy(true);
    setError(null);
    try {
      await updateLevel(levelId, payload);
      await loadLevels();
      setEditLevel(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (levelId: string) => {
    setBusy(true);
    setError(null);
    try {
      await deleteLevel(levelId);
      await loadLevels();
      setDeleteLevelId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async (levelId: string, versionId: string) => {
    setBusy(true);
    setError(null);
    try {
      await publishVersion(levelId, versionId);
      await loadLevels();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to publish");
    } finally {
      setBusy(false);
    }
  };

  const handleCopySamplePayload = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(SAMPLE_BULK_CREATE_PAYLOAD, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setBulkCreateError("Could not copy to clipboard");
    }
  };

  const handleBulkCreate = async () => {
    setBulkCreateError(null);
    const raw = bulkPayloadJson.trim();
    if (!raw) {
      setBulkCreateError("Paste the JSON payload first");
      return;
    }
    let payload: BulkCreateLevelPayload;
    try {
      payload = JSON.parse(raw) as BulkCreateLevelPayload;
    } catch {
      setBulkCreateError("Invalid JSON. Copy the sample payload, fill in body/videoUrl (and quiz questions), then paste here.");
      return;
    }
    if (!payload?.level?.title || !payload?.level?.slug || payload?.level?.order == null || !payload?.level?.levelType) {
      setBulkCreateError("Payload must include level.title, level.slug, level.order, level.levelType");
      return;
    }
    if (!Array.isArray(payload.contents) || payload.contents.length === 0) {
      setBulkCreateError("Payload must include contents array with at least one item");
      return;
    }
    if (!payload?.quiz?.contentCode || !payload?.quiz?.title || !Array.isArray(payload?.quiz?.groups) || payload.quiz.groups.length === 0) {
      setBulkCreateError("Payload must include quiz.contentCode, quiz.title, and quiz.groups (at least one group with questions)");
      return;
    }
    setBusy(true);
    try {
      const result = await bulkCreateLevel(payload);
      await loadLevels();
      setBulkPayloadJson("");
      setBulkCreateOpen(false);
      router.push(`/dashboard/instructor/reading-levels/${result.level._id}/edit`);
    } catch (e) {
      setBulkCreateError(e instanceof Error ? e.message : "Bulk create failed");
    } finally {
      setBusy(false);
    }
  };

  interface BulkCreateSkillLevelContentQuestion {
    questionText: string;
    options: string[];
    correctAnswer: string;
    marks?: number;
  }

  interface BulkCreateSkillLevelContentLevel {
    /** 1-based index: Level 11 → 12, Level 12 (Matching Sentence Endings) → 13, … Level 19 → 20 */
    order: number;
    labelName: string;
    notesHtml: string;
    quizQuestions: BulkCreateSkillLevelContentQuestion[];
    difficulty?: ReadingLevelDifficulty;
  }

  interface BulkCreateSkillLevelContentPayload {
    videoUrl: string; // applied to all levels (can be empty initially)
    levels: BulkCreateSkillLevelContentLevel[];
    resetDrafts?: boolean;
  }

  const SAMPLE_BULK_SKILL_LEVEL_CONTENT_PAYLOAD: BulkCreateSkillLevelContentPayload = {
    videoUrl: "",
    resetDrafts: true,
    levels: [
      {
        order: 12,
        labelName: "Parallel Solving",
        notesHtml: "<p>Dummy notes for Parallel Solving.</p>",
        quizQuestions: [
          {
            questionText: "Question 1 (dummy): Which approach matches the note?",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A",
            marks: 1,
          },
        ],
        difficulty: "basic",
      },
      {
        order: 13,
        labelName: "Matching Sentence Endings",
        notesHtml: "<p>Dummy notes for Matching Sentence Endings.</p>",
        quizQuestions: [
          {
            questionText: "Question 1 (dummy): Pick the best ending idea.",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A",
            marks: 1,
          },
        ],
        difficulty: "basic",
      },
      {
        order: 14,
        labelName: "Matching Features / Names",
        notesHtml: "<p>Dummy notes for Matching Features / Names.</p>",
        quizQuestions: [
          {
            questionText: "Question 1 (dummy): Choose the correct feature match.",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A",
            marks: 1,
          },
        ],
        difficulty: "basic",
      },
      {
        order: 15,
        labelName: "Matching Information",
        notesHtml: "<p>Dummy notes for Matching Information.</p>",
        quizQuestions: [
          {
            questionText: "Question 1 (dummy): Which item fits the information?",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A",
            marks: 1,
          },
        ],
        difficulty: "basic",
      },
      {
        order: 16,
        labelName: "Matching Headings",
        notesHtml: "<p>Dummy notes for Matching Headings.</p>",
        quizQuestions: [
          {
            questionText: "Question 1 (dummy): Choose the correct heading.",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A",
            marks: 1,
          },
        ],
        difficulty: "basic",
      },
      {
        order: 17,
        labelName: "Passage 2 Practice",
        notesHtml: "<p>Dummy notes for Passage 2 Practice.</p>",
        quizQuestions: [
          {
            questionText: "Question 1 (dummy): Pick the best summary idea.",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A",
            marks: 1,
          },
        ],
        difficulty: "basic",
      },
      {
        order: 18,
        labelName: "Passage 3 Practice",
        notesHtml: "<p>Dummy notes for Passage 3 Practice.</p>",
        quizQuestions: [
          {
            questionText: "Question 1 (dummy): Choose the correct detail match.",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A",
            marks: 1,
          },
        ],
        difficulty: "basic",
      },
      {
        order: 19,
        labelName: "Full Reading Test",
        notesHtml: "<p>Dummy notes for Full Reading Test.</p>",
        quizQuestions: [
          {
            questionText: "Question 1 (dummy): Choose the best next step.",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A",
            marks: 1,
          },
        ],
        difficulty: "basic",
      },
      {
        order: 20,
        labelName: "Master Level",
        notesHtml: "<p>Dummy notes for Master Level.</p>",
        quizQuestions: [
          {
            questionText: "Question 1 (dummy): Select the correct practice approach.",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A",
            marks: 1,
          },
        ],
        difficulty: "basic",
      },
    ],
  };

  const handleCopySampleSkillPayload = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(SAMPLE_BULK_SKILL_LEVEL_CONTENT_PAYLOAD, null, 2),
      );
      setBulkSkillCreateError(null);
    } catch {
      setBulkSkillCreateError("Could not copy to clipboard");
    }
  };

  const handleBulkCreateSkillContents = async () => {
    setBulkSkillCreateError(null);
    const raw = bulkSkillPayloadJson.trim();
    if (!raw) {
      setBulkSkillCreateError("Paste the JSON payload first");
      return;
    }

    let payload: BulkCreateSkillLevelContentPayload;
    try {
      payload = JSON.parse(raw) as BulkCreateSkillLevelContentPayload;
    } catch {
      setBulkSkillCreateError(
        "Invalid JSON. Paste a valid payload (levels[], each with notesHtml + quizQuestions).",
      );
      return;
    }

    if (!payload?.videoUrl && payload?.videoUrl !== "") {
      setBulkSkillCreateError("Payload must include videoUrl (can be empty initially)");
      return;
    }
    if (!Array.isArray(payload?.levels) || payload.levels.length === 0) {
      setBulkSkillCreateError("Payload.levels must be a non-empty array");
      return;
    }

    const normalizedLevels = payload.levels
      .filter((l) => typeof l?.order === "number" && typeof l?.labelName === "string")
      .map((l) => ({
        order: l.order,
        labelName: l.labelName,
        notesHtml: typeof l.notesHtml === "string" ? l.notesHtml : "",
        quizQuestions: Array.isArray(l.quizQuestions) ? l.quizQuestions : [],
        difficulty: l.difficulty,
      }));

    if (normalizedLevels.length !== payload.levels.length) {
      setBulkSkillCreateError("Some levels are missing required fields: order, labelName");
      return;
    }

    for (const lvl of normalizedLevels) {
      if (lvl.notesHtml.trim().length === 0) {
        setBulkSkillCreateError(
          `Level ${lvl.order}: notesHtml is required (can be dummy, but not empty).`,
        );
        return;
      }
      if (lvl.quizQuestions.length === 0) {
        setBulkSkillCreateError(
          `Level ${lvl.order}: quizQuestions is required (at least one MCQ).`,
        );
        return;
      }
      for (const q of lvl.quizQuestions) {
        if (!q?.questionText || !Array.isArray(q.options) || q.options.length < 2 || !q?.correctAnswer) {
          setBulkSkillCreateError(
            `Level ${lvl.order}: each question requires questionText, options (>=2), and correctAnswer.`,
          );
          return;
        }
      }
    }

    setBulkSkillBusy(true);
    try {
      // Load current levels so we can re-use existing level docs by order.
      const currentLevels = await getReadingLevels();
      const videos = await listLearningContents({ type: "VIDEO" });
      const notes = await listLearningContents({ type: "NOTE" });
      const quizContents = await listQuizContent();

      const levelIdsByOrder = new Map<number, string>();
      const createdOrExistingLevelIds: string[] = [];

      const findOrCreateLevel = async (lvl: BulkCreateSkillLevelContentLevel) => {
        const existing = currentLevels.find((l) => l.order === lvl.order);
        if (existing) return existing._id;
        const slug = `level-${lvl.order}-${generateSlug(lvl.labelName) || `skill-${lvl.order}`}`;
        const created = await createLevel({
          title: `Level ${lvl.order - 1} – ${lvl.labelName}`,
          slug,
          order: lvl.order,
          levelType: "SKILL",
          difficulty: lvl.difficulty ?? "basic",
          description: "",
          isActive: true,
        });
        return created._id;
      };

      const upsertLearningContentByCode = async (args: {
        contentCode: string;
        type: "VIDEO" | "NOTE";
        title: string;
        body?: string;
        videoUrl?: string;
      }): Promise<string> => {
        const list = args.type === "VIDEO" ? videos : notes;
        const existing = list.find((c) => c.contentCode === args.contentCode);
        if (existing) {
          await updateLearningContent(existing._id, {
            title: args.title,
            body: args.body,
            videoUrl: args.type === "VIDEO" ? args.videoUrl ?? "" : "",
            isPublished: true,
          });
          return existing._id;
        }
        const created = await createLearningContent({
          contentCode: args.contentCode,
          title: args.title,
          type: args.type,
          body: args.body ?? "",
          videoUrl: args.type === "VIDEO" ? args.videoUrl ?? "" : "",
          isPublished: true,
        });
        return created._id;
      };

      const upsertQuizByCode = async (args: {
        contentCode: string;
        title: string;
        description: string;
        questions: BulkCreateSkillLevelContentQuestion[];
      }): Promise<string> => {
        const existing = quizContents.find((q) => q.contentCode === args.contentCode);
        const groups: QuizGroup[] = [
          {
            title: "Practice quiz",
            order: 0,
            questions: args.questions.map((qq) => {
              const options = qq.options;
              return {
                type: "MCQ" as const,
                questionText: qq.questionText,
                options,
                correctAnswer: qq.correctAnswer,
                marks: qq.marks ?? 1,
              };
            }),
          },
        ];

        if (existing) {
          await updateQuizContent(existing._id, {
            title: args.title,
            description: args.description,
            groups,
            quizUseType: "PRACTICE",
            evaluationType: "PERCENTAGE",
            isActive: true,
          });
          return existing._id;
        }

        const created = await createQuizContent({
          contentCode: args.contentCode,
          title: args.title,
          description: args.description,
          timeLimit: undefined,
          groups,
          isActive: true,
          quizUseType: "PRACTICE",
          evaluationType: "PERCENTAGE",
        });
        return created._id;
      };

      const createdLevelIds: string[] = [];

      // Process sequentially to avoid hammering the DB and to keep errors readable.
      for (const lvl of normalizedLevels) {
        const lvlId = await findOrCreateLevel(lvl);
        levelIdsByOrder.set(lvl.order, lvlId);
        createdOrExistingLevelIds.push(lvlId);

        if (payload.resetDrafts) {
          const versions = await getVersionsByLevelId(lvlId);
          const draftVersions = versions.filter((v) => v.status === "DRAFT");
          await Promise.all(
            draftVersions.map(async (v) => {
              await deleteDraftVersion(v._id);
            }),
          );
        }

        const draftVersion = await createDraftVersion(lvlId);
        const versionId = draftVersion._id;

        // Ensure evaluation config is compatible for later publishing (group test = band-based pass).
        await updateEvaluationConfig(versionId, {
          finalEvaluationType: "GROUP_TEST",
          maxAttempts: 1,
        });

        const videoContentCode = `L${lvl.order}C1`;
        const noteContentCode = `L${lvl.order}C2`;
        const quizContentCode = `L${lvl.order}C3`;

        const videoTitle = `El ${lvl.labelName}`;
        const notesTitle = `El ${lvl.labelName} - Notes`;
        const quizTitle = `El ${lvl.labelName} - Practice Quiz`;

        const videoContentId = await upsertLearningContentByCode({
          contentCode: videoContentCode,
          type: "VIDEO",
          title: videoTitle,
          videoUrl: payload.videoUrl,
          body: "",
        });

        const notesContentId = await upsertLearningContentByCode({
          contentCode: noteContentCode,
          type: "NOTE",
          title: notesTitle,
          body: lvl.notesHtml,
          videoUrl: "",
        });

        const quizContentId = await upsertQuizByCode({
          contentCode: quizContentCode,
          title: quizTitle,
          description: `Practice quiz for ${lvl.labelName}.`,
          questions: lvl.quizQuestions.map((q) => ({
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            marks: q.marks,
          })),
        });

        // Create steps: 0=VIDEO, 1=INSTRUCTION(Notes), 2=QUIZ (practice quiz).
        const stepsPayload: Omit<ReadingLevelStep, "_id">[] = [
          {
            levelVersionId: versionId,
            stepType: "VIDEO",
            title: videoTitle,
            order: 0,
            contentId: videoContentId,
            contentIds: null,
            practiceTestId: null,
            isFinalQuiz: false,
          },
          {
            levelVersionId: versionId,
            stepType: "INSTRUCTION",
            title: notesTitle,
            order: 1,
            contentId: notesContentId,
            contentIds: null,
            practiceTestId: null,
            isFinalQuiz: false,
          },
          {
            levelVersionId: versionId,
            stepType: "QUIZ",
            title: quizTitle,
            order: 2,
            contentId: quizContentId,
            contentIds: null,
            practiceTestId: null,
            isFinalQuiz: false,
            passType: "PERCENTAGE",
            passValue: 100,
            attemptPolicy: "UNLIMITED",
          },
        ];

        const [videoStep, notesStep, quizStep] = stepsPayload;
        if (!videoStep || !notesStep || !quizStep) {
          throw new Error("Bulk skill create: internal step payload mismatch");
        }

        await createStep(versionId, {
          stepType: videoStep.stepType as ReadingStepType,
          title: videoStep.title,
          order: videoStep.order,
          contentId: videoStep.contentId ?? null,
          attemptPolicy: undefined,
          passType: undefined,
          passValue: undefined,
          isFinalQuiz: false,
        });

        await createStep(versionId, {
          stepType: notesStep.stepType as ReadingStepType,
          title: notesStep.title,
          order: notesStep.order,
          contentId: notesStep.contentId ?? null,
          isFinalQuiz: false,
        });

        await createStep(versionId, {
          stepType: quizStep.stepType as ReadingStepType,
          title: quizStep.title,
          order: quizStep.order,
          contentId: quizStep.contentId ?? null,
          isFinalQuiz: false,
          passType: "PERCENTAGE",
          passValue: 100,
          attemptPolicy: "UNLIMITED",
        });
      }

      await loadLevels();
      setBulkSkillPayloadJson("");
      setBulkSkillCreateOpen(false);

      const firstLevel = createdOrExistingLevelIds[0];
      if (firstLevel) {
        router.push(`/dashboard/instructor/reading-levels/${firstLevel}/edit`);
      }
    } catch (e) {
      setBulkSkillCreateError(e instanceof Error ? e.message : "Bulk skill create failed");
    } finally {
      setBulkSkillBusy(false);
    }
  };

  const levelStatus = (level: ReadingLevel) =>
    level.status === "published" ? "published" : "draft";
  const summary = (levelId: string) => versionSummaries[levelId] ?? { hasDraft: false };
  const lastUpdated = (level: ReadingLevel, levelId: string) => {
    const s = summary(levelId);
    if (s.publishedUpdatedAt) return formatDate(s.publishedUpdatedAt);
    return level.updatedAt ? formatDate(level.updatedAt) : "";
  };
  function formatDate(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && levels.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <MockLevelsLaunchInstructorBanner levels={levels} />
      <InstructorLevelCodeNotice className="mb-4" />

      <Card className="rounded-2xl border border-border bg-muted/30 shadow-sm">
        <CardHeader
          className="flex flex-row items-center justify-between space-y-0 p-4 cursor-pointer"
          onClick={() => setBulkCreateOpen((o) => !o)}
        >
          <CardTitle className="text-base font-semibold text-foreground">
            Bulk create level (one click)
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {bulkCreateOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardHeader>
        {bulkCreateOpen && (
          <CardContent className="border-t border-border px-4 pt-4 pb-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Copy the sample payload below, paste it into an AI or editor to fill in <strong>body</strong>, <strong>videoUrl</strong>, and quiz questions. Then paste the filled JSON here and click Create. One request creates the level, draft version, all content steps, and the final quiz.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleCopySamplePayload} className="gap-1.5">
                <Copy className="h-4 w-4" />
                {copySuccess ? "Copied!" : "Copy sample payload"}
              </Button>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Paste your filled JSON payload</Label>
              <textarea
                value={bulkPayloadJson}
                onChange={(e) => setBulkPayloadJson(e.target.value)}
                placeholder='{"level": {...}, "contents": [...], "quiz": {...}}'
                rows={8}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
              />
            </div>
            {bulkCreateError && <p className="text-sm text-destructive">{bulkCreateError}</p>}
            <Button type="button" onClick={handleBulkCreate} disabled={busy} className="gap-2">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create level from payload
            </Button>
          </CardContent>
        )}
      </Card>

      <Card className="rounded-2xl border border-border bg-muted/30 shadow-sm">
        <CardHeader
          className="flex flex-row items-center justify-between space-y-0 p-4 cursor-pointer"
          onClick={() => setBulkSkillContentsOpen((o) => !o)}
        >
          <CardTitle className="text-base font-semibold text-foreground">
            Bulk create SKILL contents (VIDEO + NOTES + PRACTICE QUIZ)
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {bulkSkillContentsOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>

        {bulkSkillContentsOpen && (
          <CardContent className="border-t border-border px-4 pt-4 pb-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Paste AI JSON for levels <strong>11 to 19</strong>. This creates (per level) a new draft version with 3 steps:
              <strong> VIDEO</strong>, <strong>Notes</strong>, then a <strong>practice quiz</strong> that requires <strong>100%</strong> to pass.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopySampleSkillPayload}
                className="gap-1.5"
              >
                <Copy className="h-4 w-4" />
                Copy sample payload
              </Button>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bulkSkillReset"
                  checked={(() => {
                    try {
                      const parsed = bulkSkillPayloadJson.trim()
                        ? (JSON.parse(bulkSkillPayloadJson) as BulkCreateSkillLevelContentPayload)
                        : null;
                      return parsed?.resetDrafts ?? true;
                    } catch {
                      return true;
                    }
                  })()}
                  onChange={() => {
                    // Keep UX simple: if current JSON parses, toggle resetDrafts; otherwise set a default template.
                    try {
                      const parsed = bulkSkillPayloadJson.trim()
                        ? (JSON.parse(bulkSkillPayloadJson) as BulkCreateSkillLevelContentPayload)
                        : SAMPLE_BULK_SKILL_LEVEL_CONTENT_PAYLOAD;
                      const next: BulkCreateSkillLevelContentPayload = {
                        ...parsed,
                        resetDrafts: !((parsed.resetDrafts ?? true) as boolean),
                      };
                      setBulkSkillPayloadJson(JSON.stringify(next, null, 2));
                    } catch {
                      setBulkSkillPayloadJson(
                        JSON.stringify(
                          { ...SAMPLE_BULK_SKILL_LEVEL_CONTENT_PAYLOAD, resetDrafts: false },
                          null,
                          2,
                        ),
                      );
                    }
                  }}
                  className="rounded border-input"
                />
                <Label htmlFor="bulkSkillReset" className="text-sm text-muted-foreground">
                  Replace existing draft versions
                </Label>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Paste your filled JSON payload</Label>
              <textarea
                value={bulkSkillPayloadJson}
                onChange={(e) => setBulkSkillPayloadJson(e.target.value)}
                placeholder="Paste AI JSON here"
                rows={10}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
              />
            </div>

            {bulkSkillCreateError && (
              <p className="text-sm text-destructive">{bulkSkillCreateError}</p>
            )}

            <Button
              type="button"
              onClick={handleBulkCreateSkillContents}
              disabled={bulkSkillBusy}
              className="gap-2"
            >
              {bulkSkillBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create SKILL drafts + steps from payload
            </Button>
          </CardContent>
        )}
      </Card>

      <Card className="rounded-2xl border border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6">
          <CardTitle className="text-lg font-semibold text-foreground">
            Reading levels
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create level
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="px-6 py-2">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <ul className="divide-y divide-border">
            {levels.map((level) => {
              const status = levelStatus(level);
              const s = summary(level._id);
              const lastUpd = lastUpdated(level, level._id);
              return (
                <li key={level._id}>
                  <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-muted/50">
                    <Link
                      href={`/dashboard/instructor/reading-levels/${level._id}/edit`}
                      className="min-w-0 flex-1"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary"
                          title={formatInstructorLevelSummary(level.order)}
                        >
                          {displayLevelNumberFromOrder(level.order)}
                        </span>
                        <span
                          className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
                          title={`DB content code · order ${level.order}`}
                        >
                          {readingLevelContentCode(level.order)}
                        </span>
                        <p className="font-medium text-foreground">
                          {level.title}
                        </p>
                        <span
                          className={
                            status === "published"
                              ? "rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                              : "rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400"
                          }
                        >
                          {status === "published" ? "Published" : "Draft"}
                        </span>
                        {!level.isActive && (
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            (inactive)
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {level.levelType}
                        {level.difficulty ? ` · ${level.difficulty}` : ""} · {level.slug}
                        {" · "}
                        v{s.publishedVersion ?? ""}
                        {" · "}
                        {lastUpd}
                      </p>
                    </Link>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/instructor/reading-levels/${level._id}/versions`}
                        className="inline-flex"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 gap-1.5"
                          title="View and manage versions (published v1, draft v2, etc.)"
                        >
                          <GitBranch className="h-4 w-4" />
                          Versions
                        </Button>
                      </Link>
                      <Link
                        href={
                          s.hasDraft && s.draftVersionId
                            ? `/dashboard/instructor/reading-levels/${level._id}/versions/${s.draftVersionId}/preview`
                            : `/dashboard/instructor/reading-levels/${level._id}/preview`
                        }
                        className="inline-flex"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 gap-1.5"
                          disabled={!(s.hasDraft && s.draftVersionId) && status !== "published"}
                          title={
                            s.hasDraft && s.draftVersionId
                              ? "Preview draft (student view)"
                              : status === "published"
                                ? "Preview published version"
                                : "Create a version to preview"
                          }
                        >
                          <Eye className="h-4 w-4" />
                          Preview
                        </Button>
                      </Link>
                      <Link
                        href={`/dashboard/instructor/reading-levels/${level._id}/edit`}
                      >
                        <Button variant="outline" size="sm" className="h-9">
                          Edit draft
                        </Button>
                      </Link>
                      {s.hasDraft && s.draftVersionId && (
                        <Button
                          variant="default"
                          size="sm"
                          className="h-9 gap-1.5"
                          disabled={busy}
                          onClick={() =>
                            handlePublish(level._id, s.draftVersionId!)
                          }
                        >
                          <Upload className="h-4 w-4" />
                          Publish
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={(e) => {
                          e.preventDefault();
                          setEditLevel(level);
                        }}
                        disabled={busy}
                        title="Edit metadata"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:text-destructive"
                        onClick={() => setDeleteLevelId(level._id)}
                        disabled={
                          busy || (versionCounts[level._id] ?? 0) > 0
                        }
                        title={
                          (versionCounts[level._id] ?? 0) > 0
                            ? "Cannot delete: level has versions"
                            : "Delete level"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {levels.length === 0 && (
            <div className="px-6 py-12 text-center text-muted-foreground">
              No reading levels. Create one to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {createOpen && (
        <LevelFormModal
          title="Create level"
          initial={{
            title: "",
            slug: "",
            order: levels.length > 0 ? Math.max(...levels.map((l) => l.order)) + 1 : 1,
            levelType: "FOUNDATION",
            difficulty: undefined,
            description: "",
            isActive: true,
          }}
          onSave={handleCreate}
          onCancel={() => setCreateOpen(false)}
          busy={busy}
          isCreate
        />
      )}

      {editLevel && (
        <LevelFormModal
          title="Edit level"
          initial={{
            title: editLevel.title,
            slug: editLevel.slug,
            order: editLevel.order,
            levelType: editLevel.levelType,
            difficulty: editLevel.difficulty,
            description: editLevel.description ?? "",
            isActive: editLevel.isActive,
          }}
          onSave={(p) =>
            handleUpdate(editLevel._id, {
              title: p.title,
              description: p.description || undefined,
              order: p.order,
              isActive: p.isActive,
              difficulty: p.difficulty,
            })
          }
          onCancel={() => setEditLevel(null)}
          busy={busy}
          isCreate={false}
        />
      )}

      {deleteLevelId && (
        <DeleteConfirmModal
          onConfirm={() => handleDelete(deleteLevelId)}
          onCancel={() => setDeleteLevelId(null)}
          busy={busy}
        />
      )}
    </>
  );
}

type LevelFormModalProps =
  | {
      title: string;
      initial: CreateLevelPayload & { description?: string };
      onSave: (p: CreateLevelPayload) => Promise<void>;
      onCancel: () => void;
      busy: boolean;
      isCreate: true;
    }
  | {
      title: string;
      initial: CreateLevelPayload & { description?: string };
      onSave: (p: UpdateLevelPayload) => Promise<void>;
      onCancel: () => void;
      busy: boolean;
      isCreate: false;
    };

const DIFFICULTY_OPTIONS: { value: ReadingLevelDifficulty; label: string }[] = [
  { value: "basic", label: "Basic" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

function LevelFormModal({
  title,
  initial,
  onSave,
  onCancel,
  busy,
  isCreate,
}: LevelFormModalProps) {
  const [titleVal, setTitleVal] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [order, setOrder] = useState(initial.order);
  const [levelType, setLevelType] = useState<ReadingLevelType>(initial.levelType);
  const [difficulty, setDifficulty] = useState<ReadingLevelDifficulty | "">(
    (initial as CreateLevelPayload & { difficulty?: ReadingLevelDifficulty }).difficulty ?? "",
  );
  const [description, setDescription] = useState(initial.description ?? "");
  const [isActive, setIsActive] = useState(initial.isActive !== false);

  useEffect(() => {
    if (isCreate && !slugManuallyEdited) {
      setSlug(generateSlug(titleVal));
    }
  }, [titleVal, isCreate, slugManuallyEdited]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleVal(e.target.value);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setSlugManuallyEdited(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleVal.trim() || !slug.trim()) return;
    if (isCreate) {
      await onSave({
        title: titleVal.trim(),
        slug: slug.trim(),
        order: Number(order),
        levelType,
        difficulty: difficulty || undefined,
        description: description.trim() || undefined,
        isActive,
      });
    } else {
      await onSave({
        title: titleVal.trim(),
        description: description.trim() || undefined,
        order: Number(order),
        isActive,
        difficulty: difficulty || undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{title}</CardTitle>
          <Button variant="ghost" size="icon-xs" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={titleVal}
                onChange={handleTitleChange}
                placeholder="Level title"
                disabled={busy}
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={handleSlugChange}
                placeholder="level-slug"
                disabled={busy || !isCreate}
              />
              {!isCreate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Slug cannot be changed
                </p>
              )}
            </div>
            <div>
              <Label>Order</Label>
              <Input
                type="number"
                min={0}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value) || 0)}
                disabled={busy}
              />
            </div>
            {isCreate && (
              <>
                <div>
                  <Label>Type</Label>
                  <select
                    value={levelType}
                    onChange={(e) => setLevelType(e.target.value as ReadingLevelType)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm"
                    disabled={busy}
                  >
                    <option value="FOUNDATION">Foundation</option>
                    <option value="SKILL">Skill</option>
                  </select>
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as ReadingLevelDifficulty | "")}
                    className="mt-1.5 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm"
                    disabled={busy}
                  >
                    <option value=""> Select </option>
                    {DIFFICULTY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {!isCreate && (
              <div>
                <Label>Difficulty</Label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as ReadingLevelDifficulty | "")}
                  className="mt-1.5 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm"
                  disabled={busy}
                >
                  <option value=""> Select </option>
                  {DIFFICULTY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <Label>Description (optional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                disabled={busy}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={busy}
                className="rounded border-input"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function DeleteConfirmModal({
  onConfirm,
  onCancel,
  busy,
}: {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  busy: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader>
          <CardTitle>Delete level</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will deactivate the level. You cannot delete a level that has
            versions or progress.
          </p>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={busy}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
