import type { BulkQuestionGroupInput } from "./strictReadingBulkUtils";

/**
 * Instructor / AI reference: how to author SUMMARY_COMPLETION_WITH_CLUES in bulk JSON.
 * Paste into __instructions when generating payloads with an LLM.
 */
export const SUMMARY_COMPLETION_WITH_CLUES_BULK_SPEC = `
SUMMARY_COMPLETION_WITH_CLUES (IELTS — summary + word bank, drag-and-drop)

STRUCTURE
• One questionGroup with questionType exactly: "SUMMARY_COMPLETION_WITH_CLUES".
• meta.options = string[] word bank. Include every correct answer plus distractors (IELTS-style).
• Each string in correctAnswer (per blank) must match one entry in meta.options exactly (same spelling/case).

COUNTS
• expectedTotalQuestions = TOTAL GAPS across the whole group (not the length of questions[]).
• The importer counts: for each questions[] item, blanks.length (or 1 if no blanks). Sum must equal
  (endQuestionNumber - startQuestionNumber + 1).

MULTI-SENTENCE BLOCKS (recommended)
• Each element of questions[] is ONE summary block (like one paragraph in the exam).
• questionBody.layout is always "TEXT".
• questionBody.content = several sentences separated by blank lines using \\n\\n (paragraph breaks).
• Placeholders must appear in reading order: {{gap1}}, {{gap2}}, {{gap3}}, …
• Gap numbers are GLOBAL for the group: if block A uses three gaps, block B continues with {{gap4}}, etc.
• blanks[] on that item lists every gap in this block only, with id matching the number inside {{gapN}}.

TYPICAL IELTS SHAPE (7 gaps total)
• questions[0]: 3 sentences / 3 gaps ({{gap1}}–{{gap3}})
• questions[1]: 2–3 sentences / 2 gaps ({{gap4}}–{{gap5}})
• questions[2]: 2–3 sentences / 2 gaps ({{gap6}}–{{gap7}})

WORD LIMIT
• meta.wordLimit = max words per gap (often 1 for “ONE WORD ONLY”).
• Each blank may repeat wordLimit; must stay consistent with instruction text.
`.trim();

/** Split total gap count into blocks of 2–3 gaps (IELTS-style paragraphs). */
export function allocateSummaryWithCluesGapChunks(totalGaps: number): number[] {
  if (totalGaps < 1) return [];
  const chunks: number[] = [];
  let r = totalGaps;
  while (r > 0) {
    if (r >= 6) {
      chunks.push(3);
      r -= 3;
    } else if (r === 5) {
      chunks.push(3, 2);
      r = 0;
    } else if (r === 4) {
      chunks.push(2, 2);
      r = 0;
    } else if (r === 3) {
      chunks.push(3);
      r = 0;
    } else if (r === 2) {
      chunks.push(2);
      r = 0;
    } else {
      chunks.push(1);
      r -= 1;
    }
  }
  return chunks;
}

function buildBlockPlaceholderContent(blockIndex: number, gapIds: number[]): string {
  const n = gapIds.length;
  const head = [
    `Summary block ${blockIndex + 1} — replace this lead sentence with your own paraphrase of the passage.`,
    `Add one or two more plain sentences that set context (no gaps in these lines if you prefer).`,
  ];
  const body: string[] = [];
  if (n === 1) {
    body.push(`The writer’s main point is that {{gap${gapIds[0]}}} matters most for the argument.`);
  } else {
    body.push(
      `The early discussion shows that {{gap${gapIds[0]}}} was especially important at the start.`,
    );
    if (n === 2) {
      body.push(`Later sections stress {{gap${gapIds[1]}}} as the decisive factor.`);
    } else {
      for (let i = 1; i < n - 1; i++) {
        body.push(
          `This connects to {{gap${gapIds[i]}}}, which explains the middle phase of the process.`,
        );
      }
      body.push(
        `Overall, the passage suggests {{gap${gapIds[n - 1]}}} as the strongest conclusion.`,
      );
    }
  }
  return [...head, ...body].join("\n\n");
}

/**
 * Builds questions[] for a single SUMMARY_COMPLETION_WITH_CLUES group with `totalGaps` scored slots.
 */
export function buildSummaryWithCluesBulkQuestionItems(
  totalGaps: number,
  wordLimit: number,
  wordBank: string[],
): BulkQuestionGroupInput["questions"] {
  const bank =
    wordBank.length >= 2 ? wordBank : ["alpha", "beta", "gamma", "delta", "epsilon", "zeta"];
  const chunks = allocateSummaryWithCluesGapChunks(totalGaps);
  let gapCounter = 0;

  return chunks.map((chunkSize, blockIdx) => {
    const gapIds = Array.from({ length: chunkSize }, (_, j) => gapCounter + j + 1);
    gapCounter += chunkSize;
    const content = buildBlockPlaceholderContent(blockIdx, gapIds);
    const blanks = gapIds.map((gid, i) => ({
      id: gid,
      correctAnswer: bank[(gid - 1) % bank.length] ?? `answer${gid}`,
      wordLimit,
    }));
    return {
      questionBody: { layout: "TEXT" as const, content },
      blanks,
      explanation: `Block ${blockIdx + 1}: ${chunkSize} gap(s). correctAnswer strings must appear in meta.options (word bank).`,
    };
  });
}
