import type { Level } from "@/src/lib/api/levels";
import type {
  LevelDetailForStudent,
  LevelDetailStep,
} from "@/src/lib/api/readingStrictProgression";

/**
 * Launch flag — set to `false` when Levels 17–20 real content is live on the backend.
 * While true, students see placeholder steps + Coming Soon on unlocked mock levels.
 */
export const READING_MOCK_LEVELS_LAUNCH_PLACEHOLDER = true;

export const MOCK_LEVEL_ORDERS = [17, 18, 19, 20] as const;
export type MockLevelOrder = (typeof MOCK_LEVEL_ORDERS)[number];

const PLACEHOLDER_ID_PREFIX = "gamlish-placeholder-reading-l";

export function isMockLevelOrder(order: number): order is MockLevelOrder {
  return (MOCK_LEVEL_ORDERS as readonly number[]).includes(order);
}

export function shouldUseMockLevelPlaceholder(order: number): boolean {
  return READING_MOCK_LEVELS_LAUNCH_PLACEHOLDER && isMockLevelOrder(order);
}

export function placeholderLevelId(order: number): string {
  return `${PLACEHOLDER_ID_PREFIX}${order}`;
}

export function isPlaceholderLevelId(levelId: string): boolean {
  return levelId.startsWith(PLACEHOLDER_ID_PREFIX);
}

export function orderFromPlaceholderLevelId(levelId: string): MockLevelOrder | null {
  if (!isPlaceholderLevelId(levelId)) return null;
  const n = Number(levelId.slice(PLACEHOLDER_ID_PREFIX.length));
  return isMockLevelOrder(n) ? n : null;
}

export function resolveMockLevelOrder(
  levelId: string,
  levelOrderFromDetail?: number | null,
): MockLevelOrder | null {
  const fromId = orderFromPlaceholderLevelId(levelId);
  if (fromId != null) return fromId;
  if (
    levelOrderFromDetail != null &&
    shouldUseMockLevelPlaceholder(levelOrderFromDetail)
  ) {
    return levelOrderFromDetail as MockLevelOrder;
  }
  return null;
}

export const MOCK_LEVEL_TITLES: Record<MockLevelOrder, string> = {
  17: "Full Reading Mock I",
  18: "Full Reading Mock II",
  19: "Full Reading Mock III",
  20: "Full Reading Master Mock",
};

export const MOCK_LEVEL_LAUNCH_MESSAGE =
  "Full IELTS Reading mock tests for this level are being finalised. Content will be available in the first week after Gamlish launch, in sha Allah.";

export type MockLevelLaunchState = "locked" | "coming_soon";

function stepId(order: MockLevelOrder, index: number): string {
  return `${placeholderLevelId(order)}-step-${index}`;
}

export function buildMockLevelPlaceholderSteps(order: MockLevelOrder): LevelDetailStep[] {
  return [
    {
      _id: stepId(order, 1),
      stepType: "INSTRUCTION",
      title: "Welcome — full reading mock",
      order: 1,
      contentId: null,
      practiceTestId: null,
    },
    {
      _id: stepId(order, 2),
      stepType: "PRACTICE_TEST",
      title: "Practice Mock Test 1",
      order: 2,
      contentId: null,
      practiceTestId: null,
    },
    {
      _id: stepId(order, 3),
      stepType: "PRACTICE_TEST",
      title: "Practice Mock Test 2",
      order: 3,
      contentId: null,
      practiceTestId: null,
    },
    {
      _id: stepId(order, 4),
      stepType: "PRACTICE_TEST",
      title: "Practice Mock Test 3",
      order: 4,
      contentId: null,
      practiceTestId: null,
    },
    {
      _id: stepId(order, 5),
      stepType: "FINAL_EVALUATION",
      title: "Final Evaluation (3 sequential mocks)",
      order: 5,
      contentId: null,
      practiceTestId: null,
    },
  ];
}

export function buildPlaceholderReadingLevel(order: MockLevelOrder): Level {
  return {
    _id: placeholderLevelId(order),
    title: `Level ${order} — ${MOCK_LEVEL_TITLES[order]}`,
    slug: `reading-level-${order}-mock-placeholder`,
    module: "READING",
    stage: order >= 20 ? "MASTER" : order >= 18 ? "ADVANCED" : "INTEGRATION",
    order,
    accessType: "PAID",
    description: MOCK_LEVEL_LAUNCH_MESSAGE,
    isMaster: order === 20,
    isActive: true,
  };
}

