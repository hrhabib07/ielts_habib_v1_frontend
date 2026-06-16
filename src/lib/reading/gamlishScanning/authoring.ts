import type { GamlishScanningTestData } from "./types";

/** Instructor authoring sample — inner `gamlishScanning` object for Level 0 bulk/create forms. */
export const GAMLISH_SCANNING_AUTHORING_SAMPLE = {
  passageTitle: "The Evolution of Football: From Ancient Rituals to Global Phenomenon",
  briefing:
    "Mission: Locate the exact sentence in the passage that contains the information matching the statements below.",
  proTip:
    'IELTS Scanning questions always follow the sequence of the text. Look for the strong "Locator Keyword" (like a name or date) to find the right area, then check the paraphrased words to confirm you have the exact sentence!',
  paragraphs: [
    {
      id: "p1",
      sentences: [
        {
          id: "s1",
          text: "The historical trajectory of association football reveals a fascinating journey from fragmented ancient rituals to a universally standardized sport.",
        },
        {
          id: "s2",
          text: "Early variations of the game were played across diverse ancient civilizations, though these preliminary contests lacked unified boundaries or universally accepted codes of conduct.",
        },
      ],
    },
    {
      id: "p2",
      sentences: [
        {
          id: "s3",
          text: "During the medieval period in Europe, the activity often resembled chaotic, village-wide brawls rather than a structured athletic competition.",
        },
        {
          id: "s4",
          text: "The pivotal moment for the sport's formalization occurred in 1863, when various regional associations unified to establish a codified set of regulations.",
        },
      ],
    },
    {
      id: "p3",
      sentences: [
        {
          id: "s5",
          text: "With a universal framework in place, the sport's popularity exploded across industrial urban centers.",
        },
        {
          id: "s6",
          text: "Consequently, what began as a recreational pursuit rapidly transformed into a highly structured commercial enterprise, drawing massive crowds of paying spectators.",
        },
      ],
    },
    {
      id: "p4",
      sentences: [
        {
          id: "s8",
          text: "As the sport transcended national borders at the turn of the 20th century, a central governing body became essential to facilitate global competition.",
        },
        {
          id: "s9",
          text: "The establishment of FIFA was primarily driven by the urgent need to oversee and regulate the surging number of international fixtures.",
        },
      ],
    },
  ],
  questions: [
    {
      id: "q1",
      label: "Q1",
      order: 1,
      questionStatement:
        "The critical turning point for the game's standardization happened in 1863 as different local groups came together to create a single rulebook.",
      targetKeywords: ["standardization", "1863", "single", "rulebook"],
      strongLocator: "1863",
      correctSentenceId: "s4",
      locatorSentenceIds: ["s4", "s3"],
    },
    {
      id: "q2",
      label: "Q2",
      order: 2,
      questionStatement:
        "As a result, the casual pastime quickly evolved into a profitable business that attracted enormous numbers of ticket-buying fans.",
      targetKeywords: ["casual", "pastime", "profitable", "business", "ticket-buying", "fans"],
      strongLocator: null,
      correctSentenceId: "s6",
      locatorSentenceIds: [],
    },
    {
      id: "q3",
      label: "Q3",
      order: 3,
      questionStatement:
        "The creation of FIFA was mainly motivated by the pressing requirement to manage and control the increasing volume of cross-border matches.",
      targetKeywords: ["creation", "FIFA", "cross-border", "matches"],
      strongLocator: "FIFA",
      correctSentenceId: "s9",
      locatorSentenceIds: ["s9", "s8"],
    },
  ],
} as const;

export const GAMLISH_SCANNING_SESSION_QUESTION_ID = "gamlish_scanning_session";

export interface GamlishScanningStudentPayload {
  passageTitle: string;
  briefing: string;
  proTip: string;
  paragraphs: Array<{
    id: string;
    sentences: Array<{ id: string; text: string }>;
  }>;
  questions: Array<{
    id: string;
    label: string;
    order: number;
    questionStatement: string;
  }>;
}

export function mapStudentPayloadToTestData(
  title: string,
  payload: GamlishScanningStudentPayload,
): GamlishScanningTestData {
  return {
    title,
    passageTitle: payload.passageTitle,
    briefing: payload.briefing,
    proTip: payload.proTip,
    paragraphs: payload.paragraphs,
    questions: [...payload.questions]
      .sort((a, b) => a.order - b.order)
      .map((question) => ({
        id: question.id,
        label: question.label,
        questionStatement: question.questionStatement,
        targetKeywords: [],
        strongLocator: null,
        correctSentenceId: "",
        locatorSentenceIds: [],
      })),
  };
}

export function buildGamlishScanningSessionAnswer(input: {
  elapsedSeconds: number;
  clickedKeywords: Array<{ questionId: string; wordIndex: number; token: string }>;
  answers: Record<
    string,
    | {
        questionId: string;
        sentenceId: string;
        start: number;
        end: number;
        text: string;
      }
    | undefined
  >;
}): string {
  const answers: Record<
    string,
    {
      questionId: string;
      sentenceId: string;
      start: number;
      end: number;
      text: string;
    }
  > = {};
  for (const [questionId, pick] of Object.entries(input.answers)) {
    if (pick) answers[questionId] = pick;
  }
  return JSON.stringify({
    elapsedSeconds: input.elapsedSeconds,
    clickedKeywords: input.clickedKeywords,
    answers,
  });
}
