import type { GamlishTfngTestData, PhraseClick, TfngAnswer } from "./types";
import type { PracticeTestStepContentGamlishTfng } from "@/src/lib/api/readingStrictProgression";

export const GAMLISH_TFNG_SESSION_QUESTION_ID = "gamlish_tfng_session";

export function mapStudentPayloadToTestData(
  title: string,
  payload: PracticeTestStepContentGamlishTfng["gamlishTfng"],
): GamlishTfngTestData {
  return {
    title,
    passageTitle: payload.passageTitle,
    briefing: payload.briefing,
    proTip: payload.proTip,
    instruction: payload.instruction,
    paragraphs: payload.paragraphs,
    questions: [...payload.questions].sort((a, b) => a.order - b.order),
  };
}

export function buildGamlishTfngSessionAnswer(input: {
  elapsedSeconds: number;
  anchorUnlocked: boolean;
  anchorAttemptNumber: number;
  phraseClicks: PhraseClick[];
  tfngAnswers: Record<string, TfngAnswer | undefined>;
}): string {
  return JSON.stringify({
    elapsedSeconds: input.elapsedSeconds,
    anchorUnlocked: input.anchorUnlocked,
    anchorAttemptNumber: input.anchorAttemptNumber,
    phraseClicks: input.phraseClicks,
    tfngAnswers: input.tfngAnswers,
  });
}
