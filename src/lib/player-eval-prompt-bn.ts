/** Bangla labels for player evaluation prompts (English grammar terms kept where taught). */

const PROMPT_BN: Record<string, string> = {
  "What is the Subject?": "এই বাক্যের subject নিচের কোনটি?",
  "What is the Verb?": "এই বাক্যের verb নিচের কোনটি?",
  "What is the Object?": "এই বাক্যের object নিচের কোনটি?",
  "Number?": "Number কী?",
  "Person?": "Person কী?",
  "Who eats rice?": "কে ভাত খায়?",
  "What does Mina read?": "মিনা কী পড়ে?",
  "What do they play?": "তারা কী খেলে?",
  "What do birds build?": "পাখিরা কী বানায়?",
  "Who cooks rice?": "কে ভাত রান্না করে?",
  "Who writes letters?": "কে চিঠি লেখে?",
  "What do we plant?": "আমরা কী লাগাই?",
};

export function localizeEvalPrompt(prompt: string | undefined): string {
  if (!prompt) return "";
  return PROMPT_BN[prompt] ?? prompt;
}
