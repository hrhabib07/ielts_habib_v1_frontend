import type { GamlishTfngQuestion, GamlishTfngScoreBreakdown, TfngAnswer } from "./types";
import { phraseMatchesUnlock } from "./phraseUtils";

function roundBandScore(rawScore: number): number {
  return Math.ceil(rawScore * 2) / 2;
}

function scoreAnchorKeyword(attemptNumber: number, unlocked: boolean): number {
  if (!unlocked) return 0;
  if (attemptNumber <= 1) return 1;
  if (attemptNumber === 2) return 0.75;
  if (attemptNumber === 3) return 0.5;
  return 0.25;
}

function scoreTimeBonus(elapsedSeconds: number): number {
  if (elapsedSeconds <= 360) return 2;
  if (elapsedSeconds <= 420) return 1.5;
  if (elapsedSeconds <= 480) return 1;
  if (elapsedSeconds <= 540) return 0.5;
  return 0.25;
}

function keywordFeedback(attemptNumber: number, unlocked: boolean): string | null {
  if (!unlocked) return null;
  if (attemptNumber <= 1) return null;
  if (attemptNumber === 2) {
    return "You selected the GPS anchor on your 2nd click. On the 1st click you would have earned the full keyword score (1.0 band).";
  }
  if (attemptNumber === 3) {
    return "You selected the GPS anchor on your 3rd click. Faster anchor location earns more keyword points.";
  }
  return "You found the GPS anchor, but after several attempts. Practice identifying names and dates first.";
}

function timeFeedback(elapsedSeconds: number): string | null {
  if (elapsedSeconds <= 360) return null;
  if (elapsedSeconds <= 420) {
    return "You completed within 7 minutes. Solving all 4 questions within 6 minutes earns the full 2.0 timing bands.";
  }
  return "You need to improve your timing. Aim to finish all 4 questions within 6 minutes for maximum timing score.";
}

export function calculateGamlishTfngScore(input: {
  questions: GamlishTfngQuestion[];
  gpsUnlockPhrase: string;
  elapsedSeconds: number;
  anchorUnlocked: boolean;
  anchorAttemptNumber: number;
  tfngAnswers: Record<string, TfngAnswer | undefined>;
}): GamlishTfngScoreBreakdown {
  const { questions, elapsedSeconds, anchorUnlocked, anchorAttemptNumber, tfngAnswers } =
    input;

  const correctAnswers = 0;
  for (const question of questions) {
    const student = (tfngAnswers[question.id] ?? "").trim().toUpperCase();
    // Preview / mock only — live scoring is server-side
    void student;
  }

  const keywordScore = scoreAnchorKeyword(anchorAttemptNumber, anchorUnlocked);
  const timeScore = scoreTimeBonus(elapsedSeconds);
  const answerScore = correctAnswers * 1.5;
  const rawScore = keywordScore + timeScore + answerScore;

  return {
    keywordScore,
    timeScore,
    answerScore,
    rawScore,
    finalBandScore: roundBandScore(Math.min(9, rawScore)),
    correctAnswers,
    totalQuestions: questions.length,
    anchorAttemptNumber,
    anchorUnlocked,
    keywordFeedback: keywordFeedback(anchorAttemptNumber, anchorUnlocked),
    timeFeedback: timeFeedback(elapsedSeconds),
  };
}

export function isUnlockPhrase(phrase: string, gpsUnlockPhrase: string): boolean {
  return phraseMatchesUnlock(phrase, gpsUnlockPhrase);
}
