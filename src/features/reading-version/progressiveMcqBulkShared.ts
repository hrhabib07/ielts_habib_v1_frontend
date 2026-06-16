import type { ProgressiveMcqContentAuthoringPreview } from "@/src/lib/api/adminReadingVersions";

export const L5_PROGRESSIVE_MCQ_INSTRUCTIONS =
  "Level 5 uses Progressive MCQ (context paragraph + question + options, one at a time). " +
  "Each practiceTests[] entry must include progressiveMcq. " +
  "Do not put skill labels like (Sentence Flip) in questionText — use logicType internally only.";

export type BulkL5ProgressiveMcqItem = {
  title?: string;
  timeLimitMinutes?: number;
  passType?: string;
  passValue?: number;
  maxAttempts?: number | null;
  progressiveMcq: ProgressiveMcqContentAuthoringPreview;
};

const PARAPHRASE_ENGINE_SAMPLE_ITEMS: ProgressiveMcqContentAuthoringPreview["items"] = [
  {
    id: "q1",
    order: 1,
    contextTitle: "Urban Development",
    contextText:
      "The city council decided to build a new public hospital in the center of town. This project was approved to deal with the sudden increase in local patients over the last five years.",
    questionText:
      'The passage mentions a sudden "increase" in patients. Which phrase below means exactly the same thing?',
    options: {
      A: "a rapid drop",
      B: "a sharp rise",
      C: "a slow change",
      D: "a steady flow",
    },
    correctOption: "B",
    logicType: "WORD_SWAP",
    explanation:
      'Gamlish Logic: This is a Level 1 Direct Word Swap. An "increase" means things go up. A "rise" also means things go up.',
  },
  {
    id: "q2",
    order: 2,
    contextTitle: "Charity and Community",
    contextText:
      "The wealthy businessman generously donated a million dollars to the local charity. This kind action provided the necessary funds to build a brand new high school for the village children.",
    questionText:
      'The passage states that the businessman "generously donated" money. How could this be rewritten using a different grammar structure?',
    options: {
      A: "made a generous donation of",
      B: "took a large payment of",
      C: "received a generous gift of",
      D: "forced a strict rule on",
    },
    correctOption: "A",
    logicType: "GRAMMAR_CHANGE",
    explanation:
      'Gamlish Logic: This is a Level 2 Grammar Change. The question uses an action verb ("generously donated"). Option A changes it to a noun phrase ("made a generous donation"). The meaning stays exactly the same!',
  },
  {
    id: "q3",
    order: 3,
    contextTitle: "Natural Disasters",
    contextText:
      "Heavy rainfall caused the terrible flood in the northern valley. As a result, emergency rescue teams had to work through the night to evacuate families from their damaged homes.",
    questionText:
      'The text says "Heavy rainfall caused the terrible flood". Which option gives the exact same meaning by flipping the sentence?',
    options: {
      A: "The terrible flood stopped the heavy rainfall.",
      B: "The terrible flood was caused by heavy rainfall.",
      C: "Heavy rainfall prevented the terrible flood.",
      D: "Emergency teams caused the heavy rainfall.",
    },
    correctOption: "B",
    logicType: "SENTENCE_FLIP",
    explanation:
      "Gamlish Logic: This is a Level 3 Sentence Flip. It changes from Active voice to Passive voice. The rain still caused the flood, but the order of the words is reversed.",
  },
  {
    id: "q4",
    order: 4,
    contextTitle: "Aviation Safety",
    contextText:
      "It is vital that all passengers keep their seatbelts fastened tightly during the entire flight. This simple safety rule saves many lives every single year during moments of severe turbulence.",
    questionText:
      'The writer describes wearing a seatbelt as "vital". What is another way to express this word?',
    options: {
      A: "completely optional",
      B: "highly unusual",
      C: "extremely important",
      D: "quite difficult",
    },
    correctOption: "C",
    logicType: "WORD_SWAP",
    explanation:
      'Gamlish Logic: This is a Level 1 Direct Word Swap. If a safety rule saves lives, it is very important. "Vital" is just an advanced word for important.',
  },
  {
    id: "q5",
    order: 5,
    contextTitle: "Scientific Breakthroughs",
    contextText:
      "After ten years of hard work in the laboratory, the young scientist successfully discovered a new type of medicine. This amazing breakthrough will help cure a very rare and dangerous tropical disease.",
    questionText:
      'The text mentions the scientist "successfully discovered" a medicine. Which phrase matches this meaning perfectly?',
    options: {
      A: "made a successful discovery of",
      B: "completely failed to find",
      C: "had a secret meeting about",
      D: "lost a successful report on",
    },
    correctOption: "A",
    logicType: "GRAMMAR_CHANGE",
    explanation:
      'Gamlish Logic: This is a Level 2 Grammar Change. The verb "successfully discovered" transforms into the noun phrase "made a successful discovery". This is one of Cambridge\'s favorite tricks!',
  },
  {
    id: "q6",
    order: 6,
    contextTitle: "Education and Arts",
    contextText:
      "The young student wrote the brilliant essay in just two short hours. The university professor was incredibly impressed by the high quality of the academic work.",
    questionText:
      'The passage states "The young student wrote the brilliant essay". How else could this be stated without changing the original meaning?',
    options: {
      A: "The brilliant essay was written by the young student.",
      B: "The university professor wrote the brilliant essay.",
      C: "The brilliant essay wrote about the young student.",
      D: "The young student read the brilliant essay.",
    },
    correctOption: "A",
    logicType: "SENTENCE_FLIP",
    explanation:
      "Gamlish Logic: This is a Level 3 Sentence Flip. The student is still the author, but the essay becomes the first subject of the sentence.",
  },
];

