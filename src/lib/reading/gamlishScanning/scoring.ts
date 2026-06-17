import type {
  AnswerPick,
  ClickedKeyword,
  GamlishErrorFeedback,
  GamlishQuestion,
  GamlishScanningScoreBreakdown,
  GamlishScanningTestData,
  SentenceBoundary,
} from "./types";
import { normalizeToken, tokenMatchesKeyword } from "./passageText";

const ERROR_MESSAGES = {
  SEQUENCE_BREAK:
    "You broke the Golden Rule of scanning! Question 2 must always appear between Question 1 and Question 3.",
  KEYWORD_MISMATCH:
    "Your keyword targeting is off. Always look for the strong Locator Clues (dates/names) first, then highlight the action words.",
  PARTIAL_MATCH_TRAP:
    "You fell for a vocabulary trap! You found the Locator Clue, but the rest of the sentence does not match the prompt.",
} as const;

function roundBandScore(rawScore: number): number {
  return Math.ceil(rawScore * 2) / 2;
}

function scoreTimeBonus(elapsedSeconds: number): number {
  if (elapsedSeconds <= 180) return 0.75;
  if (elapsedSeconds <= 300) return 0.5;
  return 0.25;
}

function isKeywordCorrectForQuestion(
  question: GamlishQuestion,
  token: string,
): boolean {
  return question.targetKeywords.some((keyword) =>
    tokenMatchesKeyword(token, keyword),
  );
}

function isStrongLocatorForQuestion(
  question: GamlishQuestion,
  token: string,
): boolean {
  if (!question.strongLocator) return false;
  return tokenMatchesKeyword(token, question.strongLocator);
}

function scoreKeywordBonus(
  questions: GamlishQuestion[],
  clickedKeywords: ClickedKeyword[],
): number {
  const correctKeywords = clickedKeywords.filter((click) => {
    const question = questions.find((q) => q.id === click.questionId);
    return question ? isKeywordCorrectForQuestion(question, click.token) : false;
  });

  const correctCount = correctKeywords.length;

  const hasQ1Locator = clickedKeywords.some((click) => {
    if (click.questionId !== "q1") return false;
    const q1 = questions.find((q) => q.id === "q1");
    return q1 ? isStrongLocatorForQuestion(q1, click.token) : false;
  });

  const hasQ3Locator = clickedKeywords.some((click) => {
    if (click.questionId !== "q3") return false;
    const q3 = questions.find((q) => q.id === "q3");
    return q3 ? isStrongLocatorForQuestion(q3, click.token) : false;
  });

  const locatorCount = (hasQ1Locator ? 1 : 0) + (hasQ3Locator ? 1 : 0);

  if (correctCount >= 3 && hasQ1Locator && hasQ3Locator) return 0.75;
  if (locatorCount >= 1 && locatorCount <= 2) return 0.5;
  if (correctCount === 0) return 0.25;
  return 0.5;
}

function getFeedbackMessage(finalBandScore: number): string {
  if (finalBandScore >= 8.5) {
    return "Elite scanner! You read like a Band 9 candidate: precise, fast, and fearless.";
  }
  if (finalBandScore >= 7.5) {
    return "Outstanding work! Your locator instincts and sentence precision are exam-ready.";
  }
  if (finalBandScore >= 6.5) {
    return "Strong performance! You are building real IELTS scanning muscle. Keep sharpening those locators.";
  }
  if (finalBandScore >= 5.5) {
    return "Solid progress! You found key areas in the text. A little more precision will push you higher.";
  }
  if (finalBandScore >= 4.5) {
    return "Good effort! Gamlish rewards every attempt. Refine your keyword strategy and try again.";
  }
  return "Brave start! Every master scanner began here. Highlight your locators first, then lock each answer in order.";
}

function detectErrors(
  data: GamlishScanningTestData,
  boundaries: SentenceBoundary[],
  clickedKeywords: ClickedKeyword[],
  answers: Record<string, AnswerPick | undefined>,
): GamlishErrorFeedback[] {
  const errors: GamlishErrorFeedback[] = [];
  const orderById = new Map(boundaries.map((b) => [b.id, b.orderIndex]));

  const q1Answer = answers.q1;
  const q2Answer = answers.q2;
  const q3Answer = answers.q3;

  if (q1Answer && q2Answer && q3Answer) {
    const q1Order = orderById.get(q1Answer.sentenceId) ?? -1;
    const q2Order = orderById.get(q2Answer.sentenceId) ?? -1;
    const q3Order = orderById.get(q3Answer.sentenceId) ?? -1;
    if (q2Order > q3Order || q2Order < q1Order) {
      errors.push({
        tag: "SEQUENCE_BREAK",
        message: ERROR_MESSAGES.SEQUENCE_BREAK,
      });
    }
  }

  let hasKeywordMismatch = false;
  for (const click of clickedKeywords) {
    const question = data.questions.find((q) => q.id === click.questionId);
    if (!question) continue;
    if (!isKeywordCorrectForQuestion(question, click.token)) {
      hasKeywordMismatch = true;
      break;
    }
  }
  if (hasKeywordMismatch) {
    errors.push({
      tag: "KEYWORD_MISMATCH",
      message: ERROR_MESSAGES.KEYWORD_MISMATCH,
    });
  }

  for (const question of data.questions) {
    if (!question.strongLocator) continue;
    const pick = answers[question.id];
    if (!pick) continue;
    if (pick.sentenceId === question.correctSentenceId) continue;

    const boundary = boundaries.find((b) => b.id === pick.sentenceId);
    const locatorNorm = normalizeToken(question.strongLocator);
    const sentenceHasLocator =
      boundary != null &&
      normalizeToken(boundary.text).includes(locatorNorm);

    if (sentenceHasLocator) {
      errors.push({
        tag: "PARTIAL_MATCH_TRAP",
        message: ERROR_MESSAGES.PARTIAL_MATCH_TRAP,
      });
      break;
    }
  }

  return errors;
}

export function calculateGamlishScanningScore(input: {
  data: GamlishScanningTestData;
  boundaries: SentenceBoundary[];
  elapsedSeconds: number;
  clickedKeywords: ClickedKeyword[];
  answers: Record<string, AnswerPick | undefined>;
}): GamlishScanningScoreBreakdown {
  const { data, boundaries, elapsedSeconds, clickedKeywords, answers } = input;

  let correctAnswers = 0;
  for (const question of data.questions) {
    const pick = answers[question.id];
    if (pick && pick.sentenceId === question.correctSentenceId) {
      correctAnswers += 1;
    }
  }

  const metricA = correctAnswers * 2.5;
  const metricB = scoreTimeBonus(elapsedSeconds);
  const metricC = scoreKeywordBonus(data.questions, clickedKeywords);
  const rawScore = metricA + metricB + metricC;
  const finalBandScore = roundBandScore(rawScore);
  const errors = detectErrors(data, boundaries, clickedKeywords, answers);

  return {
    metricA,
    metricB,
    metricC,
    rawScore,
    finalBandScore,
    correctAnswers,
    totalQuestions: data.questions.length,
    feedbackMessage: getFeedbackMessage(finalBandScore),
    errors,
  };
}
