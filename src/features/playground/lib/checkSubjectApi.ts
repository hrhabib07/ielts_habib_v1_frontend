import apiClient from "@/src/lib/api-client";
import type { TalkItem } from "@/src/features/playground/types";

export type SubjectCheckResponse =
  | { verdict: "accepted"; subject: string; plural: boolean }
  | { verdict: "rejected"; reason: string }
  | { verdict: "unavailable" };

/** Slightly longer than the server's own AI budget, so the server can answer "unavailable" itself. */
const CLIENT_TIMEOUT_MS = 9000;

function frameText(item: TalkItem): string {
  const { subjectTail, verb, after } = item.frame;
  return ["___", subjectTail, verb?.one, after].filter(Boolean).join(" ");
}

/** Asks the server (learned answers first, then AI) whether a typed Subject fits. Never throws. */
export async function checkSubjectAnswer(
  playgroundId: string,
  item: TalkItem,
  answer: string,
): Promise<SubjectCheckResponse> {
  try {
    const res = await apiClient.post<{ data?: SubjectCheckResponse }>(
      "/playground/subject-check",
      {
        playgroundId,
        questionId: item.id,
        question: item.question.en,
        frame: frameText(item),
        accepts: item.accepts,
        allowSelf: item.allowSelf,
        answer,
      },
      { timeout: CLIENT_TIMEOUT_MS },
    );
    return res.data.data ?? { verdict: "unavailable" };
  } catch {
    return { verdict: "unavailable" };
  }
}
