import type { Bilingual } from "@/src/features/chat-lesson/types";
import type {
  AnswerResult,
  AskFirstItem,
  HiddenYouItem,
  StretchItem,
} from "@/src/features/playground/types";

export function sentenceOf(words: readonly string[]): string {
  return words.join(" ");
}

/** "cricket." becomes "cricket"; used when a word is quoted inside feedback. */
export function bareWord(word: string): string {
  return word.replace(/[.,!?]+$/, "");
}

export function stretchSubject(item: StretchItem): string {
  return bareWord(item.words.slice(0, item.subjectEnd + 1).join(" "));
}

export function evaluateAskFirst(item: AskFirstItem, picked: number): AnswerResult {
  const subject = bareWord(item.words[item.subject] ?? "");
  const answer: Bilingual = {
    en: `${item.question.en} **${subject}**. So **${subject}** is the Subject.`,
    bn: `${item.question.bn} উত্তর: **${subject}**। তাই **${subject}** হলো Subject।`,
  };
  if (picked === item.subject) return { correct: true, body: answer };
  const hint =
    item.trap?.index === picked
      ? item.trap.hint
      : { en: `Ask: ${item.question.en}`, bn: `প্রশ্ন করুন: ${item.question.bn}` };
  return { correct: false, hint, reveal: answer };
}

export function evaluateStretch(item: StretchItem, end: number): AnswerResult {
  const subject = stretchSubject(item);
  const compound: Bilingual = item.compound
    ? {
        en: " Joined with and, they make one Compound Subject.",
        bn: " and দিয়ে যুক্ত হয়ে এরা একটি Compound Subject তৈরি করেছে।",
      }
    : { en: "", bn: "" };

  if (end === item.subjectEnd) {
    return {
      correct: true,
      body: {
        en: `The whole Subject is **${subject}**.${compound.en}`,
        bn: `পুরো Subject হলো **${subject}**।${compound.bn}`,
      },
    };
  }

  const reveal: Bilingual = {
    en: `${item.question.en} **${subject}**. That whole group is the Subject.${compound.en}`,
    bn: `${item.question.bn} উত্তর: **${subject}**। পুরো অংশটাই Subject।${compound.bn}`,
  };

  if (end < item.subjectEnd) {
    return {
      correct: false,
      hint: item.shortHint ?? {
        en: `Almost! Ask: ${item.question.en} Keep stretching.`,
        bn: `প্রায় হয়েছে! প্রশ্ন করুন: ${item.question.bn} আরও টানুন।`,
      },
      reveal,
    };
  }

  const action = bareWord(item.words[item.subjectEnd + 1] ?? "");
  return {
    correct: false,
    hint: {
      en: `Too far! **${action}** is the action, not the Subject.`,
      bn: `বেশি হয়ে গেছে! **${action}** হলো কাজ, Subject নয়।`,
    },
    reveal,
  };
}

export const HIDDEN = "you" as const;
export type HiddenYouPick = number | typeof HIDDEN;

export function evaluateHiddenYou(item: HiddenYouItem, picked: HiddenYouPick): AnswerResult {
  if (item.subject === undefined) {
    const reveal: Bilingual = {
      en: "This sentence tells someone to do something. The hidden Subject is **You**.",
      bn: "এই বাক্যে কাউকে কিছু করতে বলা হচ্ছে। তাই লুকানো Subject হলো **You**।",
    };
    if (picked === HIDDEN) return { correct: true, body: reveal };
    const hint =
      item.trap?.index === picked
        ? item.trap.hint
        : {
            en: "This sentence tells someone to do something. Who is being told?",
            bn: "এই বাক্যে কাউকে কিছু করতে বলা হচ্ছে। কাকে বলা হচ্ছে?",
          };
    return { correct: false, hint, reveal };
  }

  const subject = bareWord(item.words[item.subject] ?? "");
  const written: Bilingual = {
    en: `The Subject is written here: **${subject}**.`,
    bn: `এখানে Subject লেখা আছে: **${subject}**।`,
  };
  if (picked === item.subject) return { correct: true, body: written };
  const hint: Bilingual =
    picked === HIDDEN
      ? { en: "Look again! The Subject is written in this sentence.", bn: "আবার দেখুন! এই বাক্যে Subject লেখা আছে।" }
      : { en: "Ask: Who or what does the action?", bn: "প্রশ্ন করুন: কাজটি কে বা কী করে?" };
  return { correct: false, hint, reveal: written };
}
