import type { ChatLessonStep, LessonChunk } from "@/src/features/chat-lesson/types";

/** Merged into Start Here (`introStep.ts`); the old standalone step is kept as a draft. */
export const LEVEL1_OVERVIEW_STEP: ChatLessonStep = {
  id: "level-1-step-2-overview",
  missionLabel: "Level 1",
  stepLabel: "Step 2",
  title: { en: "What will you learn in Level 1?", bn: "লেভেল 1-এ কী শিখবেন?" },
  guideName: "Gamlish Guide",
  status: "draft",
  chunks: [
    {
      id: "basics",
      title: { en: "Start from the basics", bn: "বেসিক থেকে শুরু" },
      messages: [
        {
          en: "Let's start building your English from the **basics**, {name}!",
          bn: "{name}, চলুন, ইংরেজি শেখার শুরুটা বেসিক থেকেই করি!",
        },
        {
          en: "In Level 1, you will discover **how English sentences work**.",
          bn: "লেভেল 1-এ আপনি শিখবেন ইংরেজি বাক্য কীভাবে তৈরি হয়।",
        },
        {
          en: "You will start with simple concepts, learn how to put words together, and practise making **correct English sentences** step by step.",
          bn: "সহজ বিষয় দিয়ে শুরু করে ধাপে ধাপে শব্দ সাজিয়ে সঠিক ইংরেজি বাক্য তৈরি করতে শিখবেন।",
        },
      ],
      questions: [
        {
          id: "q-level1-make",
          prompt: {
            en: "What will you learn to make in Level 1?",
            bn: "লেভেল 1-এ আপনি কী তৈরি করতে শিখবেন?",
          },
          options: [
            { id: "a", label: "A", text: { en: "Correct English sentences", bn: "সঠিক ইংরেজি বাক্য" } },
            { id: "b", label: "B", text: { en: "Long English stories", bn: "লম্বা ইংরেজি গল্প" } },
            { id: "c", label: "C", text: { en: "Advanced English essays", bn: "অ্যাডভান্সড ইংরেজি রচনা" } },
          ],
          correctOptionId: "a",
          praise: { en: "Correct, {name}!", bn: "সঠিক, {name}!" },
          hint: {
            en: "Think small: Level 1 is about the basics, not long writing.",
            bn: "ছোট করে ভাবুন: লেভেল 1 বেসিক নিয়ে, লম্বা লেখা নিয়ে নয়।",
          },
          explanation: {
            en: "In Level 1, you learn how to put words together and make correct English sentences step by step.",
            bn: "লেভেল 1-এ আপনি শব্দ সাজিয়ে ধাপে ধাপে সঠিক ইংরেজি বাক্য তৈরি করতে শিখবেন।",
          },
        },
      ],
    },
    {
      id: "topics",
      title: { en: "Your Level 1 map", bn: "আপনার লেভেল 1-এর ম্যাপ" },
      messages: [
        {
          en: "{name}, Mission 1 teaches how English sentences work. Topics:",
          bn: "{name}, মিশন 1-এ শিখবেন ইংরেজি বাক্য কীভাবে তৈরি হয়। টপিকগুলো:",
          items: [
            {
              term: "Subject",
              termBn: "কর্তা",
              en: "Who or what does the action?",
              bn: "কাজটি কে বা কী করছে?",
            },
            {
              term: "Number & Person",
              termBn: "বচন ও পুরুষ",
              en: "One or many? I / you / he…",
              bn: "এক না অনেক? I / you / he…",
            },
            {
              term: "Verb · Object · Word Order",
              termBn: "ক্রিয়া · কর্ম · শব্দের ক্রম",
              en: "Action, receiver, and English order.",
              bn: "কাজ, গ্রহীতা, আর ইংরেজি শব্দ সাজানো।",
            },
          ],
        },
        {
          en: "On each topic: **short note → matching game → next note**. Finish with the **Mission 1 Final Test**.",
          bn: "প্রতিটি টপিকে: **ছোট নোট → মিলিয়ে গেম → পরের নোট**। শেষে **মিশন 1 ফাইনাল টেস্ট**।",
        },
        {
          en: "When you finish Start Here, tap **Subject** on the map. That is your clear next step.",
          bn: "Start Here শেষ হলে ম্যাপে **Subject** ট্যাপ করুন। এটাই আপনার পরের ধাপ।",
        },
      ],
      questions: [
        {
          id: "q-mission1-next",
          prompt: {
            en: "After Start Here, what should you open first?",
            bn: "Start Here-এর পর প্রথমে কী খুলবেন?",
          },
          options: [
            { id: "a", label: "A", text: { en: "Subject", bn: "Subject" } },
            {
              id: "b",
              label: "B",
              text: { en: "Mission 1 Final Test", bn: "মিশন 1 ফাইনাল টেস্ট" },
            },
            { id: "c", label: "C", text: { en: "Level 21", bn: "লেভেল 21" } },
          ],
          correctOptionId: "a",
          praise: { en: "Perfect, {name}!", bn: "দারুণ, {name}!" },
          hint: {
            en: "The first English topic on the map.",
            bn: "ম্যাপের প্রথম ইংরেজি টপিক।",
          },
          explanation: {
            en: "After Start Here, open Subject. Learn a little, play, then continue.",
            bn: "Start Here-এর পর Subject খুলুন। একটু শিখুন, খেলুন, তারপর এগোন।",
          },
        },
      ],
    },
  ],
};

/** The "Your Level 1 map" part, reused as the last part of Start Here. */
export const LEVEL1_MAP_CHUNK: LessonChunk = LEVEL1_OVERVIEW_STEP.chunks.find((chunk) => chunk.id === "topics") ?? {
  id: "topics",
  title: { en: "Your Level 1 map", bn: "আপনার লেভেল 1-এর ম্যাপ" },
  messages: [],
  questions: [],
};