export function buildProgressiveMcqPracticeSamplePayload(options?: {
  itemCount?: number;
  testCount?: number;
  /** 1-based label for the first test in this payload (e.g. 2 when one test already exists). */
  startTestNumber?: number;
}): {
  __instructions: string;
  practiceTests: BulkL5ProgressiveMcqItem[];
} {
  const itemCount = options?.itemCount ?? 6;
  const testCount = Math.min(3, Math.max(1, options?.testCount ?? 1));
  const startTestNumber = Math.max(1, options?.startTestNumber ?? 1);
  const items = PARAPHRASE_ENGINE_SAMPLE_ITEMS.slice(0, itemCount);

  return {
    __instructions: L5_PROGRESSIVE_MCQ_INSTRUCTIONS,
    practiceTests: Array.from({ length: testCount }, (_, i) => {
      const testNumber = startTestNumber + i;
      return {
      title:
        testCount === 1 && testNumber === 1
          ? "Practice Test 1: The Paraphrase Engine (Easy Level)"
          : `Practice Test ${testNumber}: Paraphrase Engine`,
      timeLimitMinutes: 20,
      passType: "BAND",
      passValue: 0,
      maxAttempts: null,
      progressiveMcq: {
        instruction:
          "Read each short context, then choose the best answer. Questions appear one at a time.",
        reviewAfterEachAttempt: true,
        items: items.map((item, itemIdx) => ({
          ...item,
          id: `pt${testNumber}-q${itemIdx + 1}`,
          order: itemIdx + 1,
        })),
      },
    };
    }),
  };
}

export function normalizeL5ProgressiveMcqBulkInput(raw: unknown): unknown {
  if (raw == null) return raw;

  if (Array.isArray(raw)) {
    return { practiceTests: raw };
  }

  if (typeof raw !== "object") return raw;

  const obj = raw as Record<string, unknown>;

  if (Array.isArray(obj.practiceTests)) {
    return obj;
  }

  // Shorthand when adding one test: { title, progressiveMcq, ... } without practiceTests[].
  if (obj.progressiveMcq != null && typeof obj.progressiveMcq === "object" && !Array.isArray(obj.progressiveMcq)) {
    return { practiceTests: [obj] };
  }

  return obj;
}

export function validateL5ProgressiveMcqBulk(payload: unknown): { practiceTests: BulkL5ProgressiveMcqItem[] } {
  const normalized = normalizeL5ProgressiveMcqBulkInput(payload);
  if (!normalized || typeof normalized !== "object") throw new Error("Payload must be an object.");
  const p = normalized as { practiceTests?: unknown };
  if (!Array.isArray(p.practiceTests) || p.practiceTests.length < 1 || p.practiceTests.length > 3) {
    throw new Error(
      "Wrap each test in practiceTests (1–3 items). Example: { \"practiceTests\": [{ \"title\": \"...\", \"progressiveMcq\": { \"items\": [...] } }] }. You can also paste a single test object with title + progressiveMcq.",
    );
  }
  const out: BulkL5ProgressiveMcqItem[] = [];
  for (let i = 0; i < p.practiceTests.length; i++) {
    const item = p.practiceTests[i];
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`practiceTests[${i}] must be an object.`);
    }
    const t = item as Record<string, unknown>;
    const pm = t.progressiveMcq;
    if (!pm || typeof pm !== "object" || Array.isArray(pm)) {
      throw new Error(`practiceTests[${i}] must include "progressiveMcq" with items[].`);
    }
    const pmObj = pm as Record<string, unknown>;
    if (!Array.isArray(pmObj.items) || pmObj.items.length === 0) {
      throw new Error(`practiceTests[${i}].progressiveMcq.items must be a non-empty array.`);
    }
    out.push({
      title: typeof t.title === "string" ? t.title : undefined,
      timeLimitMinutes: typeof t.timeLimitMinutes === "number" ? t.timeLimitMinutes : undefined,
      passType: typeof t.passType === "string" ? t.passType : undefined,
      passValue: typeof t.passValue === "number" ? t.passValue : undefined,
      maxAttempts:
        t.maxAttempts === null
          ? null
          : typeof t.maxAttempts === "number"
            ? t.maxAttempts
            : undefined,
      progressiveMcq: pm as ProgressiveMcqContentAuthoringPreview,
    });
  }
  return { practiceTests: out };
}

export function safeJsonParse(raw: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}
