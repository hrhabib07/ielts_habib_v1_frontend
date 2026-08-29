export interface WritingRejectionPreset {
  id: string;
  label: string;
  score: number;
  feedback: string;
}

/** One-click reject reasons for M21 Final Pitch. Score must stay below pass mark (6). */
export const WRITING_REJECTION_PRESETS: WritingRejectionPreset[] = [
  {
    id: "ai_content",
    label: "Reject · AI-written",
    score: 0,
    feedback:
      "This submission reads like AI-generated text (for example ChatGPT). Gamlish requires your own honest words about your real journey. Please rewrite completely in your own voice, without using AI tools. Submissions that look AI-written will not pass.",
  },
  {
    id: "not_personal",
    label: "Reject · not personal enough",
    score: 2,
    feedback:
      "Your writing is too generic and does not sound like your real story. Please rewrite with specific details from your own life: real challenges, real progress, and real goals. Copy-paste or template-style answers cannot pass.",
  },
  {
    id: "off_topic",
    label: "Reject · off topic",
    score: 3,
    feedback:
      "Your paragraph does not properly answer the topic you chose. Please read the prompt again and rewrite one clear paragraph that follows the topic instructions.",
  },
  {
    id: "too_short",
    label: "Reject · too short / weak",
    score: 4,
    feedback:
      "Your paragraph is too short or too weak for the Final Pitch. Please write 120-150 words with full sentences and enough detail to show your real English level.",
  },
  {
    id: "needs_rewrite",
    label: "Ask rewrite (borderline)",
    score: 5,
    feedback:
      "You are close, but this needs another honest rewrite before it can pass. Improve clarity, add personal detail, and make sure every sentence is your own work.",
  },
];
