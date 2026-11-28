import type { ErrorTag } from "@/src/lib/listening-spelling/types";

export const ERROR_TAG_BN: Record<ErrorTag, string> = {
  missed_ending: "শেষের -s/-ed/-ing বাদ পড়েছে",
  double_letter: "দুটি একই অক্ষর (double letter) ভুল",
  silent_letter: "নীরব অক্ষর (silent letter) বাদ",
  phonetic_guess: "শুনে আন্দাজে বানান",
  vowel_cluster: "স্বরবর্ণের (a/e/i/o/u) ভুল",
  skipped_letter: "একটি অক্ষর বাদ পড়েছে",
  extra_letter: "বাড়তি অক্ষর",
  wrong_letter: "ভুল অক্ষর",
  hold_failure: "শুরু ঠিক, মাঝপথে হারিয়ে ফেলা",
  letter_confusion: "অক্ষরের নাম গুলিয়ে ফেলা (যেমন G/J)",
  number_confusion: "-teen / -ty গুলিয়ে ফেলা",
  homophone: "একই উচ্চারণের অন্য শব্দ",
  format: "ফরম্যাট (হাইফেন/স্পেস)",
  slip: "টাইপিং ভুল",
  other: "অন্যান্য",
};

export const ERROR_TAG_EN_TIP: Record<ErrorTag, string> = {
  missed_ending: "Listen for the ending sound, then write -s, -es, -ed, or -ing.",
  double_letter: "Say the word slowly and check for double letters.",
  silent_letter: "Some letters are silent in speech but must still be written.",
  phonetic_guess: "Do not write only what you hear. Check the real spelling.",
  vowel_cluster: "Watch vowel groups (ea, ie, ou, ai).",
  skipped_letter: "One letter is missing. Compare letter by letter.",
  extra_letter: "There is an extra letter. Compare letter by letter.",
  wrong_letter: "One letter is wrong. Find the first mismatch.",
  hold_failure: "Hold the whole word in memory before typing.",
  letter_confusion: "Confusable letter names (G/J, B/V, M/N).",
  number_confusion: "Check stress: thirTEEN vs THIRty.",
  homophone: "Same sound, different spelling. Pick the exam word.",
  format: "Watch hyphens and spaces.",
  slip: "Likely a typing slip. Slow down one beat.",
  other: "Compare your answer with the correct spelling carefully.",
};