export function mergeReadingLevelsWithMockPlaceholders(apiLevels: Level[]): Level[] {
  if (!READING_MOCK_LEVELS_LAUNCH_PLACEHOLDER) {
    return [...apiLevels].sort((a, b) => a.order - b.order);
  }
  const byOrder = new Map<number, Level>();
  for (const lv of apiLevels) {
    byOrder.set(lv.order, lv);
  }
  for (const order of MOCK_LEVEL_ORDERS) {
    if (!byOrder.has(order)) {
      byOrder.set(order, buildPlaceholderReadingLevel(order));
    }
  }
  return Array.from(byOrder.values()).sort((a, b) => a.order - b.order);
}

type DetailCache = Record<string, LevelDetailForStudent>;

/** Same unlock rules as the reading path sidebar (L17 after L16 passed, etc.). */
export function getMockLevelLaunchState(params: {
  levelOrder: MockLevelOrder;
  levelIndex: number;
  levels: Level[];
  currentOrder: number;
  detailCache: DetailCache;
  contextDetail: LevelDetailForStudent | null;
  levelIdFromPath: string | null;
  curriculumDemoAccount: boolean;
}): MockLevelLaunchState {
  const {
    levelOrder,
    levelIndex,
    levels,
    currentOrder,
    detailCache,
    contextDetail,
    levelIdFromPath,
    curriculumDemoAccount,
  } = params;

  if (curriculumDemoAccount) return "coming_soon";

  const isFirst = levelIndex === 0;
  if (isFirst) return "coming_soon";
  if (levelOrder <= currentOrder) return "coming_soon";

  const prev = levels[levelIndex - 1];
  if (!prev) return "coming_soon";

  const prevDetail =
    prev._id === levelIdFromPath && contextDetail
      ? contextDetail
      : detailCache[prev._id];

  if (prevDetail?.progress.passStatus === "PASSED") {
    return "coming_soon";
  }

  return "locked";
}

export function isMockLevelUnlockedForStudent(
  levelIndex: number,
  levelOrder: number,
  currentOrder: number,
  levels: Level[],
  detailCache: DetailCache,
  contextDetail: LevelDetailForStudent | null,
  levelIdFromPath: string | null,
  curriculumDemoAccount: boolean,
): boolean {
  if (!shouldUseMockLevelPlaceholder(levelOrder)) {
    const isFirst = levelIndex === 0;
    return curriculumDemoAccount || isFirst || levelOrder <= currentOrder;
  }

  if (curriculumDemoAccount) return true;
  if (!isMockLevelOrder(levelOrder)) return levelIndex === 0 || levelOrder <= currentOrder;

  return (
    getMockLevelLaunchState({
      levelOrder,
      levelIndex,
      levels,
      currentOrder,
      detailCache,
      contextDetail,
      levelIdFromPath,
      curriculumDemoAccount,
    }) === "coming_soon"
  );
}

export function buildMockLevelPlaceholderDetail(
  order: MockLevelOrder,
  launchState: MockLevelLaunchState,
  routeLevelId?: string,
): LevelDetailForStudent {
  const steps = buildMockLevelPlaceholderSteps(order);
  const levelId = routeLevelId ?? placeholderLevelId(order);

  return {
    level: {
      _id: levelId,
      title: `Level ${order} — ${MOCK_LEVEL_TITLES[order]}`,
      slug: `reading-level-${order}-mock-placeholder`,
      order,
      levelType: order >= 18 ? "SKILL" : "SKILL",
    },
    progress: {
      _id: `placeholder-progress-l${order}`,
      levelId,
      versionId: `placeholder-version-l${order}`,
      currentStepIndex: launchState === "coming_soon" ? 0 : 0,
      completedStepIds: [],
      passStatus: launchState === "coming_soon" ? "IN_PROGRESS" : "NOT_STARTED",
      evaluationMode: "PROGRESSION",
    },
    steps,
  };
}

/** Instructor: suggested titles for publishing draft placeholder levels. */
export function buildInstructorMockLevelPublishDraft(order: MockLevelOrder) {
  return {
    title: `Level ${order} — ${MOCK_LEVEL_TITLES[order]}`,
    slug: `reading-level-${order}-full-mock`,
    levelType: "SKILL" as const,
    difficulty: order >= 19 ? "advanced" : "intermediate",
    description:
      "Placeholder level shell for Gamlish launch. Student UI shows Coming Soon until mock JSON is uploaded.",
    placeholderSteps: buildMockLevelPlaceholderSteps(order).map((s) => s.title),
  };
}
